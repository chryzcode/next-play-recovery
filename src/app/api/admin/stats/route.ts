import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Child from '@/models/Child';
import Injury from '@/models/Injury';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Verify authentication and admin role
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get statistics
    const [
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      totalChildren,
      totalInjuries,
      activeInjuries
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isEmailVerified: true }),
      User.countDocuments({ isEmailVerified: false }),
      Child.countDocuments(),
      Injury.countDocuments(),
      Injury.countDocuments({ recoveryStatus: { $ne: 'Full Play' } })
    ]);

    return NextResponse.json({
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      totalChildren,
      totalInjuries,
      activeInjuries
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 