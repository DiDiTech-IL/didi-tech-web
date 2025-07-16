import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; webhookId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: productId, webhookId } = await params;
    const body = await request.json();
    const { url, events, isActive } = body;

    const webhook = await prisma.webhookEndpoint.update({
      where: {
        id: webhookId,
        productId, // Ensure the webhook belongs to this product
      },
      data: {
        ...(url && { url }),
        ...(events && { events }),
        ...(typeof isActive === "boolean" && { isActive }),
      },
    });

    return NextResponse.json(webhook);
  } catch (error) {
    console.error("Error updating webhook:", error);
    return NextResponse.json(
      { error: "Failed to update webhook" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; webhookId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: productId, webhookId } = await params;

    await prisma.webhookEndpoint.delete({
      where: {
        id: webhookId,
        productId, // Ensure the webhook belongs to this product
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting webhook:", error);
    return NextResponse.json(
      { error: "Failed to delete webhook" },
      { status: 500 }
    );
  }
}
