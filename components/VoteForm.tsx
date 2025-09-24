'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface VoteFormProps {
  electionId: string;
  candidates: string[];
  onVoteSuccess?: () => void;
}

export default function VoteForm({ 
  electionId, 
  candidates,
  onVoteSuccess 
}: VoteFormProps) {
  const router = useRouter();
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCandidate) {
      setError('Please select a candidate');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          electionId,
          candidate: selectedCandidate,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cast vote');
      }
      
      setSuccess('Your vote has been successfully recorded!');
      setTransactionHash(data.transactionHash);
      
      if (onVoteSuccess) {
        onVoteSuccess();
      }
      
      // Redirect to results page after 3 seconds
      setTimeout(() => {
        router.push(`/elections/${electionId}/results`);
      }, 3000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {success ? (
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{success}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Your vote is now recorded on our blockchain-based ledger.
          </p>
          {transactionHash && (
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Transaction Hash:</p>
              <p className="font-mono text-sm text-gray-800 dark:text-gray-200 break-all">{transactionHash}</p>
            </div>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You'll be redirected to the results page shortly...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cast Your Vote</h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm rounded-md">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-3">
              Select a candidate:
            </label>
            <div className="space-y-3">
              {candidates.map((candidate, index) => (
                <div key={index} className="flex items-center">
                  <input
                    id={`candidate-${index}`}
                    name="candidate"
                    type="radio"
                    value={candidate}
                    checked={selectedCandidate === candidate}
                    onChange={(e) => setSelectedCandidate(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                  />
                  <label
                    htmlFor={`candidate-${index}`}
                    className="ml-3 block text-gray-700 dark:text-gray-300"
                  >
                    {candidate}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedCandidate}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Submit Vote'}
            </button>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Important:</span> Your vote is final and cannot be changed after submission. It will be securely recorded on our blockchain-based ledger.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
