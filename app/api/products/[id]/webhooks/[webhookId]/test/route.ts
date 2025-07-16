import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; webhookId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: productId, webhookId } = await params;

    // Get webhook and product info
    const webhook = await prisma.webhookEndpoint.findFirst({
      where: {
        id: webhookId,
        productId,
      },
      include: {
        product: true,
      },
    });

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    // Prepare test payload
    const testPayload = {
      event: "webhook.test",
      timestamp: new Date().toISOString(),
      data: {
        productId: webhook.product?.id,
        productName: webhook.product?.name,
        message: "This is a test webhook from Tachles Dashboard",
        testData: {
          userId,
          webhookId,
          timestamp: new Date().toISOString(),
        },
      },
    };

    try {
      // Send test webhook
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Tachles-Webhooks/1.0",
          "X-Tachles-Event": "webhook.test",
          "X-Tachles-Product-Id": productId,
          ...(webhook.secret && { "X-Tachles-Signature": webhook.secret }),
        },
        body: JSON.stringify(testPayload),
      });

      const responseText = await response.text();

      // Update webhook stats
      await prisma.webhookEndpoint.update({
        where: { id: webhookId },
        data: {
          lastTriggered: new Date(),
          successCount: response.ok ? { increment: 1 } : undefined,
          failureCount: !response.ok ? { increment: 1 } : undefined,
        },
      });

      // Log the test
      await prisma.webhookLog.create({
        data: {
          endpoint: webhook.url,
          method: "POST",
          headers: { "X-Tachles-Event": "webhook.test" },
          body: testPayload,
          response: { status: response.status, body: responseText },
          status: response.status.toString(),
          success: response.ok,
          webhookEndpointId: webhookId,
          productId,
        },
      });

      return NextResponse.json({
        success: response.ok,
        status: response.status,
        response: responseText,
        sentAt: new Date().toISOString(),
      });
    } catch (error) {
      // Update failure count
      await prisma.webhookEndpoint.update({
        where: { id: webhookId },
        data: { failureCount: { increment: 1 } },
      });

      // Log the failure
      await prisma.webhookLog.create({
        data: {
          endpoint: webhook.url,
          method: "POST",
          headers: { "X-Tachles-Event": "webhook.test" },
          body: testPayload,
          response: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
          status: "ERROR",
          success: false,
          webhookEndpointId: webhookId,
          productId,
        },
      });

      return NextResponse.json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to send webhook",
        sentAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error testing webhook:", error);
    return NextResponse.json(
      { error: "Failed to test webhook" },
      { status: 500 }
    );
  }
}
