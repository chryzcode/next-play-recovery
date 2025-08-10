import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Injury from '@/models/Injury';
import Child from '@/models/Child';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';

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

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Read role from DB to avoid stale token role
    const currentUser = await User.findById(decoded.userId).select('role');
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { injuryId } = await params;

    if (injuryId === 'new') {
      return NextResponse.json({ error: 'Use POST /api/injuries to create a new injury' }, { status: 400 });
    }

    if (!isValidObjectId(injuryId)) {
      return NextResponse.json({ error: 'Invalid injury ID format' }, { status: 400 });
    }

    const injury = await Injury.findById(injuryId)
      .populate({
        path: 'child',
        select: 'name age parent',
        populate: { path: 'parent', select: 'name email _id' }
      });

    if (!injury) {
      return NextResponse.json({ error: 'Injury not found' }, { status: 404 });
    }

    const childParentId = injury.child?.parent?._id || injury.child?.parent;
    const childParentIdString = typeof childParentId === 'object' ? childParentId.toString() : childParentId;

    if (currentUser.role !== 'admin' && childParentIdString !== decoded.userId) {
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

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Read role from DB to avoid stale token role
    const currentUser = await User.findById(decoded.userId).select('role');
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { injuryId } = await params;

    if (injuryId === 'new') {
      return NextResponse.json({ error: 'Use POST /api/injuries to create a new injury' }, { status: 400 });
    }

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

    if (!type || !description || !location || !severity || !recoveryStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const injury = await Injury.findById(injuryId)
      .populate({
        path: 'child',
        select: 'parent',
        populate: { path: 'parent', select: 'name email _id' }
      });

    if (!injury) {
      return NextResponse.json({ error: 'Injury not found' }, { status: 404 });
    }

    const childParentId = injury.child?.parent?._id || injury.child?.parent;
    const childParentIdString = typeof childParentId === 'object' ? childParentId.toString() : childParentId;

    if (currentUser.role !== 'admin' && childParentIdString !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (currentUser.role === 'admin') {
      return NextResponse.json({ error: 'Admins cannot edit injuries' }, { status: 403 });
    }

    const updatedInjury = await Injury.findByIdAndUpdate(
      injuryId,
      { type, description, date, location, severity, recoveryStatus, notes },
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

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Read role from DB to avoid stale token role
    const currentUser = await User.findById(decoded.userId).select('role');
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { injuryId } = await params;

    if (injuryId === 'new') {
      return NextResponse.json({ error: 'Cannot delete a non-existent injury' }, { status: 400 });
    }

    if (!isValidObjectId(injuryId)) {
      return NextResponse.json({ error: 'Invalid injury ID format' }, { status: 400 });
    }

    const injury = await Injury.findById(injuryId)
      .populate({
        path: 'child',
        select: 'parent',
        populate: { path: 'parent', select: 'name email _id' }
      });

    if (!injury) {
      return NextResponse.json({ error: 'Injury not found' }, { status: 404 });
    }

    const childParentId = injury.child?.parent?._id || injury.child?.parent;
    const childParentIdString = typeof childParentId === 'object' ? childParentId.toString() : childParentId;

    if (currentUser.role !== 'admin' && childParentIdString !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (currentUser.role === 'admin') {
      return NextResponse.json({ error: 'Admins cannot delete injuries' }, { status: 403 });
    }

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