import { prisma } from '@/lib/prisma';
import { ClientStatus } from '@prisma/client';

export class ClientService {
  static async getAllClients() {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        subscriptions: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                pricing: true,
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
          },
        },
        tickets: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    // Calculate totalProducts and totalRevenue for each client
    return clients.map(client => {
      const activeSubscriptions = client.subscriptions.filter(sub => sub.status === 'ACTIVE');
      const totalProducts = activeSubscriptions.length;
      const totalRevenue = client.payments
        .filter(payment => payment.status === 'COMPLETED')
        .reduce((sum, payment) => sum + Number(payment.amount), 0);

      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        address: client.address,
        totalProducts,
        totalRevenue,
        status: client.status.toLowerCase() as 'active' | 'inactive',
        createdAt: client.createdAt.toISOString(),
        updatedAt: client.updatedAt.toISOString(),
      };
    });
  }

  static async getClientById(id: string) {
    return await prisma.client.findUnique({
      where: { id },
      include: {
        tickets: {
          orderBy: { createdAt: 'desc' },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  static async createClient(data: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    address?: string;
  }) {
    try {
      // Validate required fields
      if (!data.name || data.name.trim() === '') {
        throw new Error('Client name is required');
      }
      
      if (!data.email || data.email.trim() === '') {
        throw new Error('Client email is required');
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        throw new Error('Invalid email format');
      }

      // Check if email already exists
      const existingClient = await prisma.client.findFirst({
        where: { email: data.email.trim() },
      });

      if (existingClient) {
        throw new Error('A client with this email already exists');
      }

      const client = await prisma.client.create({
        data: {
          name: data.name.trim(),
          email: data.email.trim(),
          phone: data.phone?.trim() || null,
          company: data.company?.trim() || null,
          address: data.address?.trim() || null,
          status: ClientStatus.ACTIVE,
        },
      });

      return client;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create client');
    }
  }

  static async updateClient(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      phone: string;
      company: string;
      address: string;
      status: ClientStatus;
    }>
  ) {
    return await prisma.client.update({
      where: { id },
      data,
    });
  }

  static async deleteClient(id: string) {
    return await prisma.client.delete({
      where: { id },
    });
  }

  static async getClientStats() {
    const [total, active, inactive] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { status: 'ACTIVE' } }),
      prisma.client.count({ where: { status: 'INACTIVE' } }),
    ]);

    return { total, active, inactive };
  }
}
