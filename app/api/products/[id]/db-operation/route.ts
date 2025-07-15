"use server";
import { NextRequest, NextResponse } from 'next/server';
import { executeDbOperation } from '@/lib/services/product-service';
import { auth } from '@clerk/nextjs/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { operation } = body;

    if (!['backup', 'migrate', 'status'].includes(operation)) {
      return NextResponse.json(
        { error: 'Invalid operation. Must be one of: backup, migrate, status' },
        { status: 400 }
      );
    }

    const result = await executeDbOperation(id, operation);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error executing database operation:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Database operation failed'
      },
      { status: 500 }
    );
  }
}
