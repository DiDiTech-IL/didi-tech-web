import { prisma } from '@/lib/prisma';
import { TicketStatus, Priority } from '@prisma/client';

export class TicketService {
  static async getAllTickets() {
    return await prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  static async getTicketById(id: string) {
    return await prisma.ticket.findUnique({
      where: { id },
      include: {
        client: true,
        assignedTo: true,
      },
    });
  }

  static async createTicket(data: {
    title: string;
    description: string;
    clientId: string;
    priority?: Priority;
    assignedToId?: string;
  }) {
    return await prisma.ticket.create({
      data,
      include: {
        client: true,
        assignedTo: true,
      },
    });
  }

  static async updateTicket(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      status: TicketStatus;
      priority: Priority;
      assignedToId: string;
    }>
  ) {
    return await prisma.ticket.update({
      where: { id },
      data,
      include: {
        client: true,
        assignedTo: true,
      },
    });
  }

  static async deleteTicket(id: string) {
    return await prisma.ticket.delete({
      where: { id },
    });
  }

  static async getTicketStats() {
    const [total, open, inProgress, resolved, closed] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: 'OPEN' } }),
      prisma.ticket.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.ticket.count({ where: { status: 'RESOLVED' } }),
      prisma.ticket.count({ where: { status: 'CLOSED' } }),
    ]);

    return { total, open, inProgress, resolved, closed };
  }

  static async getTicketsByClient(clientId: string) {
    return await prisma.ticket.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  static async getTicketsByUser(userId: string) {
    return await prisma.ticket.findMany({
      where: { assignedToId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
    });
  }
}
