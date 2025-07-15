"use server";
import { NextRequest, NextResponse } from "next/server";
import { getProductById, updateProduct, deleteProduct, updateProductWebhooks } from "@/lib/services/product-service";
import { auth } from "@clerk/nextjs/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
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
    const {
      name,
      description,
      domain,
      repository,
      category,
      features,
      pricing,
      apiBaseUrl,
      apiKey,
      dbConnectionString,
      dbType,
      ownerId,
      status,
      version,
    } = body;

    const product = await updateProduct(id, {
      name,
      description,
      domain,
      repository,
      category,
      features,
      pricing,
      apiBaseUrl,
      apiKey,
      dbConnectionString,
      dbType,
      ownerId,
      status,
      version,
    });

    // Update webhook status based on product status
    if (status) {
      const isActive = status === "LIVE" || status === "BETA";
      await updateProductWebhooks(id, isActive);
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update product",
      },
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

    await deleteProduct(id);

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete product",
      },
      { status: 500 }
    );
  }
}
