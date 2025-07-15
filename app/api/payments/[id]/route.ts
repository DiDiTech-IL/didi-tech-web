"use server";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const {
      amount,
      currency,
      paymentMethod,
      clientId,
      productId,
      description,
    } = await request.json();

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        amount,
        currency,
        paymentMethod,
        clientId,
        productId: productId,
        description,
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.payment.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
