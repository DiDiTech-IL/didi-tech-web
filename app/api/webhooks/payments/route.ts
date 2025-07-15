"use server";
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

interface PaymentWebhook {
  orderId: string;
  status: 'completed' | 'failed' | 'pending';
  amount: number;
  currency: string;
  transactionId: string;
  metadata: {
    productId: string;
    planId: string;
    clientId: string;
    subdomain: string;
    couponCode?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-webhook-signature');

    // Verify webhook signature
    const webhookSecret = process.env.PAYPLUS_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const webhookData: PaymentWebhook = JSON.parse(body);
    const { orderId, status, transactionId, metadata } = webhookData;

    // Find the payment record
    const payment = await prisma.payment.findUnique({
      where: { id: orderId },
      include: {
        client: true,
        product: true,
        paymentPlan: true
      }
    });

    if (!payment) {
      console.error('Payment not found:', orderId);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: orderId },
      data: {
        status: status === 'completed' ? 'COMPLETED' : status === 'failed' ? 'FAILED' : 'PENDING',
        transactionId: transactionId
      }
    });

    if (status === 'completed') {
      // Create webhook log for successful payment
      await prisma.webhookLog.create({
        data: {
          endpoint: '/api/webhooks/payplus',
          method: 'POST',
          headers: Object.fromEntries(request.headers.entries()),
          body: JSON.parse(body),
          response: { status: 'success', orderId },
          status: 'completed',
          success: true,
          productId: metadata.productId
        }
      });

      // Trigger account creation webhook for the target application
      if (payment.product && payment.product.webhookUrl) {
        try {
          await fetch(payment.product.webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Secret': payment.product.webhookSecret || '',
              'X-Source': 'tachles-payment-system'
            },
            body: JSON.stringify({
              event: 'payment.completed',
              timestamp: new Date().toISOString(),
              data: {
                payment: {
                  id: payment.id,
                  amount: parseFloat(payment.amount.toString()),
                  currency: payment.currency,
                  status: 'completed',
                  transactionId: transactionId
                },
                customer: {
                  id: payment.client.id,
                  email: payment.client.email,
                  name: payment.client.name,
                  company: payment.client.company,
                  phone: payment.client.phone
                },
                product: {
                  id: payment.product.id,
                  name: payment.product.name
                },
                plan: payment.paymentPlan ? {
                  id: payment.paymentPlan.id,
                  name: payment.paymentPlan.name,
                  type: payment.paymentPlan.planType
                } : null,
                account: {
                  subdomain: metadata.subdomain,
                  domain: payment.product.domain
                },
                subscription: {
                  billingInterval: payment.paymentPlan?.billingInterval,
                  nextBilling: payment.paymentPlan?.billingInterval === 'MONTHLY' 
                    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                    : payment.paymentPlan?.billingInterval === 'YEARLY'
                    ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                    : null
                }
              }
            })
          });

          // Log successful webhook delivery
          await prisma.webhookLog.create({
            data: {
              endpoint: payment.product.webhookUrl,
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Secret': '[REDACTED]',
                'X-Source': 'tachles-payment-system'
              },
              body: { event: 'payment.completed', orderId },
              response: { status: 'sent' },
              status: 'sent',
              success: true,
              productId: payment.product.id,
              destinationUrl: payment.product.webhookUrl
            }
          });

        } catch (webhookError) {
          console.error('Failed to send webhook to product:', webhookError);
          
          // Log failed webhook delivery
          await prisma.webhookLog.create({
            data: {
              endpoint: payment.product.webhookUrl,
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Source': 'tachles-payment-system'
              },
              body: { event: 'payment.completed', orderId },
              response: { error: webhookError instanceof Error ? webhookError.message : 'Unknown error' },
              status: 'failed',
              success: false,
              productId: payment.product.id,
              destinationUrl: payment.product.webhookUrl
            }
          });
        }
      }

      // Send confirmation email to customer
      // TODO: Implement email service integration

      // Update product revenue
      await prisma.product.update({
        where: { id: metadata.productId },
        data: {
          totalRevenue: { increment: parseFloat(payment.amount.toString()) }
        }
      });

    } else if (status === 'failed') {
      // Log failed payment
      await prisma.webhookLog.create({
        data: {
          endpoint: '/api/webhooks/payplus',
          method: 'POST',
          headers: Object.fromEntries(request.headers.entries()),
          body: JSON.parse(body),
          response: { status: 'failed', orderId },
          status: 'failed',
          success: false,
          productId: metadata.productId
        }
      });

      // Update subscription status to cancelled
      await prisma.productSubscription.updateMany({
        where: {
          productId: metadata.productId,
          clientId: metadata.clientId
        },
        data: {
          status: 'CANCELLED'
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      orderId: orderId,
      status: status 
    });

  } catch (error) {
    console.error('Error processing payment webhook:', error);
    
    // Log webhook processing error
    try {
      await prisma.webhookLog.create({
        data: {
          endpoint: '/api/webhooks/payplus',
          method: 'POST',
          headers: Object.fromEntries(request.headers.entries()),
          body: { error: 'Failed to parse webhook' },
          response: { error: error instanceof Error ? error.message : 'Unknown error' },
          status: 'error',
          success: false
        }
      });
    } catch (logError) {
      console.error('Failed to log webhook error:', logError);
    }

    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process webhook' 
      },
      { status: 500 }
    );
  }
}
