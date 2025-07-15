"use server";
import { prisma } from '@/lib/prisma';
import { SubscriptionStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

// PayPlus callback/webhook interface based on actual response format
interface PayPlusCallback {
  transaction_type: string;
  transaction: {
    uid: string;
    payment_page_request_uid: string;
    status_code: string; // "000" = success, others = failure
    amount: number;
    currency: string;
    date: string;
    approval_number: string;
    voucher_number: string;
    more_info: string; // This contains our client ID
    more_info_2: string; // This contains our product ID
    more_info_3: string; // This contains our metadata JSON
    more_info_1?: string;
    more_info_4?: string;
    more_info_5?: string;
  };
  data: {
    customer_email: string;
    customer_uid: string;
    card_information: {
      card_holder_name: string;
      four_digits: string;
      expiry_month: string;
      expiry_year: string;
      brand_id: number;
    };
    items: Array<{
      name: string;
      amount_pay: number;
    }>;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Validate PayPlus webhook request
    const isPayPlusRequest = request.headers.get("user-agent") === "PayPlus";

    if (!isPayPlusRequest) {
      console.error('Invalid PayPlus request - wrong user agent');
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Parse the callback data - PayPlus sends JSON
    const callbackData: PayPlusCallback = await request.json();
    console.log('PayPlus callback received:', callbackData);

    // Check payment status first
    if (callbackData.transaction.status_code !== "000") {
      console.log('Payment not approved, status:', callbackData.transaction.status_code);
      return NextResponse.json({ error: 'Payment not approved' }, { status: 400 });
    }

    const transaction = callbackData.transaction;
    const {
      payment_page_request_uid,
      uid: transaction_uid,
      more_info,
      more_info_2,
      more_info_3,
      approval_number,
      date: payment_date,
    } = transaction;

    if (!payment_page_request_uid) {
      console.error('Missing payment_page_request_uid in callback');
      return NextResponse.json({ error: 'Missing payment_page_request_uid' }, { status: 400 });
    }

    const clientId = more_info;
    const productId = more_info_2;

    if (!clientId || !productId) {
      console.error('Missing clientId or productId in callback');
      return NextResponse.json({ error: 'Missing clientId or productId' }, { status: 400 });
    }

    // Parse additional metadata
    let metadata: { 
      planId?: string;
      subdomain?: string; 
      couponCode?: string; 
      [key: string]: string | number | boolean | undefined
    } = {};
    try {
      if (more_info_3) {
        metadata = JSON.parse(more_info_3);
      }
    } catch {
      console.log('Could not parse metadata from more_info_3');
    }

    // Find the subscription record using payment request UID
    const subscription = await prisma.productSubscription.findFirst({
      where: {
        usageData: {
          path: ['paymentRequestUid'],
          equals: payment_page_request_uid
        }
      },
      include: {
        client: true,
        product: true,
        paymentPlan: true
      }
    });

    if (!subscription) {
      console.error('Subscription not found for payment_page_request_uid:', payment_page_request_uid);
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Payment is successful (status_code === "000" already checked above)
    const subscriptionStatus = SubscriptionStatus.ACTIVE;

    // Update subscription record with PayPlus transaction details
    await prisma.productSubscription.update({
      where: { id: subscription.id },
      data: {
        status: subscriptionStatus,
        usageData: {
          ...subscription.usageData as object,
          paymentRequestUid: payment_page_request_uid,
          transactionUid: transaction_uid,
          approvalNumber: approval_number,
          paymentDate: payment_date,
          subdomain: metadata.subdomain,
          couponCode: metadata.couponCode,
        },
        updatedAt: new Date()
      }
    });

    // Create a payment record for tracking
    const paymentRecord = await prisma.payment.create({
      data: {
        amount: subscription.amount,
        currency: subscription.currency,
        status: 'COMPLETED',
        description: `Subscription payment for ${subscription.product.name} - ${subscription.plan}`,
        paymentMethod: 'PayPlus',
        transactionId: transaction_uid || payment_page_request_uid,
        clientId: subscription.clientId,
        productId: subscription.productId,
      }
    });

    // Create webhook log for successful payment
    await prisma.webhookLog.create({
      data: {
        endpoint: '/api/webhooks/payplus',
        method: 'POST',
        headers: Object.fromEntries(request.headers.entries()),
        body: JSON.parse(JSON.stringify(callbackData)),
        response: { status: 'success', subscriptionId: subscription.id },
        status: 'completed',
        success: true,
        productId: subscription.productId
      }
    });

      // Trigger account creation webhook for the target application
      if (subscription.product && subscription.product.webhookUrl) {
        try {
          const usageData = subscription.usageData as Record<string, unknown> | null;
          const webhookPayload = {
            event: 'subscription.activated',
            timestamp: new Date().toISOString(),
            data: {
              subscription: {
                id: subscription.id,
                status: 'active',
                plan: subscription.plan,
                amount: parseFloat(subscription.amount.toString()),
                currency: subscription.currency,
                billingCycle: subscription.billingCycle,
                startDate: subscription.startDate.toISOString(),
                endDate: subscription.endDate?.toISOString(),
                nextBilling: subscription.nextBilling?.toISOString(),
              },
              payment: {
                id: paymentRecord.id,
                amount: parseFloat(subscription.amount.toString()),
                currency: subscription.currency,
                status: 'completed',
                transactionId: transaction_uid || payment_page_request_uid,
                paymentDate: payment_date,
                approvalNumber: approval_number,
                cardDetails: {
                  lastFourDigits: callbackData.data.card_information.four_digits,
                  expiryDate: `${callbackData.data.card_information.expiry_month}/${callbackData.data.card_information.expiry_year}`,
                  cardHolderName: callbackData.data.card_information.card_holder_name
                }
              },
              customer: {
                id: subscription.client.id,
                email: subscription.client.email,
                name: subscription.client.name,
                company: subscription.client.company,
                phone: subscription.client.phone
              },
              product: {
                id: subscription.product.id,
                name: subscription.product.name,
                domain: subscription.product.domain
              },
              plan: subscription.paymentPlan ? {
                id: subscription.paymentPlan.id,
                name: subscription.paymentPlan.name,
                type: subscription.paymentPlan.planType
              } : null,
              account: {
                subdomain: usageData?.subdomain,
                domain: subscription.product.domain,
                companyName: subscription.client.company,
                phone: subscription.client.phone,
                fullUrl: `https://${usageData?.subdomain}.${subscription.product.domain}`
              }
            }
          };

          const response = await fetch(subscription.product.webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Secret': subscription.product.webhookSecret || '',
              'X-Source': 'tachles-payment-system'
            },
            body: JSON.stringify(webhookPayload)
          });

          // Log webhook delivery
          await prisma.webhookLog.create({
            data: {
              endpoint: subscription.product.webhookUrl,
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Source': 'tachles-payment-system'
              },
              body: { event: 'subscription.activated', subscriptionId: subscription.id },
              response: { 
                status: response.ok ? 'sent' : 'failed',
                statusCode: response.status 
              },
              status: response.ok ? 'sent' : 'failed',
              success: response.ok,
              productId: subscription.product.id,
              destinationUrl: subscription.product.webhookUrl
            }
          });

        } catch (webhookError) {
          console.error('Failed to send webhook to product:', webhookError);
          
          // Log failed webhook delivery
          await prisma.webhookLog.create({
            data: {
              endpoint: subscription.product.webhookUrl || '',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Source': 'tachles-payment-system'
              },
              body: { event: 'subscription.activated', subscriptionId: subscription.id },
              response: { error: webhookError instanceof Error ? webhookError.message : 'Unknown error' },
              status: 'failed',
              success: false,
              productId: subscription.product.id,
              destinationUrl: subscription.product.webhookUrl || ''
            }
          });
        }
      }

      // Update product revenue
      await prisma.product.update({
        where: { id: subscription.productId },
        data: {
          totalRevenue: { increment: parseFloat(subscription.amount.toString()) }
        }
      });

      // // Send invoice email to customer
      // try {
      //   const usageData = subscription.usageData as Record<string, unknown> | null;
      //   const invoiceEmailResult = await sendInvoiceEmail({
      //     customerName: subscription.client.name,
      //     customerEmail: subscription.client.email,
      //     invoiceNumber: `INV-${paymentRecord.id.slice(-8).toUpperCase()}`,
      //     amount: parseFloat(subscription.amount.toString()),
      //     currency: subscription.currency,
      //     productName: subscription.product.name,
      //     planName: subscription.plan,
      //     transactionId: paymentRecord.transactionId,
      //     invoiceDate: paymentRecord.createdAt,
      //     subdomain: usageData?.subdomain as string,
      //     domainUrl: `https://${usageData?.subdomain}.${subscription.product.domain}`
      //   });

      //   if (invoiceEmailResult.success) {
      //     await logEmailEvent('sent', subscription.client.email, {
      //       type: 'invoice',
      //       invoiceNumber: `INV-${paymentRecord.id.slice(-8).toUpperCase()}`,
      //       messageId: invoiceEmailResult.messageId
      //     });
      //   } else {
      //     await logEmailEvent('failed', subscription.client.email, {
      //       type: 'invoice',
      //       invoiceNumber: `INV-${paymentRecord.id.slice(-8).toUpperCase()}`
      //     }, invoiceEmailResult.error);
      //   }
      // } catch (emailError) {
      //   console.error('Failed to send invoice email:', emailError);
      //   await logEmailEvent('failed', subscription.client.email, {
      //     type: 'invoice',
      //     error: 'Exception during email sending'
      //   }, emailError instanceof Error ? emailError.message : 'Unknown error');
      // }

    return NextResponse.json({ message: 'OK' }, { status: 200 });

  } catch (error) {
    console.error('PayPlus webhook error:', error);
    
    // Log callback processing error
    try {
      await prisma.webhookLog.create({
        data: {
          endpoint: '/api/webhooks/payplus',
          method: 'POST',
          headers: Object.fromEntries(request.headers.entries()),
          body: { error: 'Failed to parse callback' },
          response: { error: error instanceof Error ? error.message : 'Unknown error' },
          status: 'error',
          success: false
        }
      });
    } catch (logError) {
      console.error('Failed to log callback error:', logError);
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

