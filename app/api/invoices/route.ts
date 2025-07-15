"use server";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { InvoiceService } from "@/lib/services/invoice-service";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoices = await InvoiceService.getAllInvoices();
    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, clientId, dueDate, items, notes } = body;

    if (!productId || !clientId) {
      return NextResponse.json(
        { error: "Product ID and Client ID are required" },
        { status: 400 }
      );
    }

    const invoice = await InvoiceService.createInvoice({
      productId: productId,
      clientId,
      dueDate: dueDate ? new Date(dueDate) : new Date(),
      items: items || [],
      title: notes || "",
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
