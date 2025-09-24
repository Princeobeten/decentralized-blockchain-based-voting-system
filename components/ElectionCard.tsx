'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ElectionCardProps {
  id: string;
  title: string;
  description: string;
  startDate: string | Date;
  endDate: string | Date;
  candidates: string[];
  hasVoted?: boolean;
}

export default function ElectionCard({
  id,
  title,
  description,
  startDate,
  endDate,
  candidates,
  hasVoted = false
}: ElectionCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Format dates for display
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Calculate election status
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let status = 'Upcoming';
  let statusColor = 'bg-yellow-100 text-yellow-800';
  
  if (now >= start && now <= end) {
    status = 'Active';
    statusColor = 'bg-green-100 text-green-800';
  } else if (now > end) {
    status = 'Ended';
    statusColor = 'bg-gray-100 text-gray-800';
  }
  
  const handleVoteClick = () => {
    router.push(`/elections/${id}/vote`);
  };
  
  const handleResultsClick = () => {
    router.push(`/elections/${id}/results`);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
            {status}
          </span>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {isExpanded ? description : `${description.substring(0, 100)}${description.length > 100 ? '...' : ''}`}
          {description.length > 100 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 dark:text-blue-400 hover:underline ml-2 font-medium"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Start:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-gray-200">{formatDate(startDate)}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">End:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-gray-200">{formatDate(endDate)}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Candidates:</h4>
          <div className="flex flex-wrap gap-2">
            {candidates.map((candidate, index) => (
              <span
                key={index}
                className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-md text-xs"
              >
                {candidate}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 flex justify-between">
        {status === 'Active' && !hasVoted ? (
          <button
            onClick={handleVoteClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm"
          >
            Cast Your Vote
          </button>
        ) : (
          <button
            onClick={handleResultsClick}
            className={`${status === 'Ended' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-2 px-4 rounded-md text-sm`}
          >
            {status === 'Ended' ? 'View Final Results' : hasVoted ? 'View Your Vote' : 'View Details'}
          </button>
        )}
        
        {hasVoted && status === 'Active' && (
          <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            <span className="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
            Voted
          </span>
        )}
      </div>
    </div>
  );
}
