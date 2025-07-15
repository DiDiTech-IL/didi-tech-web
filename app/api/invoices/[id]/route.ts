"use server";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { InvoiceService } from "@/lib/services/invoice-service";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const invoice = await InvoiceService.getInvoiceById(id);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Check if client wants transformed data for PDF generation
    const url = new URL(request.url);
    const transform = url.searchParams.get('transform');

    if (transform === 'pdf') {
      // Transform the data to match the PDF generator interface
      const transformedInvoice = {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        title: invoice.title,
        description: invoice.description || undefined,
        createdAt: invoice.createdAt,
        issueDate: invoice.createdAt, // Use createdAt as issueDate
        dueDate: invoice.dueDate,
        status: invoice.status,
        subtotal: Number(invoice.subtotal),
        taxRate: invoice.taxRate ? Number(invoice.taxRate) : undefined,
        taxAmount: invoice.taxAmount ? Number(invoice.taxAmount) : undefined,
        total: Number(invoice.total),
        currency: invoice.currency || 'USD',
        client: {
          id: invoice.client.id,
          name: invoice.client.name,
          email: invoice.client.email,
          company: invoice.client.company || undefined,
          address: invoice.client.address || undefined,
          city: invoice.client.city || undefined,
          country: invoice.client.country || undefined,
          postalCode: invoice.client.postalCode || undefined,
        },
        product: invoice.product ? {
          id: invoice.product.id,
          name: invoice.product.name,
          description: invoice.product.description || undefined,
        } : undefined,
        items: invoice.items.map(item => ({
          id: item.id,
          description: item.description,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
          amount: Number(item.amount),
        })),
      };
      return NextResponse.json(transformedInvoice);
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const invoice = await InvoiceService.updateInvoiceStatus(id, status);
    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    await InvoiceService.deleteInvoice(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
