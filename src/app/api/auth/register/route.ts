import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { sendVerificationEmail, sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { name, email, password, consentAgreed, isThirteenOrOlder } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Validate consent and age requirements
    if (!consentAgreed) {
      return NextResponse.json(
        { error: 'Consent agreement is required' },
        { status: 400 }
      );
    }

    if (!isThirteenOrOlder) {
      return NextResponse.json(
        { error: 'Users must be 13 or older to create an account' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user with consent tracking
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'parent',
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      consent_text: 'I understand that Next Play Recovery (including the Resource Center) is for informational use only and not medical advice. I agree to the Terms of Use, Privacy Policy, and Disclaimer, consent to the storage of my data (including optional photos), and confirm I am 13 or older (with parent/guardian consent if under 18).',
      consent_version: 'v1.0',
      consent_timestamp: new Date(),
      consent_accepted: consentAgreed,
      isThirteenOrOlder: isThirteenOrOlder,
    });

    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Continue with user creation even if email fails
    }

    // Remove sensitive data from response
    const { password: _, emailVerificationToken: __, ...userWithoutSensitiveData } = user.toObject();

    return NextResponse.json(
      { 
        message: 'User created successfully. Please check your email to verify your account.',
        user: userWithoutSensitiveData
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 