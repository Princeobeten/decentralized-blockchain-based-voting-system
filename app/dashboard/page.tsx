'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BlockchainInfoCard from '@/components/BlockchainInfoCard';

interface Election {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  candidates: string[];
}

interface VoteHistory {
  id: string;
  election: {
    id: string;
    title: string;
  };
  candidate: string;
  timestamp: string;
  transactionHash: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeElections, setActiveElections] = useState<Election[]>([]);
  const [voteHistory, setVoteHistory] = useState<VoteHistory[]>([]);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated') {
      const fetchData = async () => {
        try {
          // Fetch active elections
          const electionsRes = await fetch('/api/elections?active=true');
          if (electionsRes.ok) {
            const electionsData = await electionsRes.json();
            setActiveElections(electionsData.slice(0, 3)); // Show only 3 active elections
          }
          
          // Fetch user's vote history
          const votesRes = await fetch('/api/user/votes');
          if (votesRes.ok) {
            const votesData = await votesRes.json();
            setVoteHistory(votesData);
          }
        } catch (err: any) {
          console.error('Error fetching dashboard data:', err);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    }
  }, [status, router]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <div>
              {session?.user?.walletAddress ? (
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                    {session.user.walletAddress.substring(0, 6)}...
                    {session.user.walletAddress.substring(session.user.walletAddress.length - 4)}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {session?.user?.email}
                </span>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700">
            <dl>
              <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Authentication Method
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {session?.user?.walletAddress ? 'Web3 Wallet' : 'Email & Password'}
                </dd>
              </div>
              <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  User Role
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {session?.user?.role || 'voter'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md">
            <p>Error loading dashboard: {error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Active Elections</h2>
                <Link
                  href="/elections?filter=active"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View All
                </Link>
              </div>
              
              {activeElections.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No active elections</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    There are no currently active elections.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeElections.map((election) => (
                    <div 
                      key={election._id}
                      className="border border-gray-200 dark:border-gray-700 p-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Link href={`/elections/${election._id}/vote`}>
                        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-1">{election.title}</h3>
                        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                          <span>Ends: {formatDate(election.endDate)}</span>
                          <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full">
                            Active
                          </span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6">
                <Link
                  href="/elections"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Browse All Elections
                </Link>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your Voting History</h2>
              
              {voteHistory.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No votes yet</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    You haven't voted in any elections yet. Browse available elections to participate.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {voteHistory.map((vote) => (
                    <div 
                      key={vote.id}
                      className="border border-gray-200 dark:border-gray-700 p-4 rounded-md"
                    >
                      <Link href={`/elections/${vote.election.id}/results`}>
                        <div className="flex justify-between">
                          <h3 className="text-md font-medium text-gray-900 dark:text-white">{vote.election.title}</h3>
                          <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 text-xs rounded-full">
                            Voted
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Your vote:</span> {vote.candidate}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                          <span>Date: {formatDate(vote.timestamp)}</span>
                          <span className="font-mono truncate" style={{ maxWidth: '120px' }} title={vote.transactionHash}>
                            TX: {vote.transactionHash.substring(0, 8)}...
                          </span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
              
              {voteHistory.length > 0 && (
                <div className="mt-6">
                  <Link
                    href="/elections"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Vote in More Elections
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Blockchain Info Card */}
        <BlockchainInfoCard />
      </div>
    </div>
  );
}
