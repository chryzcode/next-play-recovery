import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Child from '@/models/Child';
import User from '@/models/User';
import Injury from '@/models/Injury';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    // Always read role from DB to avoid stale token role
    const currentUser = await User.findById(decoded.userId).select('role');
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let children;

    if (currentUser.role === 'admin') {
      // Admin can see all children
      children = await Child.find()
        .populate('injuries')
        .populate('parent', 'name email _id')
        .sort({ createdAt: -1 });
    } else {
      // Parents can only see their own children
      children = await Child.find({ parent: decoded.userId })
        .populate('injuries')
        .sort({ createdAt: -1 });
    }

    return NextResponse.json(children);
  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Only parents (from DB) can create children
    const currentUser = await User.findById(decoded.userId).select('role');
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (currentUser.role !== 'parent') {
      return NextResponse.json({ error: 'Only parents can create children' }, { status: 403 });
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

    // Create child
    const child = new Child({
      name,
      age,
      gender: gender || 'male',
      sport: sport || '',
      notes: notes || '',
      parent: decoded.userId,
    });

    await child.save();

    // Update parent's children array
    await User.findByIdAndUpdate(decoded.userId, {
      $push: { children: child._id }
    });

    return NextResponse.json(child, { status: 201 });
  } catch (error) {
    console.error('Error creating child:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 