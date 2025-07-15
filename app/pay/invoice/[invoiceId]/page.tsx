import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import InvoicePage from './InvoicePage';

interface PageProps {
    params: Promise<{
        invoiceId: string;
    }>;
}

async function getInvoiceData(invoiceId: string) {
    try {
        const subscription = await prisma.productSubscription.findFirst({
            where: {
                usageData: {
                    path: ['paymentRequestUid'],
                    equals: invoiceId
                }
            },
            include: {
                client: true,
                product: true,
                paymentPlan: true
            }
        });

        if (!subscription) {
            return null;
        }

        // Get the payment record
        const payment = await prisma.payment.findFirst({
            where: {
                productId: subscription.productId,
                clientId: subscription.clientId,
                status: 'COMPLETED'
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!payment) {
            return null;
        }

        const usageData = subscription.usageData as Record<string, unknown> | null;

        return {
            invoice: {
                id: invoiceId,
                number: `INV-${payment.id.slice(-8).toUpperCase()}`,
                date: payment.createdAt,
                amount: parseFloat(subscription.amount.toString()),
                currency: subscription.currency,
                status: 'paid' as const,
                transactionId: payment.transactionId
            },
            client: {
                name: subscription.client.name,
                email: subscription.client.email,
                company: subscription.client.company,
                phone: subscription.client.phone
            },
            product: {
                name: subscription.product.name,
                domain: subscription.product.domain
            },
            plan: subscription.paymentPlan ? {
                name: subscription.paymentPlan.name,
                type: subscription.paymentPlan.planType
            } : null,
            account: {
                subdomain: usageData?.subdomain as string,
                fullUrl: `https://${usageData?.subdomain}.${subscription.product.domain}`
            }
        };
    } catch (error) {
        console.error('Failed to fetch invoice data:', error);
        return null;
    }
}

export default async function Page({ params }: PageProps) {
    const { invoiceId } = await params;
    const invoiceData = await getInvoiceData(invoiceId);

    if (!invoiceData) {
        notFound();
    }

    return (
        <Suspense fallback={<div>טוען...</div>}>
            <InvoicePage data={invoiceData} />
        </Suspense>
    );
}
