'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import WalletMultiButton from '@/components/WalletMultiButton';
import { isWeb3Available } from '@/lib/web3Auth';
import { connectWithWalletConnect } from '@/lib/walletConnectService';

export default function WalletTestPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const testWalletConnect = async () => {
    setStatus('loading');
    setMessage('Initializing WalletConnect...');
    setError('');
    
    try {
      // Test WalletConnect connection
      setMessage('Opening WalletConnect QR code. Please scan with your mobile wallet...');
      const address = await connectWithWalletConnect();
      
      setMessage(`Successfully connected to wallet: ${address}`);
      setStatus('success');
    } catch (err: any) {
      console.error('WalletConnect test error:', err);
      setError(err.message || 'Failed to connect with WalletConnect');
      setStatus('error');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden max-w-2xl mx-auto">
          <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet Connection Test</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Test your wallet connection with our voting system.
            </p>
          </div>
          
          <div className="px-6 py-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">WalletConnect Integration</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Test your WalletConnect integration with this simple connection test.
              </p>
              
              <div className="space-y-4">
                <WalletMultiButton />
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Connection Status</h3>
                  
                  {status === 'idle' && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click the connect button above to test your wallet connection.
                    </p>
                  )}
                  
                  {status === 'loading' && (
                    <div className="flex items-center space-x-3">
                      <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{message}</p>
                    </div>
                  )}
                  
                  {status === 'success' && (
                    <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-md">
                      <div className="flex">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-800 dark:text-green-300">Connection successful!</p>
                          <p className="mt-1 text-xs text-green-700 dark:text-green-200">{message}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {status === 'error' && (
                    <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
                      <div className="flex">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-red-800 dark:text-red-300">Connection failed</p>
                          <p className="mt-1 text-xs text-red-700 dark:text-red-200">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Troubleshooting Tips</h3>
              <ul className="list-disc text-xs text-blue-700 dark:text-blue-200 pl-5 space-y-1">
                <li>Make sure your WalletConnect Project ID is correctly set in your .env.local file</li>
                <li>If using a mobile wallet, ensure you have a compatible app installed (like MetaMask Mobile or Trust Wallet)</li>
                <li>Check your browser console for any specific error messages</li>
                <li>Try refreshing the page and attempting the connection again</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
