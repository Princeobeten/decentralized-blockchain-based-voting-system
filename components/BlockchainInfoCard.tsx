'use client';

import { useState } from 'react';

export default function BlockchainInfoCard() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-full p-3">
            <svg className="h-6 w-6 text-blue-600 dark:text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Blockchain-Based Voting Benefits
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              How our system leverages blockchain principles for secure, transparent elections
            </p>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-5">
        <ul className="space-y-4">
          {/* Security */}
          <li>
            <button
              onClick={() => toggleSection('security')}
              className="flex justify-between items-center w-full text-left font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md transition-colors"
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Enhanced Security
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${expandedSection === 'security' ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {expandedSection === 'security' && (
              <div className="mt-2 pl-9 pr-2 pb-2 text-sm text-gray-600 dark:text-gray-300">
                <p>Our system uses cryptographic signatures to verify voter identity, making it virtually impossible to impersonate voters. Each vote generates a unique transaction hash, similar to blockchain transactions, ensuring votes cannot be altered once cast.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-500 dark:text-gray-400">
                  <li>Wallet-based authentication prevents credential theft</li>
                  <li>Vote records are immutable once submitted</li>
                  <li>All transactions are cryptographically signed</li>
                </ul>
              </div>
            )}
          </li>
          
          {/* Transparency */}
          <li>
            <button
              onClick={() => toggleSection('transparency')}
              className="flex justify-between items-center w-full text-left font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md transition-colors"
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                Full Transparency
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${expandedSection === 'transparency' ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {expandedSection === 'transparency' && (
              <div className="mt-2 pl-9 pr-2 pb-2 text-sm text-gray-600 dark:text-gray-300">
                <p>Every vote is recorded with a transaction hash that can be independently verified. While protecting voter privacy, our system allows for complete verification of the voting process, ensuring election integrity.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-500 dark:text-gray-400">
                  <li>Public verification of vote tallying</li>
                  <li>Transparent election rules and candidate lists</li>
                  <li>Auditable vote records that preserve privacy</li>
                </ul>
              </div>
            )}
          </li>
          
          {/* Accessibility */}
          <li>
            <button
              onClick={() => toggleSection('accessibility')}
              className="flex justify-between items-center w-full text-left font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md transition-colors"
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                </svg>
                Universal Access
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${expandedSection === 'accessibility' ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {expandedSection === 'accessibility' && (
              <div className="mt-2 pl-9 pr-2 pb-2 text-sm text-gray-600 dark:text-gray-300">
                <p>Our platform supports both Web3 wallet-based authentication and traditional email/password login, making it accessible to everyone. The responsive design works on any device, ensuring voters can participate from anywhere.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-500 dark:text-gray-400">
                  <li>Multiple authentication methods</li>
                  <li>Mobile-friendly voting interface</li>
                  <li>Simplified user experience that requires no blockchain expertise</li>
                </ul>
              </div>
            )}
          </li>
          
          {/* Future Development */}
          <li>
            <button
              onClick={() => toggleSection('future')}
              className="flex justify-between items-center w-full text-left font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md transition-colors"
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                </svg>
                Future Enhancements
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${expandedSection === 'future' ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {expandedSection === 'future' && (
              <div className="mt-2 pl-9 pr-2 pb-2 text-sm text-gray-600 dark:text-gray-300">
                <p>This MVP demonstrates the core concepts of blockchain-based voting. Future versions will implement actual smart contracts on Ethereum or other blockchains, enabling even greater security and decentralization.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-500 dark:text-gray-400">
                  <li>Integration with Ethereum or other smart contract platforms</li>
                  <li>Zero-knowledge proofs for enhanced privacy</li>
                  <li>Decentralized identity verification systems</li>
                  <li>DAO governance capabilities for community-run elections</li>
                </ul>
              </div>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}
