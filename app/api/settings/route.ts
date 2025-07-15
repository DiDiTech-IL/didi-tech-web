"use server";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const settingsSchema = z.object({
  maintenance: z.object({
    enabled: z.boolean(),
    message: z.string(),
    scheduledStart: z.string().optional(),
    scheduledEnd: z.string().optional(),
  }),
  payments: z.object({
    provider: z.enum(["payplus", "stripe", "paypal", "none"]),
    testMode: z.boolean(),
    currency: z.string(),
    taxRate: z.number().min(0).max(100),
  }),
  email: z.object({
    provider: z.enum(["sendgrid", "smtp", "none"]),
    fromName: z.string(),
    fromEmail: z.string().email(),
  }),
  security: z.object({
    sessionTimeout: z.number().min(5).max(1440),
    maxLoginAttempts: z.number().min(1).max(10),
    requireTwoFactor: z.boolean(),
  }),
});

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fallback to default settings for now since Settings model needs migration
    const defaultSettings = {
      maintenance: {
        enabled: false,
        message: "System is under maintenance. Please check back later.",
        scheduledStart: "",
        scheduledEnd: "",
      },
      payments: {
        provider: "payplus",
        testMode: true,
        currency: "ILS",
        taxRate: 17,
      },
      email: {
        provider: "none",
        fromName: "DiDi Tech",
        fromEmail: "noreply@diditech.co.il",
      },
      security: {
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        requireTwoFactor: false,
      },
    };

    return NextResponse.json(defaultSettings);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch settings:", details: error },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate the settings
    const validatedSettings = settingsSchema.parse(body);

    // For now, just return success - implement database storage after migration
    return NextResponse.json({
      message: "Settings updated successfully",
      settings: validatedSettings,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid settings data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
