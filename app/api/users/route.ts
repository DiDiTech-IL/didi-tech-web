"use server";
import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure current user exists in database
    await ensureUserExists();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const user = await prisma.user.create({
      data: {
        clerkId: body.clerkId,
        email: body.email,
        firstName: body.firstName || null,
        lastName: body.lastName || null,
        role: body.role || 'EMPLOYEE',
        hourlyRate: body.hourlyRate ? parseFloat(body.hourlyRate) : null,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

// Helper function to ensure current user exists in database
async function ensureUserExists() {
  try {
    const user = await currentUser();
    if (!user) return;

    const existingUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          role: 'EMPLOYEE', // Default role
        },
      });
    }
  } catch (error) {
    console.error('Error ensuring user exists:', error);
  }
}
