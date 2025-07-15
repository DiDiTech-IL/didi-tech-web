"use server";
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; planId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: productId, planId } = await params;
    const body = await request.json();

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if payment plan exists
    const existingPlan = await prisma.paymentPlan.findFirst({
      where: { 
        id: planId,
        productId: productId 
      }
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Payment plan not found' },
        { status: 404 }
      );
    }

    // Update the payment plan
    const updatedPlan = await prisma.paymentPlan.update({
      where: { id: planId },
      data: {
        name: body.name || existingPlan.name,
        description: body.description !== undefined ? body.description : existingPlan.description,
        planType: body.planType || existingPlan.planType,
        price: body.price !== undefined ? parseFloat(body.price) : existingPlan.price,
        currency: body.currency || existingPlan.currency,
        billingInterval: body.billingInterval || existingPlan.billingInterval,
        trialDays: body.trialDays !== undefined ? (body.trialDays ? parseInt(body.trialDays) : null) : existingPlan.trialDays,
        features: body.features !== undefined ? (Array.isArray(body.features) ? body.features : []) : existingPlan.features,
        userLimit: body.userLimit !== undefined ? (body.userLimit ? parseInt(body.userLimit) : null) : existingPlan.userLimit,
        storageLimit: body.storageLimit !== undefined ? (body.storageLimit ? parseInt(body.storageLimit) : null) : existingPlan.storageLimit,
        apiCallsLimit: body.apiCallsLimit !== undefined ? (body.apiCallsLimit ? parseInt(body.apiCallsLimit) : null) : existingPlan.apiCallsLimit,
        discountPercentage: body.discountPercentage !== undefined ? (body.discountPercentage ? parseFloat(body.discountPercentage) : null) : existingPlan.discountPercentage,
        discountValidUntil: body.discountValidUntil !== undefined ? (body.discountValidUntil ? new Date(body.discountValidUntil) : null) : existingPlan.discountValidUntil,
        isPopular: body.isPopular !== undefined ? body.isPopular : existingPlan.isPopular,
        isActive: body.isActive !== undefined ? body.isActive : existingPlan.isActive,
        displayOrder: body.displayOrder !== undefined ? parseInt(body.displayOrder) : existingPlan.displayOrder,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      plan: updatedPlan,
      product: {
        id: product.id,
        name: product.name,
      },
    });

  } catch (error) {
    console.error('Error updating payment plan:', error);
    return NextResponse.json(
      { error: 'Failed to update payment plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; planId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: productId, planId } = await params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if payment plan exists
    const existingPlan = await prisma.paymentPlan.findFirst({
      where: { 
        id: planId,
        productId: productId 
      }
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Payment plan not found' },
        { status: 404 }
      );
    }

    // Check if plan has active subscriptions
    const activeSubscriptions = await prisma.productSubscription.count({
      where: {
        productId: productId,
        status: 'ACTIVE'
      }
    });

    if (activeSubscriptions > 0) {
      // Instead of deleting, mark as inactive
      await prisma.paymentPlan.update({
        where: { id: planId },
        data: { 
          isActive: false,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: 'Payment plan deactivated (has active subscriptions)',
        product: {
          id: product.id,
          name: product.name,
        },
      });
    } else {
      // Safe to delete
      await prisma.paymentPlan.delete({
        where: { id: planId },
      });

      return NextResponse.json({
        message: 'Payment plan deleted successfully',
        product: {
          id: product.id,
          name: product.name,
        },
      });
    }

  } catch (error) {
    console.error('Error deleting payment plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment plan' },
      { status: 500 }
    );
  }
}
