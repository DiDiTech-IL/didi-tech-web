import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { UserActivatedWebhookPayload, UserCreatedWebhookPayload, WebhookPayload, WebhookResponse } from './webhook-constants';

// Helper function to generate a secure webhook key
export function generateWebhookKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Helper function to generate a secure webhook secret
export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Helper function to generate webhook key for new products
export async function generateWebhookKeyForProduct(productId: string): Promise<string> {
  const webhookKey = generateWebhookKey();
  const webhookSecret = generateWebhookKey();
  
  await prisma.product.update({
    where: { id: productId },
    data: { 
      webhookKey,
      webhookSecret 
    }
  });
  
  return webhookKey;
}


export async function triggerAppSetup(
  product: { 
    id: string; 
    apiKey: string | null; 
    webhookUrl: string | null; 
  }, 
  payload: WebhookPayload
): Promise<WebhookResponse> {
  try {
    // Make HTTP request to the app's setup endpoint
    const setupResponse = await fetch(`${payload.destinationUrl}/api/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${product.apiKey}`,
        'X-Webhook-Source': 'tachles-dashboard'
      },
      body: JSON.stringify({
        clientData: payload.clientData,
        planSelection: payload.planSelection,
        paymentData: payload.paymentData,
        originUrl: payload.originUrl,
      })
    });

    const setupResult = await setupResponse.json();

    if (setupResponse.ok && setupResult.success) {
      // First, create or find the client
      let client = await prisma.client.findUnique({
        where: { email: payload.clientData.email }
      });

      if (!client) {
        client = await prisma.client.create({
          data: {
            name: payload.clientData.fullName,
            email: payload.clientData.email,
            company: payload.clientData.companyName,
            phone: payload.clientData.phone,
            status: 'ACTIVE',
          }
        });
      }

      // Record successful setup with proper subscription data
      await prisma.productSubscription.create({
        data: {
          productId: product.id,
          clientId: client.id,
          plan: payload.planSelection,
          status: 'ACTIVE',
          amount: payload.paymentData.amount,
          currency: payload.paymentData.currency,
          billingCycle: 'monthly', // Default, could be derived from planSelection
        }
      });

      return {
        success: true,
        message: 'Account setup completed successfully',
        data: {
          ...setupResult.data,
          clientId: client.id,
          subscriptionId: client.id, // Will be updated with actual subscription ID if needed
        }
      };
    } else {
      return {
        success: false,
        message: 'App setup failed',
        error: {
          code: 'SETUP_FAILED',
          details: setupResult.error || 'Unknown setup error'
        }
      };
    }

  } catch (error) {
    console.error('App setup error:', error);
    return {
      success: false,
      message: 'Failed to communicate with target app',
      error: {
        code: 'COMMUNICATION_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}



export async function sendUserActivatedWebhook(
  leadId: string,
  tachlesCustomerId: string,
  subdomain: string
) {
  const userActivatedPayload = {
    event: "user.activated" as const,
    leadId: leadId,
    tachlesCustomerId: tachlesCustomerId,
    activationInfo: {
      subdomain: subdomain,
      activatedAt: new Date().toISOString(),
      firstLoginCompleted: true
    },
    timestamp: new Date().toISOString(),
    signature: "" // Will be generated in sendWebhookToTachles
  };

  await sendWebhookToTachles(userActivatedPayload);
}

export async function sendWebhookToTachles(payload: UserCreatedWebhookPayload | UserActivatedWebhookPayload): Promise<void> {
  const tachlesWebhookUrl = process.env.TACHLES_WEBHOOK_URL;
  if (!tachlesWebhookUrl) {
    console.error('TACHLES_WEBHOOK_URL not configured');
    return;
  }

  const payloadString = JSON.stringify(payload);
  const signature = createOutgoingSignature(payloadString);

  try {
    const response = await fetch(tachlesWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-didi-tech-signature': signature
      },
      body: payloadString
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    console.log('Successfully sent webhook to Tachles:', payload.event);
  } catch (error) {
    console.error('Failed to send webhook to Tachles:', error);
    // TODO: Implement retry mechanism
  }
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const webhookSecret = process.env.TACHLES_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('TACHLES_WEBHOOK_SECRET not configured');
    return false;
  }
  
  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Create signature for outgoing webhooks
export function createOutgoingSignature(payload: string): string {
  const webhookSecret = process.env.TACHLES_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('TACHLES_WEBHOOK_SECRET not configured');
  }
  
  return crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');
}

// Extract phone number for temporary password
export function extractPhoneNumber(phone: string | undefined): string | null {
  if (!phone) return null;
  
  // Remove country code and non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // If starts with 972 (Israel), remove it
  if (cleaned.startsWith('972')) {
    return cleaned.substring(3);
  }
  
  // If starts with 0, remove it
  if (cleaned.startsWith('0')) {
    return cleaned.substring(1);
  }
  
  return cleaned.length >= 9 ? cleaned : null;
}

// Generate random password if phone not available
export function generateRandomPassword(): string {
  return crypto.randomBytes(8).toString('hex');
}

// Send webhook to Tachles

