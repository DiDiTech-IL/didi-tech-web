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
    const { id } = await params;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, phone, company, address } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        company,
        address,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("Error updating client:", error);
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
    const { id } = await params;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if client has any products before deleting
    const productCount = await prisma.product.count({
      where: {
        subscriptions: {
          some: {
            clientId: id,
          },
        },
      },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete client with existing products" },
        { status: 400 }
      );
    }

    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
