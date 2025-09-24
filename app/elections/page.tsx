'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import ElectionCard from '@/components/ElectionCard';

interface Election {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  candidates: string[];
}

export default function ElectionsPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [userVotes, setUserVotes] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'upcoming' | 'past'>('all');
  
  const { data: session } = useSession();
  
  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await fetch('/api/elections');
        
        if (!response.ok) {
          throw new Error('Failed to fetch elections');
        }
        
        const data = await response.json();
        setElections(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    
    const fetchUserVotes = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/user/votes');
          
          if (response.ok) {
            const votes = await response.json();
            
            // Create a map of election IDs that the user has voted in
            const voteMap: Record<string, boolean> = {};
            votes.forEach((vote: { election: { id: string } }) => {
              voteMap[vote.election.id] = true;
            });
            
            setUserVotes(voteMap);
          }
        } catch (err) {
          console.error('Failed to fetch user votes:', err);
        }
      }
    };
    
    const loadData = async () => {
      setLoading(true);
      await fetchElections();
      await fetchUserVotes();
      setLoading(false);
    };
    
    loadData();
  }, [session]);
  
  const filteredElections = elections.filter(election => {
    const now = new Date();
    const start = new Date(election.startDate);
    const end = new Date(election.endDate);
    
    switch (activeFilter) {
      case 'active':
        return now >= start && now <= end;
      case 'upcoming':
        return now < start;
      case 'past':
        return now > end;
      default:
        return true;
    }
  });
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Elections</h1>
          
          <div className="flex space-x-2 overflow-x-auto">
            {['all', 'active', 'upcoming', 'past'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter as any)}
                className={`px-3 py-1 text-sm rounded-full ${
                  activeFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-300">
            <p>Error: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-blue-600 dark:text-blue-400 hover:underline mt-2"
            >
              Retry
            </button>
          </div>
        ) : filteredElections.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No elections found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {activeFilter !== 'all' 
                ? `There are no ${activeFilter} elections at the moment.` 
                : 'There are no elections available at the moment.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredElections.map((election) => (
              <ElectionCard
                key={election._id}
                id={election._id}
                title={election.title}
                description={election.description}
                startDate={election.startDate}
                endDate={election.endDate}
                candidates={election.candidates}
                hasVoted={userVotes[election._id] || false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
