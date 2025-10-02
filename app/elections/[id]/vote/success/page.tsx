'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { Election, Vote } from '@/types/models';
import { getElectionById, getVotesByUser } from '@/lib/localStorage';

export default function VoteSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  
  const [election, setElection] = useState<Election | null>(null);
  const [vote, setVote] = useState<Vote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const transactionHash = searchParams.get('tx');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (params.id && user) {
      loadVoteData();
    }
  }, [params.id, isAuthenticated, user, transactionHash]);

  const loadVoteData = () => {
    setIsLoading(true);
    try {
      const electionData = getElectionById(params.id as string);
      if (!electionData) {
        router.push('/elections');
        return;
      }

      setElection(electionData);

      // Find the user's vote for this election
      const userVotes = getVotesByUser(user!.id);
      const electionVote = userVotes.find(v => 
        v.electionId === electionData.id && 
        (!transactionHash || v.transactionHash === transactionHash)
      );

      if (!electionVote) {
        router.push(`/elections/${electionData.id}`);
        return;
      }

      setVote(electionVote);
    } catch (error) {
      console.error('Error loading vote data:', error);
      router.push('/elections');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Verifying your vote...</p>
        </div>
      </div>
    );
  }

  if (!election || !vote) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('Copied to clipboard');
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
              <svg className="h-8 w-8 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Vote Successfully Cast!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Your vote has been securely recorded on the blockchain
            </p>
          </div>

          {/* Vote Details */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Vote Details
              </h2>
            </div>
            <div className="px-6 py-4">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Election</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                    {election.title}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Your Vote</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                    {vote.candidate}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Timestamp</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formatDate(vote.timestamp)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Voter ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
                    {vote.voterId}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Transaction Hash */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Blockchain Transaction
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Your vote has been recorded with the following transaction hash
              </p>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex-1 min-w-0">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Transaction Hash
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white font-mono break-all">
                    {vote.transactionHash}
                  </dd>
                </div>
                <button
                  onClick={() => copyToClipboard(vote.transactionHash)}
                  className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Copy to clipboard"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300">
                  Your Vote is Secure
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Your vote has been cryptographically secured and cannot be altered</li>
                    <li>The transaction hash serves as proof of your participation</li>
                    <li>Your vote is anonymous but verifiable through the blockchain record</li>
                    <li>You can use the transaction hash to verify your vote at any time</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                What's Next?
              </h2>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">1</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Monitor Election Progress
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      You can view the election details and track voting progress until the election ends.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">2</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      View Results
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Once voting ends, you'll be able to see the final results and verify the election outcome.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">3</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Verify Your Vote
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Use your transaction hash to verify that your vote was properly recorded in the blockchain.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href={`/elections/${election.id}`}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-6 rounded-md font-medium transition-colors"
            >
              View Election Details
            </Link>
            <Link
              href="/elections"
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-center py-3 px-6 rounded-md font-medium transition-colors"
            >
              Browse Other Elections
            </Link>
          </div>

          {/* Save Receipt */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                const receipt = `
BlockVote - Vote Receipt
========================
Election: ${election.title}
Candidate: ${vote.candidate}
Timestamp: ${formatDate(vote.timestamp)}
Transaction Hash: ${vote.transactionHash}
Voter ID: ${vote.voterId}

This receipt serves as proof of your participation in the election.
Keep this for your records.
                `.trim();
                
                const blob = new Blob([receipt], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `vote-receipt-${election.id}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 underline"
            >
              Download Vote Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
