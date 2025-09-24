'use client';

import React, { useState, useCallback } from 'react';
import { useSDK, MetaMaskProvider } from '@metamask/sdk-react';
import { signIn } from 'next-auth/react';
import { ethers } from 'ethers';
import { signMessage } from '@/lib/web3Auth';
import { formatAddress } from '@/lib/utils';
import WalletIcon from '../public/icons/WalletIcon';

interface MetaMaskSDKAuthProps {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
  className?: string;
  callbackUrl?: string;
  mode?: 'signin' | 'register';
}

// Button component for consistency
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }> = ({ 
  children, 
  className = '',
  ...props 
}) => (
  <button
    className={`flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 rounded-md text-white font-medium shadow-sm transition-colors w-full ${className}`}
    {...props}
  >
    {children}
  </button>
);

const MetaMaskAuthContent = ({ 
  onError,
  onSuccess,
  className = '',
  callbackUrl = '/dashboard',
  mode = 'signin'
}: MetaMaskSDKAuthProps) => {
  const { sdk, connected, connecting, account } = useSDK();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // If not already connected, connect first
      console.log('Connection status:', { connected, account });
      
      if (!connected || !account) {
        try {
          console.log('Attempting to connect wallet...');
          await sdk?.connect();
          
          // We need to check the connection status differently since TypeScript doesn't recognize these properties
          // The MetaMask SDK internally tracks this state but TypeScript definitions might be outdated
          const sdkAsAny = sdk as any;
          if (!sdkAsAny?.connected || !sdkAsAny?.account) {
            console.log('SDK connection status after connect:', { connected: connected, account: account });
            
            // Try a direct connection with window.ethereum if SDK fails
            if (window.ethereum) {
              console.log('Falling back to direct ethereum.request');
              const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
              if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found. Please unlock your wallet and try again.');
              }
              // No need to set the account here, as we'll use the one from the SDK or window.ethereum later
            }
          }
        } catch (err: any) {
          console.error('Connection error:', err);
          throw new Error(err.message || 'Failed to connect to MetaMask');
        }
      }
      
      // Use either the SDK account or get it directly from the connected state
      const activeAccount = account;
      console.log('Active account:', activeAccount);
      
      // Verify we have an account
      if (!activeAccount) {
        throw new Error('No account selected. Please unlock your wallet and try again.');
      }
      
      // Generate a nonce for security
      const nonce = Math.floor(Math.random() * 1000000).toString();
      const timestamp = Date.now();
      const message = `Login to BlockVote with your wallet\n\nWallet Address: ${activeAccount}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
      
      // Sign the message - this is just a signature, doesn't require gas
      let signature;
      try {
        console.log('Attempting to sign message with account:', activeAccount);
        
        // The proper way to sign messages with ethers.js and MetaMask
        if (window.ethereum) {
          try {
            // Create an ethers provider from the window.ethereum object
            const provider = new ethers.BrowserProvider(window.ethereum);
            console.log('Created ethers provider');
            
            // Get the signer (the connected account)
            const signer = await provider.getSigner();
            console.log('Got signer:', await signer.getAddress());
            
            // Sign the message using ethers
            signature = await signer.signMessage(message);
            console.log('Message signed successfully with ethers:', signature);
          } catch (ethersErr) {
            console.warn('Ethers signing failed, falling back to direct RPC', ethersErr);
            
            // Fallback to direct RPC call if ethers approach fails
            try {
              signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [message, activeAccount],
              });
              console.log('Message signed successfully with direct RPC:', signature);
            } catch (rpcErr) {
              console.error('Direct RPC signing also failed', rpcErr);
              throw rpcErr;
            }
          }
        } else {
          throw new Error('Ethereum provider not available');
        }
      } catch (err: any) {
        console.error('Error during message signing:', err);
        if (err?.code === 4001) {
          throw new Error('Signature rejected. You must sign the message to authenticate.');
        } else {
          throw new Error(`Error signing message: ${err?.message || 'Unknown error'} (${JSON.stringify(err)})`);
        }
      }
      
      // Call NextAuth sign in with the web3 provider
      const result = await signIn('web3', {
        redirect: false,
        address: activeAccount,
        signature,
        message,
        callbackUrl,
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
      if (result?.ok) {
        console.log('Web3 authentication successful!');
        if (onSuccess) onSuccess();
        
        // Redirect with a delay to ensure session is established
        setTimeout(() => {
          window.location.href = callbackUrl;
        }, 500);
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err: any) {
      console.error('MetaMask auth error:', err);
      setError(err.message || 'An error occurred during authentication');
      if (onError) onError(err);
    } finally {
      setIsLoading(false);
    }
  }, [sdk, connected, account, onError, onSuccess, callbackUrl]);
  
  return (
    <div className={`w-full ${className}`}>
      <Button
        onClick={handleAuth}
        disabled={isLoading}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <span className="flex items-center">
            <WalletIcon className="mr-2 h-5 w-5" />
            {mode === 'signin' ? 'Sign in' : 'Register'} with MetaMask
          </span>
        )}
      </Button>
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
      
      {connected && account && !isLoading && (
        <div className="mt-2 text-sm text-gray-600 text-center">
          Connected: {formatAddress(account)}
        </div>
      )}
    </div>
  );
};

export const MetaMaskSDKAuth = (props: MetaMaskSDKAuthProps) => {
  const host = typeof window !== 'undefined' ? window.location.host : 'defaultHost';
  
  const sdkOptions = {
    logging: { developerMode: process.env.NODE_ENV === 'development' },
    checkInstallationImmediately: false,
    dappMetadata: {
      name: 'BlockVote',
      url: host,
    },
  };
  
  return (
    <MetaMaskProvider debug={false} sdkOptions={sdkOptions}>
      <MetaMaskAuthContent {...props} />
    </MetaMaskProvider>
  );
};

export default MetaMaskSDKAuth;
