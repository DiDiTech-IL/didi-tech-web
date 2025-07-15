"use server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ webhookToken: string }> }
) {
  try {
    const { webhookToken } = await params;

    // Find product by webhook key (using webhookKey instead of webhookToken for now)
    const product = await prisma.product.findFirst({
      where: {
        // For now, we'll search by ID or name since webhookKey might not exist yet
        OR: [
          { id: webhookToken },
          { name: { contains: webhookToken, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        pricing: true,
        status: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product by webhook token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
