"use server";
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const webhooks = await prisma.webhookEndpoint.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(webhooks);
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhooks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { url, events, description, isActive = true, productId } = body;

    if (!url || !events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'URL and events are required' },
        { status: 400 }
      );
    }

    const webhook = await prisma.webhookEndpoint.create({
      data: {
        url,
        events,
        description,
        isActive,
        productId,
        successCount: 0,
        failureCount: 0,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(webhook, { status: 201 });
  } catch (error) {
    console.error('Error creating webhook:', error);
    return NextResponse.json(
      { error: 'Failed to create webhook' },
      { status: 500 }
    );
  }
}
