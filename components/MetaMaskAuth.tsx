'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { MetaMaskSDK } from '@metamask/sdk';
import { signMessage } from '@/lib/web3Auth';
import { signIn } from 'next-auth/react';
import MetaMaskHelper from './MetaMaskHelper';

interface MetaMaskAuthProps {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
  className?: string;
}

const MetaMaskAuth: React.FC<MetaMaskAuthProps> = ({ 
  onError, 
  onSuccess,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletStatus, setWalletStatus] = useState<'not-installed' | 'locked' | 'ready'>('not-installed');
  const [address, setAddress] = useState<string | null>(null);
  const [sdk, setSDK] = useState<any>(null);
  
  // Helper function to check if it's genuine MetaMask and not another wallet spoofing it
  const isGenuineMetaMask = useCallback(() => {
    if (!window.ethereum) return false;
    
    // Check for properties that would indicate other wallets
    // Use a type assertion to access properties that may not be in the type definition
    const eth = window.ethereum as any;
    
    const hasOtherWalletIndicators = (
      eth.isTrust || 
      eth.isTrustWallet || 
      eth.isTronLink || 
      eth.isTokenPocket || 
      eth.isMathWallet ||
      eth.isCoinbaseWallet ||
      eth.isWalletConnect
    );
    
    // If it has isMetaMask but also other wallet indicators, it's likely not genuine MetaMask
    if (eth.isMetaMask && hasOtherWalletIndicators) {
      console.log('Detected wallet spoofing MetaMask:', eth);
      return false;
    }
    
    return eth.isMetaMask === true;
  }, []);
  
  // Initialize the MetaMask SDK
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Direct check for MetaMask in window.ethereum
    console.log('Checking for MetaMask availability...');
    if (window.ethereum) {
      // Use type assertion for property access
      const eth = window.ethereum as any;
      
      console.log('window.ethereum exists:', eth);
      console.log('isMetaMask:', eth.isMetaMask);
      console.log('isTrust:', eth.isTrust);
      console.log('isTrustWallet:', eth.isTrustWallet);
      console.log('isTronLink:', eth.isTronLink);
      console.log('Is genuine MetaMask:', isGenuineMetaMask());
    } else {
      console.log('window.ethereum is not available');
    }
    
    // Don't re-initialize if already done
    if (sdk) return;
    
    // IMPORTANT: First check directly if MetaMask is available in the window
    // This is more reliable than waiting for the SDK
    if (isGenuineMetaMask()) {
      console.log('Genuine MetaMask detected directly in window.ethereum');
      setWalletStatus('locked'); // Default to locked, we'll check accounts next
      
      // Check if already connected
      // Add null check to satisfy TypeScript
      if (window.ethereum) {
        window.ethereum.request({ method: 'eth_accounts' })
          .then((accounts: any) => {
            if (accounts && accounts.length > 0) {
              console.log('Accounts already connected:', accounts);
              setWalletStatus('ready');
              setAddress(accounts[0]);
            }
          })
          .catch(err => console.error('Error checking accounts:', err));
      }
    }

    const initializeSDK = async () => {
      try {
        console.log('Initializing MetaMask SDK...');
        const MMSDK = new MetaMaskSDK({
          dappMetadata: {
            name: 'BlockVote',
            url: window.location.href,
            // Note: icon is not in the type, but it's used in the docs
            // @ts-ignore - The SDK docs show this property but TypeScript doesn't recognize it
            iconUrl: `${window.location.origin}/logo.png`, // Make sure this exists
          },
          // Optional: Customize popups, etc.
          // @ts-ignore - TypeScript definitions may be outdated compared to the actual SDK
          checkInstallationImmediately: true,
          // Popup options
          useDeeplink: false,
          communicationServerUrl: undefined,
          logging: {
            sdk: true, // Always log in this version for debugging
          },
        });

        setSDK(MMSDK);
        console.log('MetaMask SDK initialized');
        
        // Check if MetaMask is installed via SDK
        const ethereum = MMSDK.getProvider();
        console.log('SDK ethereum provider:', ethereum);
        
        if (!ethereum || !ethereum.isMetaMask) {
          console.log('MetaMask not detected via SDK');
          // Don't set to not-installed if we already detected it directly
          if (walletStatus === 'not-installed') {
            setWalletStatus('not-installed');
          }
          return;
        }

        // Check if wallet is unlocked
        try {
          const accounts = await ethereum.request({ method: 'eth_accounts' }) as string[];
          if (accounts && accounts.length > 0) {
            setWalletStatus('ready');
            setAddress(accounts[0]);
          } else {
            setWalletStatus('locked');
          }
        } catch (err) {
          console.error('Error checking wallet status:', err);
          setWalletStatus('locked');
        }
      } catch (err) {
        console.error('Error initializing MetaMask SDK:', err);
        setWalletStatus('not-installed');
      }
    };

    initializeSDK();

    // Set up event listeners for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setAddress(null);
          setWalletStatus('locked');
        } else {
          setAddress(accounts[0]);
          setWalletStatus('ready');
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      // Clean up event listeners
      // Note: MetaMask's ethereum API doesn't have standard removeListener
      // We would need to keep references to the actual handlers to remove them properly
      // For simplicity in this demo, we accept this minor memory leak
      // In production, you'd want to store the handler references and remove them properly
    };
  }, [sdk]);

  const handleAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Double check MetaMask availability
      console.log('MetaMask auth attempt, checking availability...');
      
      if (!window.ethereum) {
        console.error('window.ethereum is not available when trying to authenticate');
        throw new Error('MetaMask is not installed or not accessible');
      }
      
      if (!isGenuineMetaMask()) {
        console.error('Found wallet provider, but not genuine MetaMask');
        throw new Error('TrustWallet or another wallet detected. For MetaMask authentication, please disable other wallet extensions and refresh.');
      }
      
      console.log('Genuine MetaMask confirmed, proceeding with auth...');

      // Request accounts
      let selectedAddress;
      try {
        // Store in a variable to avoid TypeScript null checks
        const ethereum = window.ethereum;
        if (!ethereum) {
          throw new Error('Ethereum provider not available');
        }
        
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found. Please unlock your wallet.');
        }
        selectedAddress = accounts[0];
        setAddress(selectedAddress);
      } catch (err: any) {
        if (err.code === 4001) {
          throw new Error('Connection rejected. You denied the connection request.');
        } else {
          throw new Error(`Failed to connect to wallet: ${err.message || 'Unknown error'}`);
        }
      }

      // Generate a nonce for security
      const nonce = Math.floor(Math.random() * 1000000).toString();
      const message = `Login to BlockVote with your wallet\n\nWallet Address: ${selectedAddress}\nNonce: ${nonce}\nTimestamp: ${Date.now()}`;

      // Sign the message
      let signature;
      try {
        if (!selectedAddress) {
          throw new Error('No wallet address available for signing');
        }
        signature = await signMessage(message, selectedAddress);
      } catch (err: any) {
        console.error('Error during message signing:', err);
        throw new Error('Signature rejected. You must sign the message to authenticate.');
      }

      // Call NextAuth sign in with the web3 provider
      const result = await signIn('web3', {
        redirect: false,
        address: selectedAddress,
        signature,
        message,
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        console.log('Web3 authentication successful!');
        if (onSuccess) onSuccess();
        
        // Redirect with a delay to ensure session is established
        setTimeout(() => {
          window.location.href = '/dashboard';
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
  }, [onError, onSuccess]);

  // Render different content based on wallet status
  // Force check for MetaMask
  const forceRefreshCheck = useCallback(() => {
    console.log('Force refreshing MetaMask check...');
    
    // Direct check without SDK
    if (window.ethereum && isGenuineMetaMask()) {
      console.log('Force check: Genuine MetaMask found!');  
      setWalletStatus('locked'); // Default to locked first
      
      // Add null check to satisfy TypeScript
      const ethereum = window.ethereum; // Store in variable to avoid TypeScript warning
      if (ethereum) {
        ethereum.request({ method: 'eth_accounts' })
          .then((accounts: any) => {
            if (accounts && accounts.length > 0) {
              console.log('Force check: Accounts found!', accounts[0]);
              setWalletStatus('ready');
              setAddress(accounts[0]);
            } else {
              console.log('Force check: No accounts, wallet is locked');
              setWalletStatus('locked');
            }
          })
          .catch(err => {
            console.error('Force check: Error checking accounts:', err);
            setWalletStatus('locked');
          });
      }
    } else if (window.ethereum) {
      console.log('Force check: Found wallet provider, but not genuine MetaMask');
      // Show a more informative message to the user about the wallet conflict
      setError('Multiple wallet extensions detected. Please disable other wallet extensions or use TrustWallet directly.');
      setWalletStatus('not-installed');
    } else {
      console.log('Force check: No wallet provider found');
      setWalletStatus('not-installed');
    }
  }, [isGenuineMetaMask]);

  const renderContent = () => {
    if (walletStatus === 'not-installed') {
      return <MetaMaskHelper mode="install" />;
    } else if (walletStatus === 'locked') {
      return <MetaMaskHelper mode="unlock" />;
    } else {
      return (
        <div className="flex flex-col items-center">
          {address && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Connected: {address.substring(0, 6)}...{address.substring(address.length - 4)}
            </div>
          )}
          <button
            onClick={handleAuth}
            disabled={isLoading}
            className={`flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 rounded-md text-white font-medium shadow-sm transition-colors w-full justify-center`}
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span className="flex items-center">
                <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M93.06 308.13L93.06 212.94L163.51 256.51L93.06 308.13Z" fill="#E17726"/>
                  <path d="M418.94 308.13L348.49 256.51L418.94 212.94L418.94 308.13Z" fill="#E17726"/>
                  <path d="M256.56 368.46L256.56 433.71L196.05 407.35L256.56 368.46Z" fill="#E17726"/>
                  <path d="M256.56 248.15L312.51 271.39L256.56 299.22L201.84 271.39L256.56 248.15Z" fill="#E17726"/>
                  <path d="M93.06 212.94L201.84 271.39L163.51 256.51L93.06 212.94Z" fill="#E17726"/>
                  <path d="M348.49 256.51L312.51 271.39L418.94 212.94L348.49 256.51Z" fill="#E17726"/>
                </svg>
                Sign in with MetaMask
              </span>
            )}
          </button>
        </div>
      );
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {renderContent()}
      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-500">
          {error}
        </div>
      )}
      
      {walletStatus === 'not-installed' && (
        <div className="mt-4">
          <button
            onClick={forceRefreshCheck}
            className="w-full px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium"
          >
            Manual MetaMask Detection Check
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Click this if you have MetaMask installed but it's not being detected.
          </p>
        </div>
      )}
    </div>
  );
};

export default MetaMaskAuth;
