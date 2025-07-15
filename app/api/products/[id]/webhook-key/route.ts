"use server";
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { generateWebhookKey } from '@/lib/webhook-utils';



export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: productId } = await params;

    // Check if product exists and user has access
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const webhookKey = generateWebhookKey();
    const webhookSecret = generateWebhookKey();

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        webhookKey,
        webhookSecret,
      },
    });

    return NextResponse.json({
      webhookKey: updatedProduct.webhookKey,
      webhookSecret: updatedProduct.webhookSecret,
      integrationUrl: `https://pay.tachles.dev/${product.name.toLowerCase()}?data={token}`,
    });
  } catch (error) {
    console.error('Error generating webhook key:', error);
    return NextResponse.json(
      { error: 'Failed to generate webhook key' },
      { status: 500 }
    );
  }
}
