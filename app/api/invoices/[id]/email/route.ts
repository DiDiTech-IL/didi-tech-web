import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendInvoiceEmail } from "@/lib/email-service";
import {
  generateInvoicePDF,
  generateInvoicePDFHebrew,
} from "@/lib/pdf-generator";

interface InvoiceParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: InvoiceParams) {
  const { id } = await params;
  try {
    console.log(`[EMAIL_API] Sending email for invoice ID: ${id}`);

    const body = await request.json();
    const { language = "he" } = body;

    // Fetch invoice data
    const invoice = await prisma.invoice.findUnique({
      where: { id: id },
      include: {
        client: true,
        items: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (!invoice.client?.email) {
      return NextResponse.json(
        { error: "Client email address not found" },
        { status: 400 }
      );
    }

    // Prepare invoice data for PDF generation
    const invoiceData = {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      title: invoice.title,
      description: invoice.description || "",
      createdAt: invoice.createdAt,
      issueDate: invoice.createdAt,
      dueDate: invoice.dueDate,
      status: invoice.status,
      subtotal: Number(invoice.subtotal),
      taxRate: Number(invoice.taxRate),
      taxAmount: Number(invoice.taxAmount),
      total: Number(invoice.total),
      currency: invoice.currency || "ILS",
      client: {
        id: invoice.client.id,
        name: invoice.client.name,
        email: invoice.client.email,
        company: invoice.client.company || "",
        address: invoice.client.address || "",
        city: invoice.client.city || "",
        country: invoice.client.country || "",
        postalCode: invoice.client.postalCode || "",
      },
      items: invoice.items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        amount: Number(item.amount),
      })),
    };

    // Generate PDF
    console.log(
      `[EMAIL_API] Generating ${language} PDF for invoice ${invoice.invoiceNumber}`
    );
    let pdfBuffer: Buffer;

    try {
      let pdfBlob: Blob;

      if (language === "he") {
        pdfBlob = generateInvoicePDFHebrew(invoiceData);
      } else {
        pdfBlob = generateInvoicePDF(invoiceData);
      }

      // Convert to buffer
      const arrayBuffer = await pdfBlob.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuffer);

      console.log(
        `[EMAIL_API] PDF generated successfully, size: ${pdfBuffer.length} bytes`
      );
    } catch (pdfError) {
      console.error("[EMAIL_API] PDF generation failed:", pdfError);
      return NextResponse.json(
        { error: "Failed to generate PDF" },
        { status: 500 }
      );
    }

    // Prepare email data
    const emailData = {
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.client.name,
      clientEmail: invoice.client.email,
      companyName: "תכל'ס.dev",
      invoiceTotal: Number(invoice.total),
      currency: invoice.currency || "ILS",
      dueDate: invoice.dueDate,
      invoiceTitle: invoice.title,
      invoiceDescription: invoice.description || "",
    };

    // Send email
    console.log(`[EMAIL_API] Sending email to ${emailData.clientEmail}`);
    const emailResult = await sendInvoiceEmail(emailData, pdfBuffer, language);

    if (!emailResult.success) {
      console.error("[EMAIL_API] Email sending failed:", emailResult.error);
      return NextResponse.json(
        { error: `Failed to send email: ${emailResult.error}` },
        { status: 500 }
      );
    }

    console.log(
      `[EMAIL_API] Email sent successfully. Message ID: ${emailResult.messageId}`
    );

    return NextResponse.json({
      success: true,
      messageId: emailResult.messageId,
      clientEmail: emailData.clientEmail,
      invoiceNumber: invoice.invoiceNumber,
      language: language,
    });
  } catch (error) {
    console.error("[EMAIL_API] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
