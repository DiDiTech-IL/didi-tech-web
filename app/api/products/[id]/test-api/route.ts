"use server";
import { NextRequest, NextResponse } from 'next/server';
import { testApiEndpoint } from '@/lib/services/product-service';
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
    const { endpoint = '/health', method = 'GET' } = body;

    if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      return NextResponse.json(
        { error: 'Invalid HTTP method' },
        { status: 400 }
      );
    }

    const result = await testApiEndpoint(id, endpoint, method);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error testing API endpoint:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'API test failed'
      },
      { status: 500 }
    );
  }
}
