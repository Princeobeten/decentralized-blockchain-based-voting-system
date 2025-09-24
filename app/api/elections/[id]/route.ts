import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Election from '@/models/Election';
import { withAuth, withRole } from '@/lib/auth';

// GET /api/elections/[id] - Get a specific election
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const election = await Election.findById(params.id)
      .populate('createdBy', 'name');
    
    if (!election) {
      return NextResponse.json(
        { error: 'Election not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(election);
  } catch (error) {
    console.error('Error fetching election:', error);
    return NextResponse.json(
      { error: 'Failed to fetch election' },
      { status: 500 }
    );
  }
}

// PUT /api/elections/[id] - Update an election (admin only)
export const PUT = withRole(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    await dbConnect();
    
    const data = await req.json();
    const { id } = params;
    
    // Find the election
    const election = await Election.findById(id);
    
    if (!election) {
      return NextResponse.json(
        { error: 'Election not found' },
        { status: 404 }
      );
    }
    
    // Check if election has already started
    if (new Date() > new Date(election.startDate)) {
      return NextResponse.json(
        { error: 'Cannot update an election that has already started' },
        { status: 400 }
      );
    }
    
    // Convert string dates to Date objects
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    
    // Validate date range if both dates are provided
    if (data.startDate && data.endDate && data.startDate >= data.endDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }
    
    // Update the election
    const updatedElection = await Election.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(updatedElection);
  } catch (error) {
    console.error('Error updating election:', error);
    return NextResponse.json(
      { error: 'Failed to update election' },
      { status: 500 }
    );
  }
}, 'admin'); // Require admin role

// DELETE /api/elections/[id] - Delete an election (admin only)
export const DELETE = withRole(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    await dbConnect();
    
    const { id } = params;
    
    // Find the election
    const election = await Election.findById(id);
    
    if (!election) {
      return NextResponse.json(
        { error: 'Election not found' },
        { status: 404 }
      );
    }
    
    // Check if election has already started
    if (new Date() > new Date(election.startDate)) {
      return NextResponse.json(
        { error: 'Cannot delete an election that has already started' },
        { status: 400 }
      );
    }
    
    // Delete the election
    await Election.findByIdAndDelete(id);
    
    return NextResponse.json(
      { message: 'Election deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting election:', error);
    return NextResponse.json(
      { error: 'Failed to delete election' },
      { status: 500 }
    );
  }
}, 'admin'); // Require admin role
