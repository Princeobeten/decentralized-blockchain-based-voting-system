'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { saveAs } from 'file-saver';
// If file-saver is not installed, we'll need to install it with npm install file-saver @types/file-saver

interface Result {
  candidate: string;
  votes: number;
  percentage: number;
}

interface ElectionData {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isEnded: boolean;
}

interface VoterInfo {
  id: string;
  name: string;
  timestamp: string;
  candidate: string;
  transactionHash: string;
}

interface ElectionResultsProps {
  electionId: string;
}

export default function ElectionResults({ electionId }: ElectionResultsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [election, setElection] = useState<ElectionData | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [transactionHashes, setTransactionHashes] = useState<string[]>([]);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [voterInfo, setVoterInfo] = useState<VoterInfo[]>([]);
  const [showVoterInfo, setShowVoterInfo] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  // Ref for export dropdown to handle click outside
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside to close export options dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportOptions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/elections/${electionId}/results`);
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch results');
        }
        
        const data = await response.json();
        setResults(data.results || []);
        setElection(data.election || null);
        setTotalVotes(data.totalVotes || 0);
        setTransactionHashes(data.transactionHashes || []);
        setVoterInfo(data.voterInfo || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [electionId]);
  
  // Sort results by votes (descending)
  const sortedResults = [...results].sort((a, b) => b.votes - a.votes);
  const winner = sortedResults.length > 0 ? sortedResults[0] : null;
  
  // Function to export election results
  const exportResults = async () => {
    if (!election) return;
    
    try {
      setExportLoading(true);
      setShowExportOptions(false);
      
      // Create export data object
      const exportData = {
        election: {
          title: election.title,
          description: election.description,
          startDate: formatDate(election.startDate),
          endDate: formatDate(election.endDate),
          isEnded: election.isEnded
        },
        results: sortedResults.map(result => ({
          candidate: result.candidate,
          votes: result.votes,
          percentage: result.percentage
        })),
        totalVotes,
        voterInfo: voterInfo.map(voter => ({
          id: voter.id,
          name: voter.name,
          timestamp: formatDate(voter.timestamp),
          candidate: voter.candidate,
          transactionHash: voter.transactionHash
        })),
        exportDate: new Date().toISOString(),
      };
      
      if (exportFormat === 'json') {
        // Export as JSON
        const jsonData = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        saveAs(blob, `election-results-${election.id}-${new Date().toISOString().slice(0, 10)}.json`);
      } else {
        // Export as CSV
        // Generate CSV for results
        let csvContent = 'Election Results\n';
        csvContent += `Title,${election.title}\n`;
        csvContent += `Description,${election.description}\n`;
        csvContent += `Start Date,${formatDate(election.startDate)}\n`;
        csvContent += `End Date,${formatDate(election.endDate)}\n`;
        csvContent += `Status,${election.isEnded ? 'Ended' : 'Ongoing'}\n\n`;
        
        // Results section
        csvContent += 'Results\nCandidate,Votes,Percentage\n';
        sortedResults.forEach(result => {
          csvContent += `${result.candidate},${result.votes},${result.percentage}%\n`;
        });
        csvContent += `Total Votes,${totalVotes}\n\n`;
        
        // Voter information section
        if (voterInfo.length > 0) {
          csvContent += 'Voter Information\nVoter,Time,Candidate,Transaction Hash\n';
          voterInfo.forEach(voter => {
            csvContent += `${voter.name},${formatDate(voter.timestamp)},${voter.candidate},${voter.transactionHash}\n`;
          });
        }
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, `election-results-${election.id}-${new Date().toISOString().slice(0, 10)}.csv`);
      }
    } catch (err) {
      console.error('Failed to export results:', err);
    } finally {
      setExportLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-300">
        <p>Error: {error}</p>
        <Link href="/elections" className="text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">
          Return to elections
        </Link>
      </div>
    );
  }
  
  if (!election) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md text-yellow-700 dark:text-yellow-300">
        <p>Election not found or no results available.</p>
        <Link href="/elections" className="text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">
          Return to elections
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mr-4">Election Results</h2>
            <div className="relative" ref={exportDropdownRef}>
              <button
                onClick={() => setShowExportOptions(!showExportOptions)}
                disabled={exportLoading}
                className="flex items-center px-3 py-1 text-sm font-medium rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
              >
                {exportLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exporting...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Export Results
                    <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </span>
                )}
              </button>
              
              {/* Export options dropdown */}
              {showExportOptions && (
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setExportFormat('json');
                      exportResults();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
                    </svg>
                    Export as JSON
                  </button>
                  <button
                    onClick={() => {
                      setExportFormat('csv');
                      exportResults();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Export as CSV
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className={`px-3 py-1 text-xs font-semibold rounded-full ${
            election.isEnded 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
          }`}>
            {election.isEnded ? 'Final Results' : 'Preliminary Results'}
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{election.title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <div>Start: {formatDate(election.startDate)}</div>
            <div>End: {formatDate(election.endDate)}</div>
          </div>
        </div>
        
        {election.isEnded && winner && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="mr-4 bg-green-100 dark:bg-green-800 rounded-full p-2">
                <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-green-700 dark:text-green-300">Winner</h4>
                <p className="text-gray-700 dark:text-gray-300 text-lg">{winner.candidate}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">with {winner.votes} votes ({winner.percentage}%)</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Vote Distribution</h4>
          <div className="space-y-4">
            {sortedResults.map((result, index) => (
              <div key={index} className="relative">
                <div className="flex justify-between mb-1 text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{result.candidate}</span>
                  <span className="text-gray-600 dark:text-gray-400">{result.votes} votes ({result.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${result.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Total votes: {totalVotes}
          </p>
        </div>
        
        {transactionHashes.length > 0 && (
          <div className="mt-8">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Blockchain Verification</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              All votes are recorded on the blockchain for transparency and verification. 
              Each vote generates a unique transaction hash.
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3">
              <div className="mb-2 flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Transaction Hashes ({transactionHashes.length})
                </span>
                {transactionHashes.length > 3 && (
                  <button
                    onClick={() => setShowAllTransactions(!showAllTransactions)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {showAllTransactions ? 'Show Less' : 'Show All'}
                  </button>
                )}
              </div>
              
              <div className="space-y-2">
                {(showAllTransactions ? transactionHashes : transactionHashes.slice(0, 3)).map((hash, index) => (
                  <div key={index} className="font-mono text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded break-all">
                    {hash}
                  </div>
                ))}
                
                {!showAllTransactions && transactionHashes.length > 3 && (
                  <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                    + {transactionHashes.length - 3} more transaction{transactionHashes.length - 3 > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Voter Information Section */}
        {voterInfo.length > 0 && (
          <div className="mt-8">
            <div className="mb-3 flex justify-between items-center">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Voter Information</h4>
              <button
                onClick={() => setShowVoterInfo(!showVoterInfo)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {showVoterInfo ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
            
            {showVoterInfo && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-800 text-left">
                        <th className="py-2 px-3 font-medium">Voter</th>
                        <th className="py-2 px-3 font-medium">Time</th>
                        <th className="py-2 px-3 font-medium">Candidate</th>
                        <th className="py-2 px-3 font-medium">Transaction Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {voterInfo.map((voter, index) => (
                        <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-750">
                          <td className="py-2 px-3 font-medium">{voter.name}</td>
                          <td className="py-2 px-3">{formatDate(voter.timestamp)}</td>
                          <td className="py-2 px-3">{voter.candidate}</td>
                          <td className="py-2 px-3 font-mono">
                            <div className="truncate max-w-xs" title={voter.transactionHash}>
                              {voter.transactionHash.substring(0, 10)}...{voter.transactionHash.substring(voter.transactionHash.length - 10)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                  Total voters: {voterInfo.length}
                </div>
              </div>
            )}
            
            {!showVoterInfo && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 text-sm text-gray-500 dark:text-gray-400">
                <p>Click "Show Details" to view individual voter information.</p>
                <p className="mt-1 text-xs">This information is displayed in a format similar to blockchain transactions for transparency.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
