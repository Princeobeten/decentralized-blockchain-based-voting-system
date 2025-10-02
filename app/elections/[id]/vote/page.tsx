'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Election, Vote, getElectionStatus } from '@/types/models';
import { 
  getElectionById, 
  hasUserVoted, 
  saveVote, 
  generateId, 
  generateTransactionHash 
} from '@/lib/localStorage';

export default function VotePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [election, setElection] = useState<Election | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (params.id) {
      loadElectionData();
    }
  }, [params.id, isAuthenticated, user]);

  const loadElectionData = () => {
    setIsLoading(true);
    try {
      const electionData = getElectionById(params.id as string);
      if (!electionData) {
        router.push('/elections');
        return;
      }

      const status = getElectionStatus(electionData);
      if (status !== 'active') {
        router.push(`/elections/${electionData.id}`);
        return;
      }

      if (user && hasUserVoted(user.id, electionData.id)) {
        router.push(`/elections/${electionData.id}`);
        return;
      }

      setElection(electionData);
    } catch (error) {
      console.error('Error loading election data:', error);
      router.push('/elections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoteSubmit = async () => {
    if (!selectedCandidate || !election || !user) {
      setError('Please select a candidate');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Double-check voting eligibility
      if (hasUserVoted(user.id, election.id)) {
        setError('You have already voted in this election');
        return;
      }

      // Create vote record
      const vote: Vote = {
        id: generateId(),
        electionId: election.id,
        voterId: user.id,
        candidate: selectedCandidate,
        timestamp: new Date().toISOString(),
        transactionHash: generateTransactionHash(),
      };

      // Save vote (immutable record)
      saveVote(vote);

      // Redirect to success page
      router.push(`/elections/${election.id}/vote/success?tx=${vote.transactionHash}`);
    } catch (err) {
      setError('Failed to submit vote. Please try again.');
    } finally {
      setIsSubmitting(false);
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
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading voting interface...</p>
        </div>
      </div>
    );
  }

  if (!election) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Cast Your Vote
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {election.title}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-0">
          {/* Election Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300">
                  Important Voting Information
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>You can only vote once in this election</li>
                    <li>Your vote will be recorded immutably on the blockchain</li>
                    <li>Voting ends on {formatDate(election.endDate)}</li>
                    <li>Your vote is anonymous but verifiable</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Voting Form */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Select Your Candidate
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose one candidate from the list below
              </p>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {election.candidates.map((candidate, index) => (
                  <div
                    key={index}
                    className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedCandidate === candidate
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="candidate"
                        value={candidate}
                        checked={selectedCandidate === candidate}
                        onChange={(e) => setSelectedCandidate(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                      />
                      <div className="ml-4 flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
                              {candidate.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {candidate}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Candidate {index + 1}
                          </p>
                        </div>
                      </div>
                      {selectedCandidate === candidate && (
                        <div className="absolute top-4 right-4">
                          <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Confirmation Modal */}
              {showConfirmation && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                  <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
                    <div className="mt-3 text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                        <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mt-4">
                        Confirm Your Vote
                      </h3>
                      <div className="mt-2 px-7 py-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          You are about to vote for <strong>{selectedCandidate}</strong>.
                          This action cannot be undone. Are you sure you want to proceed?
                        </p>
                      </div>
                      <div className="items-center px-4 py-3">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => setShowConfirmation(false)}
                            className="flex-1 px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleVoteSubmit}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
                          >
                            {isSubmitting ? 'Submitting...' : 'Confirm Vote'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedCandidate) {
                        setError('Please select a candidate');
                        return;
                      }
                      setShowConfirmation(true);
                    }}
                    disabled={!selectedCandidate || isSubmitting}
                    className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Submit Vote
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Blockchain Security
                </h3>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <p>
                    Your vote will be secured using blockchain technology with cryptographic hashing.
                    Once submitted, your vote becomes part of an immutable record that ensures election integrity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
