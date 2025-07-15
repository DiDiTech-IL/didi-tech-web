"use server";
import { NextRequest, NextResponse } from 'next/server';
import { TicketService } from '@/lib/services/ticket-service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const ticket = await TicketService.updateTicket(id, { status });
    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Failed to update ticket status:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket status' },
      { status: 500 }
    );
  }
}
