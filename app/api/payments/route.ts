"use server";
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      include: {
        client: {
          select: {
            name: true
          }
        },
        product: {
          select: {
            name: true
          }
        },
        invoice: {
          select: {
            invoiceNumber: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedPayments = payments.map(payment => ({
      ...payment,
      clientName: payment.client.name,
      productName: payment.product?.name,
      invoiceNumber: payment.invoice?.invoiceNumber,
      paymentDate: payment.createdAt, // Use createdAt as payment date
    }));

    return NextResponse.json(formattedPayments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      amount, 
      currency = 'ILS', 
      method, 
      clientId, 
      productId, 
      description, 
    } = await request.json();

    if (!amount || !clientId || !method) {
      return NextResponse.json(
        { error: 'Amount, client, and payment method are required' }, 
        { status: 400 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        amount,
        currency,
        paymentMethod: method,
        clientId,
        productId,
        description,
        status: 'PENDING',
      }
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
