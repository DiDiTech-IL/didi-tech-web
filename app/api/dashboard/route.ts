"use server";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get recent activities from multiple sources with error handling
    const [recentProducts, recentInvoices, recentPayments, recentTickets] = await Promise.allSettled([
      prisma.product.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      }).catch(() => []),
      prisma.invoice.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          invoiceNumber: true,
          title: true,
          status: true,
          createdAt: true,
          client: { select: { name: true } },
        },
      }).catch(() => []),
      prisma.payment.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          client: { select: { name: true } },
        },
      }).catch(() => []),
      prisma.ticket.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          createdAt: true,
          client: { select: { name: true } },
        },
      }).catch(() => []),
    ]);

    // Extract values from Promise.allSettled results
    const products = recentProducts.status === 'fulfilled' ? recentProducts.value : [];
    const invoices = recentInvoices.status === 'fulfilled' ? recentInvoices.value : [];
    const payments = recentPayments.status === 'fulfilled' ? recentPayments.value : [];
    const tickets = recentTickets.status === 'fulfilled' ? recentTickets.value : [];

    // Format activities with consistent structure
    const activities: Array<{
      id: string;
      type: string;
      message: string;
      time: Date;
      icon: string;
    }> = [];

    // Add recent products
    products.forEach((product) => {
      activities.push({
        id: `product-${product.id}`,
        type: 'product',
        message: `New product "${product.name}" created`,
        time: product.createdAt,
        icon: 'FolderOpen',
      });
    });

    // Add recent invoices
    invoices.forEach((invoice) => {
      activities.push({
        id: `invoice-${invoice.id}`,
        type: 'invoice',
        message: `Invoice ${invoice.invoiceNumber} ${invoice.status.toLowerCase()} for ${invoice.client?.name || 'Unknown Client'}`,
        time: invoice.createdAt,
        icon: 'Receipt',
      });
    });

    // Add recent payments
    payments.forEach((payment) => {
      activities.push({
        id: `payment-${payment.id}`,
        type: 'payment',
        message: `Payment of $${payment.amount} ${payment.status.toLowerCase()} from ${payment.client?.name || 'Unknown Client'}`,
        time: payment.createdAt,
        icon: 'CreditCard',
      });
    });

    // Add recent tickets
    tickets.forEach((ticket) => {
      activities.push({
        id: `ticket-${ticket.id}`,
        type: 'ticket',
        message: `${ticket.priority} priority ticket "${ticket.title}" ${ticket.status.toLowerCase()} for ${ticket.client?.name || 'Unknown Client'}`,
        time: ticket.createdAt,
        icon: 'AlertCircle',
      });
    });

    // Sort all activities by time and take the most recent 10
    const sortedActivities = activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);

    // Get comprehensive stats with error handling
    const statsPromises = await Promise.allSettled([
      prisma.product.count({
        where: { status: { in: ['LIVE', 'BETA'] } },
      }).catch(() => 0),
      prisma.client.count().catch(() => 0),
      Promise.all([
        prisma.invoice.aggregate({
          _sum: { total: true },
          where: {
            status: 'PAID',
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }).catch(() => ({ _sum: { total: null } })),
        prisma.invoice.count({ where: { status: 'SENT' } }).catch(() => 0),
      ]).catch(() => [{ _sum: { total: null } }, 0]),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }).catch(() => ({ _sum: { amount: null } })),
      prisma.ticket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }).catch(() => 0),
    ]);

    // Extract stats with safe defaults
    const activeProductsCount = statsPromises[0].status === 'fulfilled' ? statsPromises[0].value : 0;
    const clientStats = statsPromises[1].status === 'fulfilled' ? statsPromises[1].value : 0;
    const invoiceStatsResult = statsPromises[2].status === 'fulfilled' ? statsPromises[2].value : [{ _sum: { total: null } }, 0];
    const paymentStats = statsPromises[3].status === 'fulfilled' ? statsPromises[3].value : { _sum: { amount: null } };
    const ticketStats = statsPromises[4].status === 'fulfilled' ? statsPromises[4].value : 0;

    const [monthlyRevenue, pendingInvoices] = Array.isArray(invoiceStatsResult) ? invoiceStatsResult : [{ _sum: { total: null } }, 0];

    const stats = {
      activeProducts: activeProductsCount || 0,
      totalClients: clientStats || 0,
      monthlyRevenue: Number(
        typeof monthlyRevenue === 'object' && monthlyRevenue && '_sum' in monthlyRevenue 
          ? (monthlyRevenue._sum as { total: number | null })?.total || 0 
          : 0
      ),
      pendingInvoices: pendingInvoices || 0,
      monthlyPayments: Number(paymentStats._sum?.amount || 0),
      openTickets: ticketStats || 0,
    };

    return NextResponse.json({
      stats,
      recentActivities: sortedActivities,
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    
    // Return safe fallback data instead of error
    return NextResponse.json({
      stats: {
        activeProducts: 0,
        totalClients: 0,
        monthlyRevenue: 0,
        pendingInvoices: 0,
        monthlyPayments: 0,
        openTickets: 0,
      },
      recentActivities: [],
    });
  }
}
