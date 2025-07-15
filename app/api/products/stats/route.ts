"use server";
import { NextResponse } from 'next/server';
import { getProductStats } from '@/lib/services/product-service';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getProductStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching product stats:', error);
    return NextResponse.json({
      totalProducts: 0,
      activeProducts: 0,
      liveProducts: 0,
      betaProducts: 0,
      devProducts: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      activeSubscriptions: 0,
    });
  }
}
