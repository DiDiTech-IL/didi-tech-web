"use server";
import { env } from "@/data/env/server";
import { GeneratePaymentLinkRequest } from "./types";
import { prisma } from "@/lib/prisma";

export async function generatePaymentLinkWithInsert({
  productId,
  user,
}: {
  productId: string;
  user: { id: string; email: string; name: string };
}): Promise<{
  data: {
    page_request_uid: string;
    payment_page_link: string;
    qr_code_image: string;
    hosted_fields_uuid?: string;
  };
}> {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
    },
  }); // pull product from the database using productId

  if (!product) {
    throw new Error("Product not found");
  }

  // Build the items list
  const items = [
    {
      name: product.name,
      price: product.pricing as number,
    },
  ];

  const paymentRequest: GeneratePaymentLinkRequest = {
    payment_page_uid: env.PAYPLUS_PAGE_UID,
    amount: product.pricing as number,
    currency_code: "ILS",
    customer: {
      customer_name: user.name,
      email: user.email,
    },
    refURL_success: `${process.env.LOCAL_PUBLIC_PORT_URL}/products/${productId}/purchase/success`,
    refURL_failure: `${process.env.LOCAL_PUBLIC_PORT_URL}/products/purchase-failure`,
    refURL_callback: `${process.env.LOCAL_PUBLIC_PORT_URL}/api/webhooks/payplus`,
    items,
    more_info: user.id, // userId
    more_info_2: productId, // productId
  };
  const response = await fetch(
    `https://restapidev.payplus.co.il/api/v1.0/PaymentPages/generateLink`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": env.PAYPLUS_API_KEY,
        "secret-key": env.PAYPLUS_SECRET_KEY,
      },
      body: JSON.stringify(paymentRequest),
    }
  );

  const { data } = await response.json();
  if (!response.ok || !data.page_request_uid) {
    console.error("PayPlus Error:", data);
    throw new Error("Failed to generate payment link");
  }

  return { data };
}
