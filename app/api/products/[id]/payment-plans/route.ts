"use server";
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const includeInactive = url.searchParams.get('includeInactive') === 'true';
    
    // Get product with payment plans
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        paymentPlans: {
          where: includeInactive ? {} : { isActive: true },
          orderBy: { displayOrder: 'asc' }
        },
        subscriptions: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
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
            productId: id,
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
            productId: id,
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
        productId: id,
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          domain: product.domain,
        },
        plans: defaultPlans,
      });
    }

    return NextResponse.json({
      productId: id,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        domain: product.domain,
      },
      plans: product.paymentPlans,
    });

  } catch (error) {
    console.error('Error fetching payment plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment plans' },
      { status: 500 }
    );
  }
}
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: productId } = await params;
    const body = await request.json();

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      );
    }

    // Get the highest display order
    const maxOrder = await prisma.paymentPlan.aggregate({
      where: { productId },
      _max: { displayOrder: true }
    });

    // Create new payment plan in database
    const newPlan = await prisma.paymentPlan.create({
      data: {
        productId,
        name: body.name,
        description: body.description,
        planType: body.planType || 'RECURRING',
        price: parseFloat(body.price),
        currency: body.currency || 'ILS',
        billingInterval: body.billingInterval || 'MONTHLY',
        trialDays: body.trialDays ? parseInt(body.trialDays) : null,
        features: Array.isArray(body.features) ? body.features : [],
        userLimit: body.userLimit ? parseInt(body.userLimit) : null,
        storageLimit: body.storageLimit ? parseInt(body.storageLimit) : null,
        apiCallsLimit: body.apiCallsLimit ? parseInt(body.apiCallsLimit) : null,
        discountPercentage: body.discountPercentage ? parseFloat(body.discountPercentage) : null,
        discountValidUntil: body.discountValidUntil ? new Date(body.discountValidUntil) : null,
        isPopular: body.isPopular || false,
        isActive: body.isActive !== undefined ? body.isActive : true,
        displayOrder: body.displayOrder || (maxOrder._max.displayOrder || 0) + 1,
      },
    });

    return NextResponse.json({
      plan: newPlan,
      product: {
        id: product.id,
        name: product.name,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating payment plan:', error);
    return NextResponse.json(
      { error: 'Failed to create payment plan' },
      { status: 500 }
    );
  }
}
