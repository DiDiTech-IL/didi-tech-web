import { prisma } from '@/lib/prisma';

export interface DashboardStats {
  activeProducts: number;
  totalClients: number;
  monthlyRevenue: number;
  pendingInvoices: number;
  monthlyPayments: number;
  openTickets: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  message: string;
  time: string;
  icon: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
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

    const activeProductsCount = statsPromises[0].status === 'fulfilled' ? statsPromises[0].value : 0;
    const clientStats = statsPromises[1].status === 'fulfilled' ? statsPromises[1].value : 0;
    const invoiceStatsResult = statsPromises[2].status === 'fulfilled' ? statsPromises[2].value : [{ _sum: { total: null } }, 0];
    const paymentStats = statsPromises[3].status === 'fulfilled' ? statsPromises[3].value : { _sum: { amount: null } };
    const ticketStats = statsPromises[4].status === 'fulfilled' ? statsPromises[4].value : 0;

    const [monthlyRevenue, pendingInvoices] = Array.isArray(invoiceStatsResult) ? invoiceStatsResult : [{ _sum: { total: null } }, 0];

    return {
      activeProducts: activeProductsCount || 0,
      totalClients: clientStats || 0,
      monthlyRevenue: Number(
        typeof monthlyRevenue === 'object' && monthlyRevenue && '_sum' in monthlyRevenue 
          ? (monthlyRevenue._sum as { total: number | null })?.total || 0 
          : 0
      ),
      pendingInvoices: typeof pendingInvoices === 'number' ? pendingInvoices : 0,
      monthlyPayments: Number(paymentStats._sum?.amount || 0),
      openTickets: ticketStats || 0,
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return {
      activeProducts: 0,
      totalClients: 0,
      monthlyRevenue: 0,
      pendingInvoices: 0,
      monthlyPayments: 0,
      openTickets: 0,
    };
  }
}

export async function getRecentActivities(): Promise<RecentActivity[]> {
  try {
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

    const products = recentProducts.status === 'fulfilled' ? recentProducts.value : [];
    const invoices = recentInvoices.status === 'fulfilled' ? recentInvoices.value : [];
    const payments = recentPayments.status === 'fulfilled' ? recentPayments.value : [];
    const tickets = recentTickets.status === 'fulfilled' ? recentTickets.value : [];

    const activities: Array<{
      id: string;
      type: string;
      message: string;
      time: Date;
      icon: string;
    }> = [];

    products.forEach((product) => {
      activities.push({
        id: `product-${product.id}`,
        type: 'product',
        message: `New product "${product.name}" created`,
        time: product.createdAt,
        icon: 'FolderOpen',
      });
    });

    invoices.forEach((invoice) => {
      activities.push({
        id: `invoice-${invoice.id}`,
        type: 'invoice',
        message: `Invoice ${invoice.invoiceNumber} ${invoice.status.toLowerCase()} for ${invoice.client?.name || 'Unknown Client'}`,
        time: invoice.createdAt,
        icon: 'Receipt',
      });
    });

    payments.forEach((payment) => {
      activities.push({
        id: `payment-${payment.id}`,
        type: 'payment',
        message: `Payment of $${payment.amount} ${payment.status.toLowerCase()} from ${payment.client?.name || 'Unknown Client'}`,
        time: payment.createdAt,
        icon: 'CreditCard',
      });
    });

    tickets.forEach((ticket) => {
      activities.push({
        id: `ticket-${ticket.id}`,
        type: 'ticket',
        message: `${ticket.priority} priority ticket "${ticket.title}" ${ticket.status.toLowerCase()} for ${ticket.client?.name || 'Unknown Client'}`,
        time: ticket.createdAt,
        icon: 'AlertCircle',
      });
    });

    const sortedActivities = activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);

    return sortedActivities.map(activity => ({
      ...activity,
      time: activity.time.toISOString(),
    }));
  } catch (error) {
    console.error('Failed to fetch recent activities:', error);
    return [];
  }
}
