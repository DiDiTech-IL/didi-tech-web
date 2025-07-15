"use server";
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { InvoiceService } from '@/lib/services/invoice-service';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const invoice = await InvoiceService.updateInvoiceStatus(id, 'SENT');
    
    // Here you would normally send the invoice via email
    // For now, we'll just update the status
    
    return NextResponse.json({ 
      success: true, 
      message: 'Invoice sent successfully',
      invoice 
    });
  } catch (error) {
    console.error('Error sending invoice:', error);
    return NextResponse.json(
      { error: 'Failed to send invoice' },
      { status: 500 }
    );
  }
}
