"use server";
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const webhook = await prisma.webhookEndpoint.findUnique({
      where: { id },
    });

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    // Create a test payload
    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        test: true,
        webhook_id: webhook.id,
        message: 'This is a test webhook delivery',
      },
    };

    try {
      // Send test webhook
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Tachles-Webhook/1.0',
        },
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      // Update webhook success/failure count
      if (response.ok) {
        await prisma.webhookEndpoint.update({
          where: { id },
          data: {
            successCount: { increment: 1 },
            lastTriggered: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          status: response.status,
          message: 'Webhook test successful',
        });
      } else {
        await prisma.webhookEndpoint.update({
          where: { id },
          data: {
            failureCount: { increment: 1 },
          },
        });

        return NextResponse.json({
          success: false,
          status: response.status,
          message: 'Webhook test failed',
        });
      }
    } catch (error) {
      // Update failure count
      await prisma.webhookEndpoint.update({
        where: { id },
        data: {
          failureCount: { increment: 1 },
        },
      });

      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        message: 'Webhook test failed',
      });
    }
  } catch (error) {
    console.error('Error testing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to test webhook' },
      { status: 500 }
    );
  }
}
