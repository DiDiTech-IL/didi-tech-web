"use server";
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!status || !['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'].includes(status)) {
      return NextResponse.json({ error: 'Valid status is required' }, { status: 400 });
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
