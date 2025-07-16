import { NextRequest, NextResponse } from "next/server";

interface InvoiceParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: InvoiceParams) {
  const { id } = await params;
  try {
    console.log(`[EMAIL_API] Email service disabled for invoice ID: ${id}`);

    return NextResponse.json(
      { error: "Email service is not available. PDF generation is required for invoice emails." },
      { status: 503 }
    );
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
