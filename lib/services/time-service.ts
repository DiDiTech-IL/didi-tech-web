import { prisma } from '@/lib/prisma';

export class TimeEntryService {
  static async createTimeEntry(data: {
    productId: string;
    userId: string;
    description: string;
    hours: number;
    rate?: number;
    date: Date;
    billable?: boolean;
  }) {
    return await prisma.timeEntry.create({
      data: {
        productId: data.productId,
        userId: data.userId,
        description: data.description,
        hours: data.hours,
        rate: data.rate,
        date: data.date,
        billable: data.billable ?? true,
      },
      include: {
        product: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  static async getTimeEntriesByProduct(productId: string) {
    return await prisma.timeEntry.findMany({
      where: { productId },
      orderBy: { date: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
          },
        },
      },
    });
  }

  static async getTimeEntriesByUser(userId: string) {
    return await prisma.timeEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  static async updateTimeEntry(
    id: string,
    data: Partial<{
      description: string;
      hours: number;
      rate: number;
      date: Date;
      billable: boolean;
    }>
  ) {
    return await prisma.timeEntry.update({
      where: { id },
      data,
    });
  }

  static async deleteTimeEntry(id: string) {
    return await prisma.timeEntry.delete({
      where: { id },
    });
  }

  static async getUnbilledTimeEntries(productId?: string) {
    const where = {
      billable: true,
      invoiced: false,
      ...(productId && { productId }),
    };

    return await prisma.timeEntry.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        product: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  static async getTimeStats(productId?: string) {
    const where = productId ? { productId } : {};

    const [totalHours, billableHours, unbilledHours, totalEarnings] = await Promise.all([
      prisma.timeEntry.aggregate({
        where,
        _sum: { hours: true },
      }),
      prisma.timeEntry.aggregate({
        where: { ...where, billable: true },
        _sum: { hours: true },
      }),
      prisma.timeEntry.aggregate({
        where: { ...where, billable: true, invoiced: false },
        _sum: { hours: true },
      }),
      prisma.$queryRaw`
        SELECT SUM(hours * COALESCE(rate, 0)) as total
        FROM time_entries
        WHERE billable = true
        ${productId ? `AND product_id = '${productId}'` : ''}
      `,
    ]);

    return {
      totalHours: Number(totalHours._sum?.hours || 0),
      billableHours: Number(billableHours._sum?.hours || 0),
      unbilledHours: Number(unbilledHours._sum?.hours || 0),
      totalEarnings: Number((totalEarnings as Array<{ total: number }>)[0]?.total || 0),
    };
  }

  static async getAllTimeEntries() {
    return await prisma.timeEntry.findMany({
      orderBy: { date: 'desc' },
      include: {
        product: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
          },
        },
      },
    });
  }
}
