"use server";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    
    // This is a public endpoint for the payment gateway
    // Find product by ID, name, English name, or domain (for friendly URLs)
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: productId },
          { name: { equals: productId, mode: 'insensitive' } },
          { nameEn: { equals: productId, mode: 'insensitive' } },
          { domain: productId },
        ],
      },
      include: {
        paymentPlans: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // If no plans exist, create default ones
    if (product.paymentPlans.length === 0) {
      const defaultPlans = await Promise.all([
        prisma.paymentPlan.create({
          data: {
            productId: product.id,
            name: 'Basic Plan',
            description: `Basic access to ${product.name}`,
            planType: 'RECURRING',
            price: 29.99,
            currency: 'ILS',
            billingInterval: 'MONTHLY',
            features: ['Core features', 'Email support'],
            isActive: true,
            displayOrder: 1,
          }
        }),
        prisma.paymentPlan.create({
          data: {
            productId: product.id,
            name: 'Pro Plan',
            description: `Professional features for ${product.name}`,
            planType: 'RECURRING',
            price: 99.99,
            currency: 'ILS',
            billingInterval: 'MONTHLY',
            features: ['All basic features', 'Advanced analytics', 'Priority support'],
            isPopular: true,
            isActive: true,
            displayOrder: 2,
          }
        })
      ]);

      return NextResponse.json({
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          domain: product.domain,
          status: product.status,
        },
        plans: defaultPlans.map(plan => ({
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
          displayOrder: plan.displayOrder,
        })),
        metadata: {
          totalPlans: defaultPlans.length,
          hasFreePlan: false,
          hasTrialPlans: false,
          currency: 'ILS',
        },
      });
    }

    // Format response for payment gateway
    const response = {
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        domain: product.domain,
        status: product.status,
      },
      plans: product.paymentPlans.map(plan => ({
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
        displayOrder: plan.displayOrder,
      })),
      metadata: {
        totalPlans: product.paymentPlans.length,
        hasFreePlan: product.paymentPlans.some(plan => parseFloat(plan.price.toString()) === 0),
        hasTrialPlans: product.paymentPlans.some(plan => plan.trialDays && plan.trialDays > 0),
        currency: product.paymentPlans[0]?.currency || 'ILS',
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching public payment plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment plans' },
      { status: 500 }
    );
  }
}
