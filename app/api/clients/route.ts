"use server";
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ClientService } from '@/lib/services/client-service';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clients = await ClientService.getAllClients();
    return NextResponse.json(clients || []);
  } catch (error) {
    console.error('Error fetching clients:', error);
    // Return empty array to prevent UI crashes
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Creating client with data:', body);

    const client = await ClientService.createClient(body);
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create client';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
