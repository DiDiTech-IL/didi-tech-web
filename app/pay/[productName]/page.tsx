import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import EnhancedPaymentPage from './enhanced-payment-page-v2';

interface PaymentPageProps {
  params: Promise<{
    productName: string;
  }>;
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { productName } = await params;
  const headersList = await headers();
  
  // Get product name from middleware header or params
  const productNameFromHeader = headersList.get("x-product-name");
  const finalProductName = productNameFromHeader || productName;
  
  // Validate that the product exists and is live
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        {
          name: {
            equals: finalProductName,
            mode: 'insensitive'
          }
        },
        {
          nameEn: {
            equals: finalProductName,
            mode: 'insensitive'
          }
        }
      ],
      status: 'LIVE'
    },
    select: {
      id: true,
      name: true,
      nameEn: true
    }
  });

  if (!product) {
    notFound();
  }

  return <EnhancedPaymentPage />;
}
