"use server";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { triggerAppSetup } from '@/lib/webhook-utils';
import { WebhookPayload, WebhookResponse } from '@/lib/webhook-constants';



// Verify webhook signature (for security)
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const payload: WebhookPayload = JSON.parse(body);
    
    // Get webhook signature from headers
    const signature = request.headers.get('x-webhook-signature');
    
    if (!signature) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_SIGNATURE', details: 'Webhook signature is required' } },
        { status: 401 }
      );
    }

    // Find the product by webhook key
    const product = await prisma.product.findUnique({
      where: { webhookKey: payload.webhookKey },
      include: { 
        subscriptions: {
          include: { client: true }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_WEBHOOK_KEY', details: 'Product not found' } },
        { status: 404 }
      );
    }

    // Verify webhook signature using product's webhook secret
    if (!verifyWebhookSignature(body, signature, product.webhookSecret || '')) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_SIGNATURE', details: 'Webhook signature verification failed' } },
        { status: 401 }
      );
    }

    // Log the webhook request
    await prisma.webhookLog.create({
      data: {
        endpoint: request.url,
        method: 'POST',
        headers: Object.fromEntries(request.headers.entries()),
        body: JSON.parse(body),
        productId: product.id,
        status: 'PROCESSING',
        payload: body,
        originUrl: payload.originUrl,
        destinationUrl: payload.destinationUrl,
      }
    });

    // Process the webhook based on payment status
    if (payload.paymentData.status === 'completed') {
      // Payment successful - trigger app setup
      const response = await triggerAppSetup(product, payload);
      
      // Update webhook log
      await prisma.webhookLog.updateMany({
        where: {
          productId: product.id,
          status: 'PROCESSING',
        },
        data: {
          status: response.success ? 'SUCCESS' : 'FAILED',
          response: JSON.stringify(response),
        }
      });

      return NextResponse.json(response);
    } else {
      // Payment failed
      const response: WebhookResponse = {
        success: false,
        message: 'Payment failed - account setup cancelled',
        error: {
          code: 'PAYMENT_FAILED',
          details: `Payment status: ${payload.paymentData.status}`
        }
      };

      await prisma.webhookLog.updateMany({
        where: {
          productId: product.id,
          status: 'PROCESSING',
        },
        data: {
          status: 'FAILED',
          response: JSON.stringify(response),
        }
      });

      return NextResponse.json(response, { status: 400 });
    }

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          details: 'Failed to process webhook request' 
        } 
      },
      { status: 500 }
    );
  }
}
