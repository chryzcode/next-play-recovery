import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Child from '@/models/Child';
import Injury from '@/models/Injury';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
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

    const { childId } = await params;

    // Check if user is admin or owns the child
    let child;
    if (decoded.role === 'admin') {
      child = await Child.findById(childId)
        .populate('injuries')
        .populate('parent', 'name email _id');
    } else {
      child = await Child.findOne({ _id: childId, parent: decoded.userId })
        .populate('injuries')
        .populate('parent', 'name email _id');
    }

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    return NextResponse.json(child);
  } catch (error) {
    console.error('Error fetching child:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
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

    const { childId } = await params;

    // Get child and check permissions
    let child;
    if (decoded.role === 'admin') {
      // Admin can view any child but not edit
      child = await Child.findById(childId).populate('injuries');
      if (!child) {
        return NextResponse.json({ error: 'Child not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Admins cannot edit children' }, { status: 403 });
    } else {
      // Parent can only edit their own children
      child = await Child.findOne({ _id: childId, parent: decoded.userId }).populate('injuries');
      if (!child) {
        return NextResponse.json({ error: 'Child not found' }, { status: 404 });
      }
    }

    const { name, age, gender, sport, notes } = await request.json();

    // Validate input
    if (!name || !age) {
      return NextResponse.json(
        { error: 'Name and age are required' },
        { status: 400 }
      );
    }

    if (age < 0 || age > 18) {
      return NextResponse.json(
        { error: 'Age must be between 0 and 18' },
        { status: 400 }
      );
    }

    // Update child
    const updatedChild = await Child.findByIdAndUpdate(
      childId,
      {
        name,
        age,
        gender: gender || child.gender,
        sport: sport || child.sport,
        notes: notes || child.notes,
      },
      { new: true }
    ).populate('injuries');

    return NextResponse.json(updatedChild);
  } catch (error) {
    console.error('Error updating child:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
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

    const { childId } = await params;

    // Get child and check permissions
    let child;
    if (decoded.role === 'admin') {
      // Admin can view any child but not delete
      child = await Child.findById(childId);
      if (!child) {
        return NextResponse.json({ error: 'Child not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Admins cannot delete children' }, { status: 403 });
    } else {
      // Parent can only delete their own children
      child = await Child.findOne({ _id: childId, parent: decoded.userId });
      if (!child) {
        return NextResponse.json({ error: 'Child not found' }, { status: 404 });
      }
    }

    // Admins can only view, not delete children
    if (decoded.role === 'admin') {
      return NextResponse.json({ error: 'Admins cannot delete children' }, { status: 403 });
    }

    // Delete all injuries associated with this child
    await Injury.deleteMany({ child: childId });

    // Delete the child
    await Child.findByIdAndDelete(childId);

    // Remove child from parent's children array
    await User.findByIdAndUpdate(decoded.userId, {
      $pull: { children: childId }
    });

    return NextResponse.json({ message: 'Child deleted successfully' });
  } catch (error) {
    console.error('Error deleting child:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 