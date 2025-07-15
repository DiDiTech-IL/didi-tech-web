"use server";
import { NextRequest, NextResponse } from 'next/server';
import { TicketService } from '@/lib/services/ticket-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticket = await TicketService.getTicketById(id);
    
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Failed to fetch ticket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } ) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, priority, assignedToId } = body;

    const ticket = await TicketService.updateTicket(id, {
      title,
      description,
      priority,
      assignedToId: assignedToId || undefined,
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Failed to update ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await TicketService.deleteTicket(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete ticket:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}
