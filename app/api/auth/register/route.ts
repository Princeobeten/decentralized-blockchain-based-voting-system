import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const data = await req.json();
    const { name, email, password } = data;
    
    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }
    
    // In a real app, you'd want to hash the password using bcrypt
    // For simplicity in this prototype, we're using a basic hash
    const passwordHash = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
    
    // Create new user
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'voter', // Default role is voter
    });
    
    // Remove sensitive data before returning
    const userWithoutPassword = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
