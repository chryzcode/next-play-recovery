import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Injury from '@/models/Injury';
import User from '@/models/User';
import Child from '@/models/Child';
import { sendInjuryReminderEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // This endpoint should be called by a cron job or scheduled task
    // For now, we'll check for injuries that need reminders

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Find injuries that:
    // 1. Are not in "Full Play" status
    // 2. Haven't been updated in the last 3 days
    // 3. Haven't had a reminder sent in the last 3 days
    const injuriesNeedingReminders = await Injury.find({
      recoveryStatus: { $ne: 'Full Play' },
      updatedAt: { $lt: threeDaysAgo },
      $or: [
        { lastReminderSent: { $exists: false } },
        { lastReminderSent: { $lt: threeDaysAgo } }
      ]
    }).populate({
      path: 'child',
      populate: {
        path: 'parent',
        select: 'name email'
      }
    });

    const sentReminders = [];

    for (const injury of injuriesNeedingReminders) {
      try {
        const user = injury.child?.parent;
        const child = injury.child;

        if (!user || !child) {
          console.error(`Missing user or child data for injury ${injury._id}`);
          continue;
        }

        // Send reminder email
        await sendInjuryReminderEmail(
          user.email,
          user.name,
          child.name,
          injury.type,
          injury._id.toString()
        );

        // Update last reminder sent
        injury.lastReminderSent = new Date();
        await injury.save();

        sentReminders.push({
          injuryId: injury._id,
          childName: child.name,
          injuryType: injury.type,
          userEmail: user.email
        });

        console.log(`Reminder sent for ${child.name}'s ${injury.type}`);
      } catch (error) {
        console.error(`Failed to send reminder for injury ${injury._id}:`, error);
      }
    }

    return NextResponse.json({
      message: `Sent ${sentReminders.length} reminders`,
      sentReminders
    });
  } catch (error) {
    console.error('Error sending reminders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 