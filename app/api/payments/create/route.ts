"use server";
import { PayplusFacade } from '@/lib/payments/payplus-facade';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

interface PaymentRequest {
  productId: string;
  planId: string;
  customerInfo: {
    email: string;
    fullName: string;
    companyName: string;
    phone: string;
    subdomain: string;
  };
  couponCode?: string;
  amount: number;
  currency: string;
  billingInterval: string;
}

export async function POST(request: NextRequest) {
  try {
    const {
      productId,
      planId,
      customerInfo,
      couponCode,
      amount,
      currency,
      billingInterval
    }: PaymentRequest = await request.json();

    // Validate required fields
    if (!productId || !planId || !customerInfo.email || !customerInfo.fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get product and plan details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        paymentPlans: {
          where: { id: planId }
        }
      }
    });

    if (!product || product.paymentPlans.length === 0) {
      return NextResponse.json(
        { error: 'Product or plan not found' },
        { status: 404 }
      );
    }

    const plan = product.paymentPlans[0];

    // Check if client already exists, create if not
    let client = await prisma.client.findUnique({
      where: { email: customerInfo.email }
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          name: customerInfo.fullName,
          email: customerInfo.email,
          company: customerInfo.companyName,
          phone: customerInfo.phone || null,
          status: 'ACTIVE'
        }
      });
    }

    // Handle coupon validation and redemption
    let finalAmount = amount;
    let discountAmount = 0;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() }
      });

      if (coupon && coupon.isActive) {
        // Calculate discount
        switch (coupon.discountType) {
          case 'PERCENTAGE':
            discountAmount = (amount * parseFloat(coupon.discountValue.toString())) / 100;
            if (coupon.maxDiscountAmount) {
              discountAmount = Math.min(discountAmount, parseFloat(coupon.maxDiscountAmount.toString()));
            }
            break;
          case 'FIXED_AMOUNT':
            discountAmount = Math.min(parseFloat(coupon.discountValue.toString()), amount);
            break;
          default:
            discountAmount = 0;
        }

        finalAmount = Math.max(0, amount - discountAmount);

        // Create coupon redemption record
        await prisma.couponRedemption.create({
          data: {
            couponId: coupon.id,
            userEmail: customerInfo.email,
            productId: productId,
            planId: planId,
            originalAmount: amount,
            discountAmount: discountAmount,
            finalAmount: finalAmount
          }
        });

        // Update coupon usage
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: {
            currentUses: { increment: 1 },
            totalRedemptions: { increment: 1 },
            totalDiscountGiven: { increment: discountAmount }
          }
        });
      }
    }

    // Create payment record in database first
    const payment = await prisma.payment.create({
      data: {
        amount: finalAmount,
        currency: currency,
        status: 'PENDING',
        description: `${product.name} - ${plan.name}`,
        clientId: client.id,
        productId: productId,
        paymentPlanId: planId
      }
    });

    // Prepare items for PayPlus
    const items = [{
      name: `${product.name} - ${plan.name}`,
      description: plan.description || `${plan.name} subscription`,
      quantity: 1,
      price: finalAmount,
      productUid: planId
    }];

    // Prepare recurring settings if applicable
    let recurringSettings = undefined;
    if (plan.planType === 'RECURRING' && plan.billingInterval !== 'ONE_TIME') {
      recurringSettings = {
        recurringType: 0, // Fixed amount
        recurringRange: plan.billingInterval === 'MONTHLY' ? 1 : 
                       plan.billingInterval === 'YEARLY' ? 2 : 1, // 1=months, 2=years
        numberOfCharges: 0, // 0 = unlimited
        startDateOnPaymentDate: true
      };
    }

    // Initialize payment with PayPlus
    const paymentFacade = new PayplusFacade();
    const paymentResponse = await paymentFacade.createPayment({
      amount: finalAmount,
      currency: currency,
      description: `${product.name} - ${plan.name}`,
      customerEmail: customerInfo.email,
      customerName: customerInfo.fullName,
      orderId: payment.id,
      successUrl: `pay.tachles.dev/payment/success?order=${payment.id}`,
      cancelUrl: `pay.tachles.dev/pay/${encodeURIComponent(product.name)}`,
      webhookUrl: `pay.tachles.dev/api/webhooks/payments`,
      metadata: {
        productId,
        planId,
        clientId: client.id,
        subdomain: customerInfo.subdomain,
        couponCode: couponCode || null,
        companyName: customerInfo.companyName,
        phone: customerInfo.phone
      },
      items,
      recurring: recurringSettings
    });

    if (!paymentResponse.success) {
      // Update payment status to failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });

      return NextResponse.json({
        success: false,
        error: paymentResponse.error || 'Failed to create payment'
      }, { status: 400 });
    }

    // Update payment with PayPlus response data
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        transactionId: paymentResponse.paymentPageUid,
        // Store PayPlus response in a JSON field if you have one, or description
        description: `${product.name} - ${plan.name} | PageUID: ${paymentResponse.paymentPageUid}`
      }
    });

    // Create or update subscription
    await prisma.productSubscription.upsert({
      where: {
        productId_clientId: {
          productId: productId,
          clientId: client.id
        }
      },
      update: {
        paymentPlanId: planId,
        plan: plan.name,
        status: 'ACTIVE',
        billingCycle: billingInterval.toLowerCase(),
        amount: finalAmount,
        currency: currency,
        nextBilling: plan.billingInterval === 'MONTHLY' 
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : plan.billingInterval === 'YEARLY'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          : null
      },
      create: {
        productId: productId,
        clientId: client.id,
        paymentPlanId: planId,
        plan: plan.name,
        status: 'ACTIVE',
        billingCycle: billingInterval.toLowerCase(),
        amount: finalAmount,
        currency: currency,
        nextBilling: plan.billingInterval === 'MONTHLY' 
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : plan.billingInterval === 'YEARLY'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          : null
      }
    });

    return NextResponse.json({
      success: true,
      paymentUrl: paymentResponse.paymentUrl,
      qrCodeImage: paymentResponse.qrCodeImage,
      paymentId: payment.id,
      paymentPageUid: paymentResponse.paymentPageUid,
      finalAmount,
      discountAmount,
      message: 'Payment initiated successfully'
    });

  } catch (error) {
    console.error('Error processing payment request:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process payment' 
      },
      { status: 500 }
    );
  }
}
