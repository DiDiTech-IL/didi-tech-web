import { prisma } from '@/lib/prisma';
import { InvoiceStatus } from '@prisma/client';

export class InvoiceService {
  static async createInvoice(data: {
    clientId: string;
    productId?: string; // Changed from projectId
    title: string;
    description?: string;
    dueDate: Date;
    taxRate?: number;
    items: Array<{
      description: string;
      quantity: number;
      rate: number;
    }>;
  }) {
    // Calculate totals
    let subtotal = 0;
    data.items.forEach(item => {
      subtotal += item.quantity * item.rate;
    });
    
    const taxRate = data.taxRate || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    // Generate invoice number
    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    return await prisma.invoice.create({
      data: {
        invoiceNumber,
        title: data.title,
        description: data.description,
        clientId: data.clientId,
        productId: data.productId,
        subtotal,
        taxRate,
        taxAmount,
        total,
        dueDate: data.dueDate,
        items: {
          create: data.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate,
          })),
        },
      },
      include: {
        client: true,
        product: true,
        items: true,
        payments: true,
      },
    });
  }

  static async getAllInvoices() {
    return await prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
          },
        },
        items: true,
        payments: true,
      },
    });
  }

  static async getInvoiceById(id: string) {
    return await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        product: true,
        items: true,
        payments: true,
        timeEntries: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  static async updateInvoiceStatus(id: string, status: InvoiceStatus) {
    const updateData: { status: InvoiceStatus; paidDate?: Date } = { status };
    
    if (status === 'PAID') {
      updateData.paidDate = new Date();
    }

    return await prisma.invoice.update({
      where: { id },
      data: updateData,
    });
  }

  static async deleteInvoice(id: string) {
    return await prisma.invoice.delete({
      where: { id },
    });
  }

  static async getInvoiceStats() {
    const [total, draft, sent, paid, overdue] = await Promise.all([
      prisma.invoice.count(),
      prisma.invoice.count({ where: { status: 'DRAFT' } }),
      prisma.invoice.count({ where: { status: 'SENT' } }),
      prisma.invoice.count({ where: { status: 'PAID' } }),
      prisma.invoice.count({ 
        where: { 
          status: { in: ['SENT'] },
          dueDate: { lt: new Date() }
        } 
      }),
    ]);

    const totalRevenue = await prisma.invoice.aggregate({
      _sum: { total: true },
      where: { status: 'PAID' },
    });

    const pending = await prisma.invoice.count({
      where: { status: { in: ['SENT'] } },
    });

    return { 
      total, 
      draft, 
      sent, 
      paid, 
      overdue,
      pending,
      totalRevenue: Number(totalRevenue._sum.total || 0),
    };
  }

  static async createInvoiceFromTimeEntries(
    clientId: string,
    productId: string,
    timeEntryIds: string[],
    title: string,
    dueDate: Date
  ) {
    // Get unbilled time entries
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        id: { in: timeEntryIds },
        billable: true,
        invoiced: false,
        productId,
      },
      include: {
        user: true,
      },
    });

    if (timeEntries.length === 0) {
      throw new Error('No billable time entries found');
    }

    // Group by user and create invoice items
    const userHours = new Map();
    timeEntries.forEach(entry => {
      const key = `${entry.user.firstName} ${entry.user.lastName}`;
      const rate = entry.rate || entry.user.hourlyRate || 0;
      
      if (!userHours.has(key)) {
        userHours.set(key, { hours: 0, rate, descriptions: [] });
      }
      
      const userData = userHours.get(key);
      userData.hours += Number(entry.hours);
      userData.descriptions.push(entry.description);
    });

    const items = Array.from(userHours.entries()).map(([userName, data]) => ({
      description: `${userName} - Development Hours\n${data.descriptions.join(', ')}`,
      quantity: data.hours,
      rate: Number(data.rate),
    }));

    // Create the invoice
    const invoice = await this.createInvoice({
      clientId,
      productId,
      title,
      dueDate,
      items,
    });

    // Mark time entries as invoiced
    await prisma.timeEntry.updateMany({
      where: { id: { in: timeEntryIds } },
      data: { 
        invoiced: true,
        invoiceId: invoice.id,
      },
    });

    return invoice;
  }

  static async generateInvoiceFromProduct(productId: string) {
    // Get product with subscriptions and unbilled time entries
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { client: true },
        },
        timeEntries: {
          where: {
            billable: true,
            invoiced: false,
          },
          include: {
            user: true,
          },
        },
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.subscriptions.length === 0) {
      throw new Error('No active subscriptions found for this product');
    }

    // For now, generate invoice for the first active subscription
    // In a real system, you might want to generate separate invoices for each client
    const subscription = product.subscriptions[0];
    const client = subscription.client;

    // Generate invoice title
    const title = `${product.name} - Subscription & Services`;
    
    // Set due date to 30 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Create invoice items
    const items = [];
    
    // Add subscription fee if billing cycle is due
    items.push({
      description: `${product.name} - ${subscription.plan} Plan`,
      quantity: 1,
      rate: Number(subscription.amount),
    });

    // Add time entries if any
    if (product.timeEntries.length > 0) {
      const userHours = new Map();
      
      product.timeEntries.forEach(entry => {
        const key = `${entry.user.firstName} ${entry.user.lastName}`;
        const rate = entry.rate || entry.user.hourlyRate || 0;
        
        if (!userHours.has(key)) {
          userHours.set(key, { hours: 0, rate: Number(rate), descriptions: [] });
        }
        
        const userData = userHours.get(key);
        userData.hours += Number(entry.hours);
        userData.descriptions.push(entry.description);
      });

      // Add time-based items
      userHours.forEach((data, userName) => {
        if (data.hours > 0) {
          items.push({
            description: `${userName} - Additional Development Hours\n${data.descriptions.join(', ')}`,
            quantity: data.hours,
            rate: data.rate,
          });
        }
      });
    }

    // Create the invoice
    const invoice = await this.createInvoice({
      clientId: client.id,
      productId,
      title,
      dueDate,
      items,
    });

    // Mark time entries as invoiced
    if (product.timeEntries.length > 0) {
      await prisma.timeEntry.updateMany({
        where: { id: { in: product.timeEntries.map(entry => entry.id) } },
        data: { 
          invoiced: true,
          invoiceId: invoice.id,
        },
      });
    }

    return invoice;
  }
}
