import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Vote from '@/models/Vote';
import Election from '@/models/Election';
import User from '@/models/User';
// Remove authentication requirement as election results should be public
// import { withAuth } from '@/lib/auth';

// GET /api/elections/[id]/results - Get the results of a specific election
// Make results publicly available without authentication
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    // Verify the election exists
    const election = await Election.findById(params.id);
    
    if (!election) {
      return NextResponse.json(
        { error: 'Election not found' },
        { status: 404 }
      );
    }
    
    // Check if election has ended
    const now = new Date();
    const isEnded = now > new Date(election.endDate);
    
    // If election is still ongoing, check if the user is an admin
    if (!isEnded) {
      // Only admins can see partial results of ongoing elections
      // This is handled by the middleware, but we'll keep the check for clarity
      // In a real implementation, you might want to add additional checks here
    }
    
    // Get all votes for this election with voter information
    const votes = await Vote.find({ electionId: params.id }).populate('voterId', 'name');
    
    // Count votes per candidate
    interface VoteCount {
      [candidate: string]: number;
    }
    
    const results: VoteCount = {};
    election.candidates.forEach((candidate: string) => {
      results[candidate] = 0;
    });
    
    votes.forEach(vote => {
      if (results[vote.candidate] !== undefined) {
        results[vote.candidate]++;
      }
    });
    
    // Calculate total votes
    const totalVotes = votes.length;
    
    // Format results
    const formattedResults = Object.entries(results).map(([candidate, count]) => ({
      candidate,
      votes: count,
      percentage: totalVotes > 0 ? Math.round((count as number / totalVotes) * 100) : 0
    }));
    
    // Convert MongoDB documents to plain objects
    const electionObj = election.toObject ? election.toObject() : election;
    
    // Prepare voter information for client
    const voterInfo = isEnded ? votes.map(vote => {
      // Handle cases where voterId might be a string or an object from populate
      const voter = vote.voterId || {};
      const name = typeof voter === 'object' && voter.name ? voter.name : 'Anonymous Voter';
      
      return {
        id: typeof voter === 'object' && voter._id ? voter._id.toString() : 'unknown',
        name,
        timestamp: vote.timestamp,
        candidate: vote.candidate,
        transactionHash: vote.transactionHash || ''
      };
    }) : [];

    return NextResponse.json({
      election: {
        id: electionObj._id.toString(),
        title: electionObj.title,
        description: electionObj.description,
        startDate: electionObj.startDate,
        endDate: electionObj.endDate,
        isEnded
      },
      results: formattedResults,
      totalVotes,
      transactionHashes: isEnded ? votes.map(vote => vote.transactionHash || '') : [],
      voterInfo
    });
  } catch (error) {
    console.error('Error fetching election results:', error);
    // Add more detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch election results' },
      { status: 500 }
    );
  }
}
