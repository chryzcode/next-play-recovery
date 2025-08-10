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

    // Read role from DB to avoid stale token role
    const currentUser = await User.findById(decoded.userId).select('role');
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is admin or owns the child
    let child;
    if (currentUser.role === 'admin') {
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

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { childId } = await params;

    // Read role from DB to avoid stale token role
    const currentUser = await User.findById(decoded.userId).select('role');
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get child and check permissions
    let child;
    if (currentUser.role === 'admin') {
      child = await Child.findById(childId).populate('injuries');
      if (!child) {
        return NextResponse.json({ error: 'Child not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Admins cannot edit children' }, { status: 403 });
    } else {
      child = await Child.findOne({ _id: childId, parent: decoded.userId }).populate('injuries');
      if (!child) {
        return NextResponse.json({ error: 'Child not found' }, { status: 404 });
      }
    }

    const { name, age, gender, sport, notes } = await request.json();

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

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { childId } = await params;

    // Read role from DB to avoid stale token role
    const currentUser = await User.findById(decoded.userId).select('role');
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get child and check permissions
    let child;
    if (currentUser.role === 'admin') {
      child = await Child.findById(childId);
      if (!child) {
        return NextResponse.json({ error: 'Child not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Admins cannot delete children' }, { status: 403 });
    } else {
      child = await Child.findOne({ _id: childId, parent: decoded.userId });
      if (!child) {
        return NextResponse.json({ error: 'Child not found' }, { status: 404 });
      }
    }

    if (currentUser.role === 'admin') {
      return NextResponse.json({ error: 'Admins cannot delete children' }, { status: 403 });
    }

    await Injury.deleteMany({ child: childId });
    await Child.findByIdAndDelete(childId);
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