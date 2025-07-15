"use server";
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        redemptions: {
          select: {
            id: true,
            userEmail: true,
            discountAmount: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    );
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
      code,
      name,
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      usageType,
      maxUses,
      maxUsesPerUser,
      validFrom,
      validUntil,
      isGlobal,
      productIds,
      planIds,
      allowedEmails,
      allowedDomains,
      minimumAmount,
      firstTimeOnly,
      isActive
    } = body;

    // Validate required fields
    if (!code || !name || !discountType || discountValue === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: 'Coupon code already exists' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        name,
        description,
        discountType,
        discountValue: parseFloat(discountValue),
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
        usageType,
        maxUses: maxUses ? parseInt(maxUses) : null,
        maxUsesPerUser: maxUsesPerUser ? parseInt(maxUsesPerUser) : null,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : null,
        isGlobal: Boolean(isGlobal),
        productIds: productIds || [],
        planIds: planIds || [],
        allowedEmails: allowedEmails || [],
        allowedDomains: allowedDomains || [],
        minimumAmount: minimumAmount ? parseFloat(minimumAmount) : null,
        firstTimeOnly: Boolean(firstTimeOnly),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    );
  }
}
