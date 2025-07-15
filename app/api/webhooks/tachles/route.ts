"use server"
import { prisma } from "@/lib/prisma";
import { tachlesWebhookSchema } from "@/lib/webhook-constants";
import {
  extractPhoneNumber,
  generateRandomPassword,
  sendWebhookToTachles,
  verifyWebhookSignature,
} from "@/lib/webhook-utils";
import { sendWelcomeEmail, logEmailEvent } from "@/lib/email-service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Helper function to create detailed logs for the process
async function logProcessStep(
  step: string,
  status: 'started' | 'completed' | 'failed',
  details: Record<string, unknown>,
  error?: string
): Promise<void> {
  const logEntry = {
    timestamp: new Date().toISOString(),
    step,
    status,
    details,
    error
  };
  
  console.log(`[TACHLES_PROCESS] ${step} - ${status.toUpperCase()}:`, logEntry);
  
  // Store in database for persistence
  try {
    await prisma.webhookLog.create({
      data: {
        endpoint: '/api/webhooks/tachles',
        method: 'POST',
        headers: { 'x-process-step': step },
        body: JSON.parse(JSON.stringify(details)),
        response: { status, error },
        status: status === 'completed' ? 'completed' : status === 'failed' ? 'failed' : 'pending',
        success: status === 'completed',
        destinationUrl: step
      }
    });
  } catch (dbError) {
    console.error('[TACHLES_PROCESS] Failed to log to database:', dbError);
  }
}


