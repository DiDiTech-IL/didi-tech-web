"use server";
import { NextResponse } from 'next/server';
import { TicketService } from '@/lib/services/ticket-service';

export async function GET() {
  try {
    const stats = await TicketService.getTicketStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch ticket stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket stats' },
      { status: 500 }
    );
  }
}
