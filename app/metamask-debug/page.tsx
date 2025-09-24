'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function MetaMaskDebugPage() {
  const [metamaskState, setMetamaskState] = useState<{
    installed: boolean;
    isMetaMask: boolean | undefined;
    selectedAddress: string | undefined;
    chainId: string | undefined;
    accounts: string[];
    networkName: string;
    connected: boolean;
    error: string | null;
  }>({
    installed: false,
    isMetaMask: false,
    selectedAddress: undefined,
    chainId: undefined,
    accounts: [],
    networkName: 'Unknown',
    connected: false,
    error: null
  });
  
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<Array<{ name: string; passed: boolean; message: string }>>([]);
  
  useEffect(() => {
    async function checkMetaMask() {
      try {
        const hasEthereum = typeof window !== 'undefined' && !!window.ethereum;
        const tests: Array<{ name: string; passed: boolean; message: string }> = [];
        
        // Check if ethereum is available
        tests.push({
          name: 'Ethereum Object',
          passed: hasEthereum,
          message: hasEthereum ? 'Window.ethereum object detected' : 'No window.ethereum object found. MetaMask not installed or disabled.'
        });
        
        if (!hasEthereum) {
          setMetamaskState({
            installed: false,
            isMetaMask: false,
            selectedAddress: undefined,
            chainId: undefined,
            accounts: [],
            networkName: 'Unknown',
            connected: false,
            error: 'MetaMask not installed or not accessible'
          });
          setTestResults(tests);
          setLoading(false);
          return;
        }
        
        // Check if it's actually MetaMask
        const isActuallyMetaMask = window.ethereum?.isMetaMask;
        tests.push({
          name: 'Is MetaMask',
          passed: !!isActuallyMetaMask,
          message: isActuallyMetaMask ? 'MetaMask confirmed' : 'Provider is not MetaMask'
        });
        
        // Try to get accounts to check if unlocked
        let accounts: string[] = [];
        let accountsError = null;
        
        try {
          if (!window.ethereum) throw new Error('No ethereum object found');
          accounts = await window.ethereum.request({ method: 'eth_accounts' });
          tests.push({
            name: 'Access to Accounts',
            passed: accounts.length > 0,
            message: accounts.length > 0 
              ? `${accounts.length} account(s) accessible` 
              : 'No accounts accessible. MetaMask might be locked.'
          });
        } catch (error: any) {
          accountsError = error.message || 'Failed to get accounts';
          tests.push({
            name: 'Access to Accounts',
            passed: false,
            message: `Error accessing accounts: ${accountsError}`
          });
        }
        
        // Get network info
        let chainId = 'Unknown';
        let networkName = 'Unknown';
        
        try {
          if (!window.ethereum) throw new Error('No ethereum object found');
          chainId = await window.ethereum.request({ method: 'eth_chainId' });
          
          const networkMap: Record<string, string> = {
            '0x1': 'Ethereum Mainnet',
            '0x5': 'Goerli Testnet',
            '0xaa36a7': 'Sepolia Testnet',
            '0x89': 'Polygon Mainnet',
            '0x13881': 'Mumbai Testnet'
          };
          
          networkName = networkMap[chainId] || `Unknown (ID: ${chainId})`;
          
          tests.push({
            name: 'Network Detection',
            passed: true,
            message: `Connected to ${networkName}`
          });
        } catch (error: any) {
          tests.push({
            name: 'Network Detection',
            passed: false,
            message: `Error detecting network: ${error.message || 'Unknown error'}`
          });
        }
        
        // Try requesting accounts (will prompt user if metamask is unlocked)
        let connected = false;
        let connectionError = null;
        
        try {
          if (!window.ethereum) throw new Error('No ethereum object found');
          const requestedAccounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts',
            params: []
          });
          
          connected = requestedAccounts && requestedAccounts.length > 0;
          if (connected) {
            accounts = requestedAccounts; // Update accounts with the latest
          }
          
          tests.push({
            name: 'Connection Request',
            passed: connected,
            message: connected 
              ? 'Successfully requested account access' 
              : 'Failed to get accounts after request'
          });
        } catch (error: any) {
          connectionError = error;
          let errorMessage = 'Unknown error';
          
          if (error.code === 4001) {
            errorMessage = 'User rejected the connection request';
          } else if (error.code === -32002) {
            errorMessage = 'Request already pending in MetaMask';
          } else if (error.code === -32603) {
            errorMessage = 'No active wallet found (MetaMask may be locked)';
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          tests.push({
            name: 'Connection Request',
            passed: false,
            message: `Connection error: ${errorMessage}`
          });
        }
        
        setMetamaskState({
          installed: true,
          isMetaMask: !!isActuallyMetaMask,
          selectedAddress: accounts[0] || undefined,
          chainId,
          accounts,
          networkName,
          connected,
          error: connectionError ? (connectionError.message || 'Connection error') : null
        });
        
        setTestResults(tests);
      } catch (err: any) {
        console.error('Error in MetaMask debug:', err);
        setMetamaskState(prev => ({
          ...prev,
          error: err.message || 'Unknown error checking MetaMask'
        }));
      } finally {
        setLoading(false);
      }
    }
    
    checkMetaMask();
  }, []);
  
  const refreshTests = () => {
    setLoading(true);
    setTestResults([]);
    window.location.reload();
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Home
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MetaMask Connection Diagnostic</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              This page helps diagnose issues with your MetaMask wallet connection.
            </p>
          </div>
          
          <div className="px-6 py-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              <div>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Test Results</h2>
                  <div className="space-y-3">
                    {testResults.map((test, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-md ${test.passed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}
                      >
                        <div className="flex items-center">
                          {test.passed ? (
                            <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                          <div className="ml-3">
                            <h3 className={`text-sm font-medium ${test.passed ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                              {test.name}
                            </h3>
                            <p className={`text-sm ${test.passed ? 'text-green-700 dark:text-green-200' : 'text-red-700 dark:text-red-200'}`}>
                              {test.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 mb-8">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">MetaMask State</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Installed:</span> {metamaskState.installed ? 'Yes' : 'No'}</p>
                    <p><span className="font-medium">Is MetaMask:</span> {metamaskState.isMetaMask ? 'Yes' : 'No'}</p>
                    <p><span className="font-medium">Selected Address:</span> {metamaskState.selectedAddress || 'None'}</p>
                    <p><span className="font-medium">Chain ID:</span> {metamaskState.chainId}</p>
                    <p><span className="font-medium">Network:</span> {metamaskState.networkName}</p>
                    <p><span className="font-medium">Connected:</span> {metamaskState.connected ? 'Yes' : 'No'}</p>
                    {metamaskState.error && (
                      <p><span className="font-medium text-red-600 dark:text-red-400">Error:</span> {metamaskState.error}</p>
                    )}
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mb-6">
                  <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Common Solutions</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-blue-700 dark:text-blue-200">
                    <li>Make sure MetaMask extension is installed and enabled in your browser</li>
                    <li>Unlock your MetaMask wallet (click the extension and enter your password)</li>
                    <li>If using a work/school computer, check if MetaMask is allowed by your organization</li>
                    <li>Try switching to a supported network like Ethereum Mainnet or a test network</li>
                    <li>If you see "Request already pending", open MetaMask to check for pending requests</li>
                    <li>Try clearing your browser cache and cookies</li>
                    <li>Restart your browser</li>
                  </ul>
                </div>
                
                <div className="flex justify-center">
                  <button
                    onClick={refreshTests}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Run Tests Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
