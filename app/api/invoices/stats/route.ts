"use server";
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { InvoiceService } from '@/lib/services/invoice-service';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await InvoiceService.getInvoiceStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching invoice stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice stats' },
      { status: 500 }
    );
  }
}
