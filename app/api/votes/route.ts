import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Vote from '@/models/Vote';
import Election from '@/models/Election';
import { withAuth, getCurrentUser } from '@/lib/auth';

// POST /api/votes - Cast a vote
export const POST = withAuth(async (req: NextRequest) => {
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
    
    // Check required fields
    if (!data.electionId || !data.candidate) {
      return NextResponse.json(
        { error: 'Election ID and candidate are required' },
        { status: 400 }
      );
    }
    
    // Verify the election exists and is active
    const election = await Election.findById(data.electionId);
    
    if (!election) {
      return NextResponse.json(
        { error: 'Election not found' },
        { status: 404 }
      );
    }
    
    const now = new Date();
    if (now < new Date(election.startDate) || now > new Date(election.endDate)) {
      return NextResponse.json(
        { error: 'Election is not currently active' },
        { status: 400 }
      );
    }
    
    // Check if the candidate is valid
    if (!election.candidates.includes(data.candidate)) {
      return NextResponse.json(
        { error: 'Invalid candidate' },
        { status: 400 }
      );
    }
    
    // Check if the user has already voted in this election
    const existingVote = await Vote.findOne({
      electionId: data.electionId,
      voterId: user.id
    });
    
    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted in this election' },
        { status: 400 }
      );
    }
    
    // Create the vote
    const vote = await Vote.create({
      electionId: data.electionId,
      voterId: user.id,
      candidate: data.candidate
    });
    
    return NextResponse.json(vote, { status: 201 });
  } catch (error) {
    console.error('Error casting vote:', error);
    return NextResponse.json(
      { error: 'Failed to cast vote' },
      { status: 500 }
    );
  }
});
