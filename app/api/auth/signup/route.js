/**
 * POST /api/auth/signup
 * Register a new user with email and password.
 */
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/server/lib/mongodb';
import User from '@/server/models/User';

export async function POST(req) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      email: email.toLowerCase(),
      name: name || '',
      passwordHash,
      provider: 'credentials',
      tier: 'free',
      credits: 1,
    });

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: { id: user._id, email: user.email, name: user.name },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[Signup] Error:', err.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
