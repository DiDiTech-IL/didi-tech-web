import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { product, subdomain } = await request.json();

    if (!product || !subdomain) {
      return NextResponse.json(
        { success: false, error: 'Missing product or subdomain' },
        { status: 400 }
      );
    }

    // Find the subscription by subdomain in usageData
    const subscription = await prisma.productSubscription.findFirst({
      where: {
        product: {
          nameEn: product.toLowerCase()
        },
        usageData: {
          path: ['subdomain'],
          equals: subdomain
        },
        status: { in: ['ACTIVE', 'TRIAL'] }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Get the payment request UID from usageData
    const usageData = subscription.usageData as Record<string, unknown> | null;
    const paymentRequestUid = usageData?.paymentRequestUid as string;

    if (!paymentRequestUid) {
      return NextResponse.json(
        { success: false, error: 'Payment request UID not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      invoiceId: paymentRequestUid,
      subscriptionId: subscription.id
    });

  } catch (error) {
    console.error('Error finding invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
