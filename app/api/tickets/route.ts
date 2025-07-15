"use server";
import { NextRequest, NextResponse } from 'next/server';
import { TicketService } from '@/lib/services/ticket-service';

export async function GET() {
  try {
    const tickets = await TicketService.getAllTickets();
    return NextResponse.json(tickets || []);
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, clientId, priority, assignedToId } = body;

    if (!title || !description || !clientId) {
      return NextResponse.json(
        { error: 'Title, description, and client ID are required' },
        { status: 400 }
      );
    }

    const ticket = await TicketService.createTicket({
      title,
      description,
      clientId,
      priority,
      assignedToId: assignedToId || undefined,
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Failed to create ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
