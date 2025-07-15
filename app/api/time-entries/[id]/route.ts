"use server";
import { NextRequest, NextResponse } from 'next/server';
import { TimeEntryService } from '@/lib/services/time-service';
import { auth } from '@clerk/nextjs/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { 
      description, 
      duration, 
      startTime, 
      isBillable, 
      billableRate 
    } = await request.json();

    const timeEntry = await TimeEntryService.updateTimeEntry(id, {
      description,
      hours: duration / 60, // Convert minutes to hours
      date: startTime ? new Date(startTime) : undefined,
      billable: isBillable,
      rate: billableRate ? parseFloat(billableRate) : undefined,
    });

    return NextResponse.json(timeEntry);
  } catch (error) {
    console.error('Error updating time entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await TimeEntryService.deleteTimeEntry(id);

    return NextResponse.json({ message: 'Time entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting time entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
