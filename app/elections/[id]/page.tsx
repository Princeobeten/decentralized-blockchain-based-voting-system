'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { Election, Vote, getElectionStatus } from '@/types/models';
import { getElectionById, getVotesByElection, hasUserVoted } from '@/lib/localStorage';

export default function ElectionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [election, setElection] = useState<Election | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadElectionData();
    }
  }, [params.id, user]);

  const loadElectionData = () => {
    setIsLoading(true);
    try {
      const electionData = getElectionById(params.id as string);
      if (!electionData) {
        router.push('/elections');
        return;
      }

      setElection(electionData);
      
      const electionVotes = getVotesByElection(electionData.id);
      setVotes(electionVotes);
      
      if (user) {
        const userHasVoted = hasUserVoted(user.id, electionData.id);
        setHasVoted(userHasVoted);
      }
    } catch (error) {
      console.error('Error loading election data:', error);
      router.push('/elections');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading election details...</p>
        </div>
      </div>
    );
  }

  if (!election) {
    return null;
  }

  const status = getElectionStatus(election);
  const totalVotes = votes.length;
  
  // Calculate results
  const results = election.candidates.map(candidate => {
    const candidateVotes = votes.filter(vote => vote.candidate === candidate).length;
    return {
      candidate,
      votes: candidateVotes,
      percentage: totalVotes > 0 ? (candidateVotes / totalVotes) * 100 : 0,
    };
  }).sort((a, b) => b.votes - a.votes);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = () => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
    
    switch (status) {
      case 'upcoming':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400`;
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400`;
      case 'completed':
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {election.title}
                </h1>
                <span className={getStatusBadge()}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                {status === 'active' && (
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-sm font-medium">Live</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {election.description}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Election Info */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Election Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatDate(election.startDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">End Date</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatDate(election.endDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Candidates</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {election.candidates.length}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Votes</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {totalVotes}
                    </dd>
                  </div>
                </div>
              </div>

              {/* Candidates */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Candidates
                </h2>
                <div className="space-y-3">
                  {election.candidates.map((candidate, index) => {
                    const candidateResult = results.find(r => r.candidate === candidate);
                    const candidateVotes = candidateResult?.votes || 0;
                    const percentage = candidateResult?.percentage || 0;
                    
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                {candidate.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                              {candidate}
                            </h3>
                            {status === 'completed' && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {candidateVotes} votes ({percentage.toFixed(1)}%)
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {status === 'completed' && (
                          <div className="flex-1 ml-4">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        {index === 0 && status === 'completed' && candidateVotes > 0 && (
                          <div className="ml-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                              Winner
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Voting Action */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Voting Status
                </h3>
                
                {!isAuthenticated ? (
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Sign in to participate in this election
                    </p>
                    <div className="space-y-2">
                      <Link
                        href="/login"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors block text-center"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors block text-center"
                      >
                        Create Account
                      </Link>
                    </div>
                  </div>
                ) : status === 'upcoming' ? (
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-yellow-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Voting has not started yet
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Starts {formatDate(election.startDate)}
                    </p>
                  </div>
                ) : status === 'active' ? (
                  hasVoted ? (
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-green-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">
                        You have already voted
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Thank you for participating!
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-blue-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-gray-900 dark:text-white font-medium mb-4">
                        Ready to vote!
                      </p>
                      <Link
                        href={`/elections/${election.id}/vote`}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md text-sm font-medium transition-colors block text-center"
                      >
                        Cast Your Vote
                      </Link>
                    </div>
                  )
                ) : (
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Voting has ended
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Ended {formatDate(election.endDate)}
                    </p>
                  </div>
                )}
              </div>

              {/* Election Stats */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Votes</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{totalVotes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Candidates</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{election.candidates.length}</span>
                  </div>
                  {status === 'completed' && totalVotes > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Leading Candidate</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{results[0].candidate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Blockchain Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Blockchain Security
                    </h3>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                      <p>
                        This election uses blockchain principles to ensure vote integrity and transparency.
                        All votes are immutably recorded with cryptographic hashing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
