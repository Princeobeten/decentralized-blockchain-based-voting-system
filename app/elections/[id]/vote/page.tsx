'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import VoteForm from '@/components/VoteForm';
import Link from 'next/link';

interface Election {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  candidates: string[];
  createdBy: {
    name: string;
  };
}

export default function VotePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [election, setElection] = useState<Election | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Handle the case where params could be null
  const electionId = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : '';
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    
    const fetchData = async () => {
      if (status === 'authenticated') {
        setLoading(true);

        if (!electionId) {
          setError('Invalid election ID');
          setLoading(false);
          return;
        }
        
        try {
          // Fetch election details
          const electionRes = await fetch(`/api/elections/${electionId}`);
          
          if (!electionRes.ok) {
            throw new Error('Failed to fetch election details');
          }
          
          const electionData = await electionRes.json();
          setElection(electionData);
          
          // Check if user has already voted
          const userVotesRes = await fetch('/api/user/votes');
          
          if (userVotesRes.ok) {
            const userVotes = await userVotesRes.json();
            const voted = userVotes.some((vote: { election: { id: string } }) => vote.election.id === electionId);
            setHasVoted(voted);
            
            if (voted) {
              // If user has already voted, redirect to results
              setTimeout(() => {
                router.push(`/elections/${electionId}/results`);
              }, 2000);
            }
          }
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };
    
    if (status !== 'loading') {
      fetchData();
    }
  }, [electionId, router, status]);
  
  // Format dates for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Check if election is active
  const isActive = () => {
    if (!election) return false;
    
    const now = new Date();
    const start = new Date(election.startDate);
    const end = new Date(election.endDate);
    
    return now >= start && now <= end;
  };
  
  const handleVoteSuccess = () => {
    setHasVoted(true);
  };
  
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/elections" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Elections
          </Link>
        </div>
        
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-300">
            <p>Error: {error}</p>
          </div>
        ) : !election ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md text-yellow-700 dark:text-yellow-300">
            <p>Election not found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Suspense fallback={
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            }>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{election.title}</h1>
                
                <div className="mb-6">
                  <p className="text-gray-600 dark:text-gray-300">{election.description}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Start:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-200">{formatDate(election.startDate)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">End:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-200">{formatDate(election.endDate)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Created by:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-200">{election.createdBy?.name || 'Admin'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Status:</span>
                    <span className={`ml-2 font-medium ${isActive() ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {isActive() ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                {hasVoted && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mb-6">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p className="text-blue-700 dark:text-blue-300">
                        You've already voted in this election. Redirecting to results...
                      </p>
                    </div>
                  </div>
                )}
                
                {!isActive() && !hasVoted && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p className="text-yellow-700 dark:text-yellow-300">
                        This election is {new Date() < new Date(election.startDate) ? 'not yet active' : 'already closed'}. Voting is not available.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Suspense>
            
            <Suspense fallback={
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            }>
              <div>
                {!hasVoted && isActive() && (
                  <VoteForm 
                    electionId={electionId} 
                    candidates={election.candidates}
                    onVoteSuccess={handleVoteSuccess}
                  />
                )}
                
                {(hasVoted || !isActive()) && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                    <Link 
                      href={`/elections/${electionId}/results`}
                      className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      View Election Results
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
