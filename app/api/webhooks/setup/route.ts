"use server";
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { generateWebhookSecret } from '@/lib/webhook-utils';
import { WEBHOOK_EVENTS, WebhookEvent } from '@/lib/webhook-constants';





export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      productId, 
      url, 
      events, 
      description 
    }: { 
      productId: string; 
      url: string; 
      events: WebhookEvent[]; 
      description?: string;
    } = body;

    // Validate required fields
    if (!productId || !url || !events || events.length === 0) {
      return NextResponse.json(
        { error: 'Product ID, URL, and events are required' }, 
        { status: 400 }
      );
    }

    // Validate events
    const validEvents = Object.keys(WEBHOOK_EVENTS);
    const invalidEvents = events.filter(event => !validEvents.includes(event));
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { error: `Invalid events: ${invalidEvents.join(', ')}` }, 
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' }, 
        { status: 400 }
      );
    }

    // Check if product exists and get its webhook key
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        webhookKey: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' }, 
        { status: 404 }
      );
    }

    // Generate webhook secret
    const secret = generateWebhookSecret();

    // Create webhook endpoint
    const webhook = await prisma.webhookEndpoint.create({
      data: {
        url,
        events,
        secret,
        description: description || `Webhook for ${product.name}`,
        productId,
        isActive: true,
        successCount: 0,
        failureCount: 0,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            webhookKey: true,
          },
        },
      },
    });

    // Return webhook details including credentials
    return NextResponse.json({
      webhook: {
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        description: webhook.description,
        isActive: webhook.isActive,
        createdAt: webhook.createdAt,
      },
      credentials: {
        webhookSecret: secret,
        webhookKey: webhook.product?.webhookKey || '',
        integrationUrl: `https://pay.tachles.dev/${product.name.toLowerCase()}?data={token}`,
      },
      product: {
        id: product.id,
        name: product.name,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating webhook:', error);
    return NextResponse.json(
      { error: 'Failed to create webhook' }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return available events for the frontend
    return NextResponse.json({
      events: WEBHOOK_EVENTS,
    });

  } catch (error) {
    console.error('Error fetching webhook events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhook events' }, 
      { status: 500 }
    );
  }
}
