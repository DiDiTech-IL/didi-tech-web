"use server";
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { InvoiceService } from '@/lib/services/invoice-service';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const invoice = await InvoiceService.updateInvoiceStatus(id, 'PAID');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Invoice marked as paid',
      invoice 
    });
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    return NextResponse.json(
      { error: 'Failed to mark invoice as paid' },
      { status: 500 }
    );
  }
}
