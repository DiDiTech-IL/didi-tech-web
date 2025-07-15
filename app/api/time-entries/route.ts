"use server";
import { NextRequest, NextResponse } from 'next/server';
import { TimeEntryService } from '@/lib/services/time-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');

    let timeEntries;
    if (productId) {
      timeEntries = await TimeEntryService.getTimeEntriesByProduct(productId);
    } else if (userId) {
      timeEntries = await TimeEntryService.getTimeEntriesByUser(userId);
    } else {
      timeEntries = await TimeEntryService.getAllTimeEntries();
    }

    return NextResponse.json(timeEntries);
  } catch (error) {
    console.error('Failed to fetch time entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const timeEntry = await TimeEntryService.createTimeEntry(data);
    return NextResponse.json(timeEntry);
  } catch (error) {
    console.error('Failed to create time entry:', error);
    return NextResponse.json(
      { error: 'Failed to create time entry' },
      { status: 500 }
    );
  }
}
