"use server";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface CouponValidation {
  isValid: boolean;
  coupon?: {
    id: string;
    code: string;
    name: string;
    discountType: string;
    discountValue: number;
    maxDiscountAmount?: number;
    minimumAmount?: number;
  };
  error?: string;
  discountAmount?: number;
  finalAmount?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { 
      couponCode, 
      productId, 
      planId, 
      userEmail, 
      originalAmount 
    } = await request.json();

    if (!couponCode || !originalAmount) {
      return NextResponse.json<CouponValidation>({
        isValid: false,
        error: 'Coupon code and amount are required'
      });
    }

    // Find the coupon in the database
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
      include: {
        redemptions: {
          where: {
            userEmail: userEmail
          }
        }
      }
    });

    if (!coupon) {
      return NextResponse.json<CouponValidation>({
        isValid: false,
        error: 'Coupon not found'
      });
    }

    if (!coupon.isActive) {
      return NextResponse.json<CouponValidation>({
        isValid: false,
        error: 'Coupon is no longer active'
      });
    }

    // Check expiration
    if (coupon.validUntil && new Date() > coupon.validUntil) {
      return NextResponse.json<CouponValidation>({
        isValid: false,
        error: 'Coupon has expired'
      });
    }

    // Check usage limits
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return NextResponse.json<CouponValidation>({
        isValid: false,
        error: 'Coupon usage limit reached'
      });
    }

    // Check per-user usage limits
    if (coupon.maxUsesPerUser && userEmail) {
      const userUsageCount = coupon.redemptions.length;
      if (userUsageCount >= coupon.maxUsesPerUser) {
        return NextResponse.json<CouponValidation>({
          isValid: false,
          error: 'You have already used this coupon the maximum number of times'
        });
      }
    }

    // Check minimum amount
    if (coupon.minimumAmount && originalAmount < parseFloat(coupon.minimumAmount.toString())) {
      return NextResponse.json<CouponValidation>({
        isValid: false,
        error: `Minimum order amount is $${coupon.minimumAmount}`
      });
    }

    // Check product restrictions
    if (productId && coupon.productIds.length > 0) {
      const isProductAllowed = coupon.productIds.includes(productId);
      if (!isProductAllowed) {
        return NextResponse.json<CouponValidation>({
          isValid: false,
          error: 'This coupon is not valid for the selected product'
        });
      }
    }

    // Check plan restrictions
    if (planId && coupon.planIds.length > 0) {
      const isPlanAllowed = coupon.planIds.includes(planId);
      if (!isPlanAllowed) {
        return NextResponse.json<CouponValidation>({
          isValid: false,
          error: 'This coupon is not valid for the selected plan'
        });
      }
    }

    // Check email restrictions
    if (coupon.allowedEmails.length > 0 && userEmail) {
      const isEmailAllowed = coupon.allowedEmails.includes(userEmail);
      if (!isEmailAllowed) {
        return NextResponse.json<CouponValidation>({
          isValid: false,
          error: 'This coupon is not available for your email address'
        });
      }
    }

    // Check domain restrictions
    if (coupon.allowedDomains.length > 0 && userEmail) {
      const emailDomain = userEmail.split('@')[1];
      const isDomainAllowed = coupon.allowedDomains.includes(emailDomain);
      if (!isDomainAllowed) {
        return NextResponse.json<CouponValidation>({
          isValid: false,
          error: 'This coupon is not available for your email domain'
        });
      }
    }

    // Check first-time customer restriction
    if (coupon.firstTimeOnly && userEmail) {
      const existingPayments = await prisma.payment.count({
        where: {
          client: {
            email: userEmail
          },
          status: 'COMPLETED'
        }
      });

      if (existingPayments > 0) {
        return NextResponse.json<CouponValidation>({
          isValid: false,
          error: 'This coupon is only valid for first-time customers'
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    
    switch (coupon.discountType) {
      case 'PERCENTAGE':
        discountAmount = (originalAmount * parseFloat(coupon.discountValue.toString())) / 100;
        if (coupon.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, parseFloat(coupon.maxDiscountAmount.toString()));
        }
        break;
      case 'FIXED_AMOUNT':
        discountAmount = Math.min(parseFloat(coupon.discountValue.toString()), originalAmount);
        break;
      case 'FREE_TRIAL':
        discountAmount = originalAmount;
        break;
      case 'FREE_MONTHS':
        discountAmount = originalAmount;
        break;
    }

    const finalAmount = Math.max(0, originalAmount - discountAmount);

    return NextResponse.json<CouponValidation>({
      isValid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: parseFloat(coupon.discountValue.toString()),
        maxDiscountAmount: coupon.maxDiscountAmount ? parseFloat(coupon.maxDiscountAmount.toString()) : undefined,
        minimumAmount: coupon.minimumAmount ? parseFloat(coupon.minimumAmount.toString()) : undefined
      },
      discountAmount,
      finalAmount
    });

  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json<CouponValidation>({
      isValid: false,
      error: 'Failed to validate coupon'
    });
  }
}
