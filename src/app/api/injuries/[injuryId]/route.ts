import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Injury from '@/models/Injury';
import Child from '@/models/Child';
import { verifyToken } from '@/lib/auth';

// Helper function to validate ObjectId
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ injuryId: string }> }
) {
  try {
    await dbConnect();

    // Verify authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { injuryId } = await params;

    // Handle the case where injuryId is "new"
    if (injuryId === 'new') {
      return NextResponse.json({ error: 'Use POST /api/injuries to create a new injury' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!isValidObjectId(injuryId)) {
      return NextResponse.json({ error: 'Invalid injury ID format' }, { status: 400 });
    }

    // Get injury and verify ownership
    const injury = await Injury.findById(injuryId)
      .populate('child', 'name age parent');

    if (!injury) {
      return NextResponse.json({ error: 'Injury not found' }, { status: 404 });
    }

    // Check if user owns this injury (through child) or is admin
    if (decoded.role !== 'admin' && injury.child?.parent?.toString() !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ injury });
  } catch (error) {
    console.error('Error fetching injury:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ injuryId: string }> }
) {
  try {
    await dbConnect();

    // Verify authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { injuryId } = await params;

    // Handle the case where injuryId is "new"
    if (injuryId === 'new') {
      return NextResponse.json({ error: 'Use POST /api/injuries to create a new injury' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!isValidObjectId(injuryId)) {
      return NextResponse.json({ error: 'Invalid injury ID format' }, { status: 400 });
    }

    const {
      type,
      description,
      date,
      location,
      severity,
      recoveryStatus,
      notes
    } = await request.json();

    // Validate input
    if (!type || !description || !location || !severity || !recoveryStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get injury and verify ownership
    const injury = await Injury.findById(injuryId)
      .populate('child', 'parent');

    if (!injury) {
      return NextResponse.json({ error: 'Injury not found' }, { status: 404 });
    }

    // Check if user owns this injury (through child) or is admin
    if (decoded.role !== 'admin' && injury.child?.parent?.toString() !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Admins can only view, not edit injuries
    if (decoded.role === 'admin') {
      return NextResponse.json({ error: 'Admins cannot edit injuries' }, { status: 403 });
    }

    // Update injury
    const updatedInjury = await Injury.findByIdAndUpdate(
      injuryId,
      {
        type,
        description,
        date,
        location,
        severity,
        recoveryStatus,
        notes
      },
      { new: true }
    ).populate('child', 'name age parent');

    return NextResponse.json({ injury: updatedInjury });
  } catch (error) {
    console.error('Error updating injury:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ injuryId: string }> }
) {
  try {
    await dbConnect();

    // Verify authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { injuryId } = await params;

    // Handle the case where injuryId is "new"
    if (injuryId === 'new') {
      return NextResponse.json({ error: 'Cannot delete a non-existent injury' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!isValidObjectId(injuryId)) {
      return NextResponse.json({ error: 'Invalid injury ID format' }, { status: 400 });
    }

    // Get injury and verify ownership
    const injury = await Injury.findById(injuryId)
      .populate('child', 'parent');

    if (!injury) {
      return NextResponse.json({ error: 'Injury not found' }, { status: 404 });
    }

    // Check if user owns this injury (through child) or is admin
    if (decoded.role !== 'admin' && injury.child?.parent?.toString() !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Admins can only view, not delete injuries
    if (decoded.role === 'admin') {
      return NextResponse.json({ error: 'Admins cannot delete injuries' }, { status: 403 });
    }

    // Delete injury
    await Injury.findByIdAndDelete(injuryId);

    return NextResponse.json({ message: 'Injury deleted successfully' });
  } catch (error) {
    console.error('Error deleting injury:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 