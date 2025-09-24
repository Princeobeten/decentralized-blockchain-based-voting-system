import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Election from '@/models/Election';
import { withAuth, withRole, getCurrentUser } from '@/lib/auth';

// GET /api/elections - List all elections
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get query parameters
    const url = new URL(req.url);
    const active = url.searchParams.get('active');
    
    let query = {};
    
    // Filter for active elections
    if (active === 'true') {
      const now = new Date();
      query = {
        startDate: { $lte: now },
        endDate: { $gte: now }
      };
    }
    
    const elections = await Election.find(query)
      .sort({ startDate: -1 })
      .populate('createdBy', 'name');
    
    return NextResponse.json(elections);
  } catch (error) {
    console.error('Error fetching elections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch elections' },
      { status: 500 }
    );
  }
}

// POST /api/elections - Create a new election (admin only)
export const POST = withRole(async (req: NextRequest) => {
  try {
    await dbConnect();
    
    const user = await getCurrentUser();
    const data = await req.json();
    
    // Ensure user exists before accessing id
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'User not authenticated or ID missing' },
        { status: 401 }
      );
    }
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'candidates', 'startDate', 'endDate'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Convert string dates to Date objects
    data.startDate = new Date(data.startDate);
    data.endDate = new Date(data.endDate);
    
    // Validate date range
    if (data.startDate >= data.endDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }
    
    // Create the election
    const election = await Election.create({
      ...data,
      createdBy: user.id // Safe to use now after null check
    });
    
    return NextResponse.json(election, { status: 201 });
  } catch (error) {
    console.error('Error creating election:', error);
    return NextResponse.json(
      { error: 'Failed to create election' },
      { status: 500 }
    );
  }
}, 'admin'); // Require admin role
