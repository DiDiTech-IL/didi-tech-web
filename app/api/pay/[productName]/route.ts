"use server";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productName: string }> }
) {
  try {
    const { productName } = await params;
    
    // Find product by name or nameEn (case insensitive)
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: productName,
              mode: 'insensitive'
            }
          },
          {
            nameEn: {
              equals: productName,
              mode: 'insensitive'
            }
          }
        ],
        status: 'LIVE' // Only show live products on payment page
      },
      include: {
        paymentPlans: {
          where: {
            isActive: true
          },
          orderBy: {
            displayOrder: 'asc'
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or not available' },
        { status: 404 }
      );
    }

    // Transform data for frontend
    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      features: product.features,
      domain: product.domain,
      paymentPlans: product.paymentPlans.map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        planType: plan.planType,
        price: parseFloat(plan.price.toString()),
        currency: plan.currency,
        billingInterval: plan.billingInterval,
        trialDays: plan.trialDays,
        features: plan.features,
        userLimit: plan.userLimit,
        storageLimit: plan.storageLimit,
        apiCallsLimit: plan.apiCallsLimit,
        discountPercentage: plan.discountPercentage ? parseFloat(plan.discountPercentage.toString()) : null,
        discountValidUntil: plan.discountValidUntil?.toISOString(),
        isPopular: plan.isPopular,
        isActive: plan.isActive,
        displayOrder: plan.displayOrder
      }))
    };

    return NextResponse.json(transformedProduct);

  } catch (error) {
    console.error('Error fetching product details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
