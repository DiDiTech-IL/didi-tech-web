"use server";

import { env } from "@/data/env/server";
import { prisma } from "@/lib/prisma";
import { ProductStatus, SubscriptionStatus } from "@prisma/client";

interface GeneratePaymentLinkRequest {
  payment_page_uid: string;
  amount: number;
  currency_code: string;
  customer: {
    customer_name: string;
    email: string;
  };
  refURL_success: string;
  refURL_failure: string;
  refURL_callback: string;
  items: Array<{
    name: string;
    price: number;
  }>;
  more_info: string;
  more_info_2: string;
  more_info_3?: string;
}

export async function generatePaymentLinkForProduct({
  productName,
  planId,
  customerInfo,
  couponCode,
}: {
  productName: string;
  planId: string;
  customerInfo: {
    email: string;
    companyName: string;
    fullName: string;
    phone: string;
    subdomain: string;
  };
  couponCode?: string;
}): Promise<{
  data: {
    page_request_uid: string;
    payment_page_link: string;
    qr_code_image: string;
    hosted_fields_uuid?: string;
  };
}> {
  // Get product and plan details
  const product = await prisma.product.findFirst({
    where: {
      nameEn: productName.toLowerCase(),
      status: { not: ProductStatus.RETIRED },
    },
    include: {
      paymentPlans: {
        where: { id: planId, isActive: true },
      },
    },
  });

  if (!product || !product.paymentPlans.length) {
    throw new Error("Product or payment plan not found");
  }

  const plan = product.paymentPlans[0];
  let finalAmount = Number(plan.price);
  let discountAmount = 0;
  let appliedCoupon = null;

  // Apply coupon if provided
  if (couponCode) {
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: couponCode.toUpperCase(),
        isActive: true,
        OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
        AND: [
          {
            OR: [
              { maxUses: null },
              { currentUses: { lt: prisma.coupon.fields.maxUses } },
            ],
          },
        ],
      },
    });

    if (coupon) {
      if (coupon.discountType === "PERCENTAGE") {
        discountAmount =
          (Number(plan.price) * Number(coupon.discountValue)) / 100;
        if (
          coupon.maxDiscountAmount &&
          discountAmount > Number(coupon.maxDiscountAmount)
        ) {
          discountAmount = Number(coupon.maxDiscountAmount);
        }
      } else if (coupon.discountType === "FIXED_AMOUNT") {
        discountAmount = Number(coupon.discountValue);
      }

      finalAmount = Math.max(0, Number(plan.price) - discountAmount);
      appliedCoupon = coupon;
    }
  }

  // Check if client already exists
  let client = await prisma.client.findFirst({
    where: { email: customerInfo.email },
  });

  // Create client if doesn't exist
  if (!client) {
    client = await prisma.client.create({
      data: {
        name: customerInfo.fullName,
        email: customerInfo.email,
        company: customerInfo.companyName,
        phone: customerInfo.phone,
      },
    });
  }

  // Check subdomain availability by looking for existing client with that company name
  const existingCompanySubscription =
    await prisma.productSubscription.findFirst({
      where: {
        productId: product.id,
        client: {
          company: customerInfo.subdomain, // Using company field to store subdomain
        },
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
      },
    });

  if (existingCompanySubscription) {
    throw new Error("Subdomain already taken. Please choose a different one.");
  }

  // Build the items list
  const items = [
    {
      name: `${product.name} - ${plan.name}`,
      price: finalAmount,
    },
  ];

  if (discountAmount > 0 && appliedCoupon) {
    items.push({
      name: `Discount: ${appliedCoupon.name}`,
      price: -discountAmount,
    });
  }

  const paymentRequest: GeneratePaymentLinkRequest = {
    payment_page_uid: env.PAYPLUS_PAGE_UID!,
    amount: finalAmount,
    currency_code: "ILS",
    customer: {
      customer_name: customerInfo.fullName,
      email: customerInfo.email,
    },
    refURL_success: `https://pay.tachles.dev/${productName}/payment-success?subdomain=${customerInfo.subdomain}`,
    refURL_failure: `https://pay.tachles.dev/${productName}?error=payment_failed`,
    refURL_callback: `https://pay.tachles.dev/api/webhooks/payplus`,
    items,
    more_info: client.id, // clientId
    more_info_2: product.id, // productId
    more_info_3: JSON.stringify({
      planId: plan.id,
      subdomain: customerInfo.subdomain,
      couponCode: appliedCoupon?.code,
    }),
  };
  const response = await fetch(
    `https://restapidev.payplus.co.il/api/v1.0/PaymentPages/generateLink`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": process.env.PAYPLUS_API_KEY!,
        "secret-key": process.env.PAYPLUS_SECRET_KEY!,
      },
      body: JSON.stringify(paymentRequest),
    }
  );

  const { data } = await response.json();

  if (!response.ok || !data.page_request_uid) {
    console.error("PayPlus Error:", data);
    throw new Error("Failed to generate payment link");
  }

  // Create or update subscription record
  await prisma.productSubscription.upsert({
    where: {
      productId_clientId: {
        productId: product.id,
        clientId: client.id,
      },
    },
    update: {
      paymentPlanId: plan.id,
      plan: plan.name,
      status: SubscriptionStatus.TRIAL, // Use TRIAL as temporary status until payment confirms
      billingCycle: plan.billingInterval,
      amount: finalAmount,
      currency: plan.currency,
      startDate: new Date(),
      endDate:
        plan.planType === "ONE_TIME"
          ? null
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      nextBilling:
        plan.planType === "RECURRING"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : null,
      usageData: {
        paymentRequestUid: data.page_request_uid,
        subdomain: customerInfo.subdomain,
        couponCode: appliedCoupon?.code,
      },
    },
    create: {
      productId: product.id,
      clientId: client.id,
      paymentPlanId: plan.id,
      plan: plan.name,
      status: SubscriptionStatus.TRIAL, // Use TRIAL as temporary status until payment confirms
      billingCycle: plan.billingInterval,
      amount: finalAmount,
      currency: plan.currency,
      startDate: new Date(),
      endDate:
        plan.planType === "ONE_TIME"
          ? null
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      nextBilling:
        plan.planType === "RECURRING"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : null,
      usageData: {
        paymentRequestUid: data.page_request_uid,
        subdomain: customerInfo.subdomain,
        couponCode: appliedCoupon?.code,
      },
    },
  });

  // Update coupon usage if applied
  if (appliedCoupon) {
    await prisma.coupon.update({
      where: { id: appliedCoupon.id },
      data: { currentUses: { increment: 1 } },
    });
  }

  return { data };
}
