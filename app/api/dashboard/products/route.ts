"use server";
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      include: {
        paymentPlans: {
          orderBy: { displayOrder: 'asc' }
        },
        subscriptions: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
                status: true
              }
            }
          }
        },
        _count: {
          select: {
            subscriptions: true,
            payments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform data for frontend
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      nameEn: product.nameEn,
      description: product.description,
      domain: product.domain,
      repository: product.repository,
      status: product.status,
      version: product.version,
      category: product.category,
      features: product.features,
      monthlyRevenue: parseFloat(product.monthlyRevenue.toString()),
      totalRevenue: parseFloat(product.totalRevenue.toString()),
      createdAt: product.createdAt.toISOString(),
      launchedAt: product.launchedAt?.toISOString(),
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
      })),
      subscriptions: product.subscriptions.map(sub => ({
        id: sub.id,
        client: sub.client,
        plan: sub.plan,
        status: sub.status,
        amount: parseFloat(sub.amount.toString()),
        currency: sub.currency,
        billingCycle: sub.billingCycle,
        startDate: sub.startDate.toISOString(),
        nextBilling: sub.nextBilling?.toISOString()
      })),
      stats: {
        totalSubscriptions: product._count.subscriptions,
        totalPayments: product._count.payments
      }
    }));

    return NextResponse.json(transformedProducts);

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
