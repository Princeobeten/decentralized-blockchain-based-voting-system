import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Vote from '@/models/Vote';
import Election from '@/models/Election';
import { withAuth, getCurrentUser } from '@/lib/auth';

// GET /api/user/votes - Get the current user's voting history
export const GET = withAuth(async (req: NextRequest) => {
  try {
    await dbConnect();
    
    const user = await getCurrentUser();
    
    // Ensure user exists before accessing id
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'User not authenticated or ID missing' },
        { status: 401 }
      );
    }
    
    // Get all votes by the current user
    const votes = await Vote.find({ voterId: user.id })
      .sort({ timestamp: -1 });
    
    // Get the election details for each vote
    const voteHistory = await Promise.all(
      votes.map(async (vote) => {
        const election = await Election.findById(vote.electionId);
        return {
          id: vote._id,
          election: election ? {
            id: election._id,
            title: election.title,
          } : { title: 'Election not found' },
          candidate: vote.candidate,
          timestamp: vote.timestamp,
          transactionHash: vote.transactionHash
        };
      })
    );
    
    return NextResponse.json(voteHistory);
  } catch (error) {
    console.error('Error fetching voting history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voting history' },
      { status: 500 }
    );
  }
});
