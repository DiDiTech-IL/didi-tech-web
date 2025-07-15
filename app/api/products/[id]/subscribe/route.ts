"use server";
import { NextRequest, NextResponse } from 'next/server';
import { subscribeClientToProduct } from '@/lib/services/product-service';
import { auth } from '@clerk/nextjs/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { 
      clientId, 
      plan, 
      billingCycle, 
      amount, 
      currency,
      startDate,
      endDate 
    } = body;

    if (!clientId || !plan || !billingCycle || !amount) {
      return NextResponse.json(
        { error: 'Client ID, plan, billing cycle, and amount are required' },
        { status: 400 }
      );
    }

    const subscription = await subscribeClientToProduct({
      productId: id,
      clientId,
      plan,
      billingCycle,
      amount: parseFloat(amount),
      currency,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
