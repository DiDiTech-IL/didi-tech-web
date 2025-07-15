"use server";
import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, createProduct } from '@/lib/services/product-service';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const products = await getAllProducts();
    return NextResponse.json(products || []);
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty array instead of error to prevent UI crashes
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      nameEn,
      description,
      domain,
      repository,
      category,
      features,
      pricing,
      apiBaseUrl,
      apiKey,
      dbConnectionString,
      dbType,
      ownerId,
      status,
      version,
    } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    const product = await createProduct({
      name,
      nameEn,
      description,
      domain,
      repository,
      category,
      features,
      pricing,
      apiBaseUrl,
      apiKey,
      dbConnectionString,
      dbType,
      ownerId,
      status,
      version,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 500 }
    );
  }
}
