import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Injury from '@/models/Injury';
import Child from '@/models/Child';
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

    let injuries;
    
    // Check if user is admin
    if (decoded.role === 'admin') {
      // Admin can see all injuries
      injuries = await Injury.find()
        .populate({
          path: 'child',
          select: 'name age parent',
          populate: {
            path: 'parent',
            select: 'name email'
          }
        })
        .sort({ date: -1 });
    } else {
      // Parents can only see injuries for their own children
      const children = await Child.find({ parent: decoded.userId });
      const childIds = children.map(child => child._id);

      injuries = await Injury.find({ child: { $in: childIds } })
        .populate({
          path: 'child',
          select: 'name age parent',
          populate: {
            path: 'parent',
            select: 'name email _id'
          }
        })
        .sort({ date: -1 });
    }

    return NextResponse.json(injuries);
  } catch (error) {
    console.error('Error fetching injuries:', error);
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

    // Only parents can create injuries (admins cannot create injuries for other users)
    if (decoded.role !== 'parent') {
      return NextResponse.json({ error: 'Only parents can create injuries' }, { status: 403 });
    }

    const {
      childId,
      type,
      description,
      date,
      location,
      severity,
      photos = [],
      notes = '',
      suggestedTimeline = 7
    } = await request.json();

    // Validate input
    if (!childId || !type || !description || !location || !severity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify child belongs to user
    const child = await Child.findOne({ _id: childId, parent: decoded.userId });
    if (!child) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      );
    }

    // Create injury
    const injury = new Injury({
      child: childId,
      type,
      description,
      date: date || new Date(),
      location,
      severity,
      photos,
      notes,
      suggestedTimeline,
      recoveryStatus: 'Resting',
    });

    await injury.save();

    // Update child's injuries array
    await Child.findByIdAndUpdate(childId, {
      $push: { injuries: injury._id }
    });

    return NextResponse.json(injury, { status: 201 });
  } catch (error) {
    console.error('Error creating injury:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 