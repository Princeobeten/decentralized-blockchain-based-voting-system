'use client';

import MetaMaskNavBar from '@/components/MetaMaskNavBar';
import { useSDK } from '@metamask/sdk-react';
import { useEffect, useState } from 'react';
import { formatAddress, formatBalance, formatChainAsNum } from '@/lib/utils';

export default function MetaMaskTestPage() {
  const { sdk, connected, chainId, balance, account } = useSDK();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering content that uses browser APIs
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <MetaMaskNavBar />
      
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            MetaMask SDK Integration Test
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            This page demonstrates the official MetaMask SDK integration with Next.js
          </p>
        </div>
        
        <div className="mt-10 bg-white shadow overflow-hidden rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">Connection Status</h2>
            <div className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium text-gray-500">Connection</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {connected ? (
                      <span className="text-green-600">Connected</span>
                    ) : (
                      <span className="text-red-600">Not Connected</span>
                    )}
                  </p>
                </div>
                
                {connected && (
                  <>
                    <div className="border rounded-md p-4">
                      <h3 className="text-sm font-medium text-gray-500">Account</h3>
                      <p className="mt-1 text-lg font-semibold text-gray-900 break-all">
                        {account || 'Not available'}
                      </p>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="text-sm font-medium text-gray-500">Chain ID</h3>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {chainId ? formatChainAsNum(chainId) : 'Not available'}
                      </p>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="text-sm font-medium text-gray-500">Balance</h3>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {balance ? `${formatBalance(balance)} ETH` : 'Not available'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
