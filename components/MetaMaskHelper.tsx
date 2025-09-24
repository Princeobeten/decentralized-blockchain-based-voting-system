'use client';

import React from 'react';

interface MetaMaskHelperProps {
  mode?: 'install' | 'unlock' | 'connect';
  className?: string;
}

const MetaMaskHelper: React.FC<MetaMaskHelperProps> = ({ mode = 'install', className = '' }) => {
  const handleRefresh = () => {
    console.log('Manual refresh requested...');
    window.location.reload();
  };
  const content = {
    install: {
      title: 'No Web3 Wallet Detected',
      description: 'To use wallet authentication, please install MetaMask or another compatible wallet extension.',
      steps: [
        'Visit metamask.io and install the extension for your browser',
        'Create a new wallet or import an existing one',
        'Return to this page and refresh'
      ],
      link: 'https://metamask.io/download/',
      linkText: 'Install MetaMask'
    },
    unlock: {
      title: 'Wallet Locked',
      description: 'Your wallet appears to be locked. Please unlock it to continue.',
      steps: [
        'Click on the MetaMask icon in your browser extension toolbar',
        'Enter your password to unlock your wallet',
        'Return to this page and try again'
      ],
      link: '',
      linkText: ''
    },
    connect: {
      title: 'Connect Your Wallet',
      description: 'Please approve the connection request in your wallet.',
      steps: [
        'Click the Connect button below',
        'MetaMask will open a popup asking for connection approval',
        'Click "Connect" in the MetaMask popup'
      ],
      link: '',
      linkText: ''
    }
  };

  const { title, description, steps, link, linkText } = content[mode];

  return (
    <div className={`p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {mode === 'install' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : mode === 'unlock' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
            {title}
          </h3>
          <p className="mt-1 text-sm text-blue-700 dark:text-blue-200">
            {description}
          </p>
          <div className="mt-2">
            <ol className="list-decimal list-inside text-xs text-blue-600 dark:text-blue-300 space-y-1">
              {steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
          <div className="mt-3 flex space-x-3">
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 border border-blue-300 dark:border-blue-700 text-xs leading-4 font-medium rounded-md text-blue-700 dark:text-blue-300 bg-white dark:bg-blue-800/40 hover:bg-blue-50 dark:hover:bg-blue-800/60 transition-colors"
              >
                {mode === 'install' && (
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path d="M93.06 308.13L93.06 212.94L163.51 256.51L93.06 308.13Z" fill="#E17726"/>
                    <path d="M418.94 308.13L348.49 256.51L418.94 212.94L418.94 308.13Z" fill="#E17726"/>
                    <path d="M256.56 368.46L256.56 433.71L196.05 407.35L256.56 368.46Z" fill="#E17726"/>
                    <path d="M256.56 248.15L312.51 271.39L256.56 299.22L201.84 271.39L256.56 248.15Z" fill="#E17726"/>
                    <path d="M93.06 212.94L201.84 271.39L163.51 256.51L93.06 212.94Z" fill="#E17726"/>
                    <path d="M348.49 256.51L312.51 271.39L418.94 212.94L348.49 256.51Z" fill="#E17726"/>
                  </svg>
                )}
                {linkText}
              </a>
            )}
            
            {/* Always show refresh button */}
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-3 py-1 border border-green-300 dark:border-green-700 text-xs leading-4 font-medium rounded-md text-green-700 dark:text-green-300 bg-white dark:bg-green-800/40 hover:bg-green-50 dark:hover:bg-green-800/60 transition-colors"
            >
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetaMaskHelper;
