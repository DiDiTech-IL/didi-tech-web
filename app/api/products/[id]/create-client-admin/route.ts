import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id: productId } = await params;
    const body = await request.json();
    const { email, firstName, lastName, company, subdomain } = body;

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Email, first name, and last name are required" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        webhooks: {
          where: {
            isActive: true,
            events: {
              has: "client.admin.created",
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Prepare webhook payload
    const webhookPayload = {
      event: "client.admin.created",
      timestamp: new Date().toISOString(),
      data: {
        productId: product.id,
        productName: product.name,
        client: {
          email,
          firstName,
          lastName,
          company,
          subdomain,
        },
        metadata: {
          createdBy: userId,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/products`,
        },
      },
    };

    // Send webhooks to all configured endpoints
    const webhookPromises = product.webhooks.map(async (webhook) => {
      try {
        const response = await fetch(webhook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Tachles-Webhooks/1.0",
            "X-Tachles-Event": "client.admin.created",
            "X-Tachles-Product-Id": productId,
            ...(webhook.secret && { "X-Tachles-Signature": webhook.secret }),
          },
          body: JSON.stringify(webhookPayload),
        });

        // Update webhook last triggered time
        await prisma.webhookEndpoint.update({
          where: { id: webhook.id },
          data: {
            lastTriggered: new Date(),
            successCount: response.ok ? { increment: 1 } : undefined,
            failureCount: !response.ok ? { increment: 1 } : undefined,
          },
        });

        return {
          url: webhook.url,
          status: response.status,
          success: response.ok,
        };
      } catch (error) {
        console.error(`Failed to send webhook to ${webhook.url}:`, error);

        // Update failure count
        await prisma.webhookEndpoint.update({
          where: { id: webhook.id },
          data: { failureCount: { increment: 1 } },
        });

        return {
          url: webhook.url,
          status: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    const webhookResults = await Promise.all(webhookPromises);

    // Log webhook attempt
    await prisma.webhookLog.create({
      data: {
        endpoint: product.webhooks[0]?.url || "multiple",
        method: "POST",
        headers: { "X-Tachles-Event": "client.admin.created" },
        body: webhookPayload,
        response: webhookResults,
        status: "SUCCESS",
        success: webhookResults.every((r) => r.success),
        productId,
      },
    });

    return NextResponse.json({
      success: true,
      clientAdmin: {
        email,
        firstName,
        lastName,
        company,
        subdomain,
      },
      webhooksSent: webhookResults.length,
      webhookResults,
    });
  } catch (error) {
    console.error("Error creating client admin:", error);
    return NextResponse.json(
      { error: "Failed to create client admin" },
      { status: 500 }
    );
  }
}