export async function POST(request: NextRequest) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    console.log(`[TACHLES_WEBHOOK] 🚀 Processing webhook request: ${requestId}`);
    
    const rawBody = await request.text();
    const signature = request.headers.get("x-tachles-signature") || "";

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.log(`[TACHLES_WEBHOOK] ❌ Invalid signature for request: ${requestId}`);
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    const body = JSON.parse(rawBody);
    const webhookData = tachlesWebhookSchema.parse(body);

    console.log(`[TACHLES_WEBHOOK] 📥 Valid webhook received:`, {
      requestId,
      event: webhookData.event,
      leadId: webhookData.leadId,
      subdomain: webhookData.domainInfo?.subdomain
    });

    switch (webhookData.event) {
      case "domain.activated":
        console.log(`[TACHLES_WEBHOOK] 🔄 Processing domain activation for: ${requestId}`);
        await handleDomainActivation(webhookData);
        break;

      case "domain.suspended":
        console.log(`[TACHLES_WEBHOOK] 🔄 Processing domain suspension for: ${requestId}`);
        await handleDomainSuspension(webhookData);
        break;

      case "domain.cancelled":
        console.log(`[TACHLES_WEBHOOK] 🔄 Processing domain cancellation for: ${requestId}`);
        await handleDomainCancellation(webhookData);
        break;

      default:
        console.log(`[TACHLES_WEBHOOK] ⚠️ Unknown webhook event for ${requestId}:`, webhookData.event);
    }

    console.log(`[TACHLES_WEBHOOK] ✅ Successfully processed request: ${requestId}`);
    return NextResponse.json({ 
      received: true, 
      requestId,
      event: webhookData.event,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`[TACHLES_WEBHOOK] ❌ Error processing request ${requestId}:`, error);

    if (error instanceof z.ZodError) {
      console.error(`[TACHLES_WEBHOOK] 📋 Validation errors for ${requestId}:`, error.issues);
      return NextResponse.json(
        { 
          error: "Invalid webhook payload", 
          details: error.issues,
          requestId 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: "Internal server error",
        requestId,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

async function handleDomainActivation(
  webhookData: z.infer<typeof tachlesWebhookSchema>
) {
  const { leadId, tachlesCustomerId, domainInfo } = webhookData;
  const processId = `${leadId}-${Date.now()}`;

  try {
    await logProcessStep('domain_activation_started', 'started', {
      processId,
      leadId,
      tachlesCustomerId,
      subdomain: domainInfo.subdomain,
      email: domainInfo.contactEmail
    });

    // Step 1: Check if client already exists
    await logProcessStep('client_lookup', 'started', { email: domainInfo.contactEmail });
    
    const existingClient = await prisma.client.findUnique({
      where: { email: domainInfo.contactEmail },
    });

    let client;

    if (existingClient) {
      await logProcessStep('client_update', 'started', { clientId: existingClient.id });
      
      // Update existing client
      client = await prisma.client.update({
        where: { id: existingClient.id },
        data: {
          status: "ACTIVE",
          name: domainInfo.contactName || domainInfo.organizationName,
          company: domainInfo.organizationName,
          phone: domainInfo.contactPhone,
          updatedAt: new Date(),
        },
      });

      await logProcessStep('client_update', 'completed', { 
        clientId: client.id,
        reactivated: true 
      });
    } else {
      await logProcessStep('client_creation', 'started', { email: domainInfo.contactEmail });
      
      // Create new client
      client = await prisma.client.create({
        data: {
          email: domainInfo.contactEmail,
          name: domainInfo.contactName || domainInfo.organizationName,
          company: domainInfo.organizationName,
          phone: domainInfo.contactPhone,
          status: "ACTIVE",
        },
      });

      await logProcessStep('client_creation', 'completed', { 
        clientId: client.id,
        newClient: true 
      });
    }

    // Step 2: Generate credentials
    await logProcessStep('credentials_generation', 'started', {});
    
    const temporaryPassword =
      extractPhoneNumber(domainInfo.contactPhone) || generateRandomPassword();

    // Create domain URL
    const domainBase = "mitnadvim.app";
    const domainUrl = `https://${domainInfo.subdomain}.${domainBase}`;

    await logProcessStep('credentials_generation', 'completed', {
      domainUrl,
      passwordGenerated: true
    });

    // Step 3: Send welcome email to customer
    await logProcessStep('email_sending', 'started', { 
      recipient: domainInfo.contactEmail 
    });

    const emailResult = await sendWelcomeEmail({
      customerName: domainInfo.contactName || domainInfo.organizationName,
      subdomain: domainInfo.subdomain,
      domainUrl: domainUrl,
      temporaryPassword: temporaryPassword,
      organizationName: domainInfo.organizationName,
      contactEmail: domainInfo.contactEmail,
    });

    if (emailResult.success) {
      await logProcessStep('email_sending', 'completed', {
        messageId: emailResult.messageId,
        recipient: domainInfo.contactEmail
      });
      
      await logEmailEvent('sent', domainInfo.contactEmail, {
        subdomain: domainInfo.subdomain,
        messageId: emailResult.messageId
      });
    } else {
      await logProcessStep('email_sending', 'failed', {
        recipient: domainInfo.contactEmail
      }, emailResult.error);
      
      await logEmailEvent('failed', domainInfo.contactEmail, {
        subdomain: domainInfo.subdomain
      }, emailResult.error);
      
      // Don't fail the entire process if email fails, but log it
      console.warn('[TACHLES_PROCESS] Email sending failed but continuing process');
    }

    // Step 4: Send user.created webhook back to Tachles
    await logProcessStep('tachles_webhook', 'started', {
      event: 'user.created'
    });

    const userCreatedPayload = {
      event: "user.created" as const,
      leadId: leadId,
      tachlesCustomerId: tachlesCustomerId,
      userInfo: {
        subdomain: domainInfo.subdomain,
        domainUrl: domainUrl,
        email: domainInfo.contactEmail,
        temporaryPassword: temporaryPassword,
        activationRequired: true,
      },
      timestamp: new Date().toISOString(),
      signature: "", // Will be generated in sendWebhookToTachles
    };

    await sendWebhookToTachles(userCreatedPayload);

    await logProcessStep('tachles_webhook', 'completed', {
      event: 'user.created',
      leadId
    });

    // Step 5: Final completion
    await logProcessStep('domain_activation_completed', 'completed', {
      processId,
      clientId: client.id,
      domainUrl,
      emailSent: emailResult.success,
      totalSteps: 5
    });

    console.log(
      "[TACHLES_PROCESS] ✅ Domain activation process completed successfully",
      {
        processId,
        clientId: client.id,
        subdomain: domainInfo.subdomain,
        emailSent: emailResult.success
      }
    );
  } catch (error) {
    await logProcessStep('domain_activation_failed', 'failed', {
      processId,
      leadId,
      subdomain: domainInfo.subdomain
    }, error instanceof Error ? error.message : 'Unknown error');
    
    console.error("[TACHLES_PROCESS] ❌ Domain activation process failed:", error);
    throw error;
  }
}

async function handleDomainSuspension(
  webhookData: z.infer<typeof tachlesWebhookSchema>
) {
  const { domainInfo } = webhookData;

  try {
    await logProcessStep('domain_suspension_started', 'started', {
      email: domainInfo.contactEmail,
      subdomain: domainInfo.subdomain
    });

    const client = await prisma.client.findUnique({
      where: { email: domainInfo.contactEmail },
    });

    if (client) {
      await prisma.client.update({
        where: { id: client.id },
        data: {
          status: "INACTIVE", // Using existing enum value
          updatedAt: new Date(),
        },
      });

      await logProcessStep('domain_suspension_completed', 'completed', {
        clientId: client.id,
        email: domainInfo.contactEmail
      });

      console.log("[TACHLES_PROCESS] ✅ Successfully suspended client:", client.id);
    } else {
      await logProcessStep('domain_suspension_failed', 'failed', {
        email: domainInfo.contactEmail
      }, 'Client not found');

      console.log("[TACHLES_PROCESS] ⚠️ Client not found for suspension:", domainInfo.contactEmail);
    }
  } catch (error) {
    await logProcessStep('domain_suspension_failed', 'failed', {
      email: domainInfo.contactEmail,
      subdomain: domainInfo.subdomain
    }, error instanceof Error ? error.message : 'Unknown error');

    console.error("[TACHLES_PROCESS] ❌ Failed to handle domain suspension:", error);
    throw error;
  }
}

async function handleDomainCancellation(
  webhookData: z.infer<typeof tachlesWebhookSchema>
) {
  const { domainInfo } = webhookData;

  try {
    await logProcessStep('domain_cancellation_started', 'started', {
      email: domainInfo.contactEmail,
      subdomain: domainInfo.subdomain
    });

    const client = await prisma.client.findUnique({
      where: { email: domainInfo.contactEmail },
    });

    if (client) {
      await prisma.client.update({
        where: { id: client.id },
        data: {
          status: "INACTIVE",
          updatedAt: new Date(),
        },
      });

      await logProcessStep('domain_cancellation_completed', 'completed', {
        clientId: client.id,
        email: domainInfo.contactEmail
      });

      console.log("[TACHLES_PROCESS] ✅ Successfully cancelled client:", client.id);
    } else {
      await logProcessStep('domain_cancellation_failed', 'failed', {
        email: domainInfo.contactEmail
      }, 'Client not found');

      console.log("[TACHLES_PROCESS] ⚠️ Client not found for cancellation:", domainInfo.contactEmail);
    }
  } catch (error) {
    await logProcessStep('domain_cancellation_failed', 'failed', {
      email: domainInfo.contactEmail,
      subdomain: domainInfo.subdomain
    }, error instanceof Error ? error.message : 'Unknown error');

    console.error("[TACHLES_PROCESS] ❌ Failed to handle domain cancellation:", error);
    throw error;
  }
}
