"use server";
import { NextRequest, NextResponse } from 'next/server';
import { getProductClients } from '@/lib/services/product-service';
import { auth } from '@clerk/nextjs/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const clients = await getProductClients(id);
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching product clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product clients' },
      { status: 500 }
    );
  }
}
