'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { 
  connectWallet, 
  signMessage, 
  generateNonce, 
  isWeb3Available 
} from '@/lib/web3Auth';
import { 
  connectWithWalletConnect, 
  signMessageWithWalletConnect 
} from '@/lib/walletConnectService';
import MetaMaskHelper from './MetaMaskHelper';

type WalletOption = 'metamask' | 'walletconnect' | null;

const WalletMultiButton = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletOption>(null);
  const [error, setError] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [hasMetaMask, setHasMetaMask] = useState(false);
  
  // Check for MetaMask availability
  useEffect(() => {
    setHasMetaMask(isWeb3Available());
  }, []);
  
  const handleConnect = async (walletType: WalletOption) => {
    if (!walletType) return;
    
    setSelectedWallet(walletType);
    setIsConnecting(true);
    setError('');
    setShowOptions(false);
    
    try {
      let address: string;
      
      // Connect to selected wallet type
      if (walletType === 'metamask') {
        address = await connectWallet();
      } else if (walletType === 'walletconnect') {
        // Check if WalletConnect Project ID is configured
        if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 
            process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID === 'get-your-project-id-from-walletconnect-cloud' ||
            process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID === 'your_walletconnect_project_id') {
          throw new Error('WalletConnect is not properly configured. Please set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in your .env.local file.');
        }
        
        address = await connectWithWalletConnect();
      } else {
        throw new Error('Invalid wallet type');
      }
      
      // Generate nonce for authentication
      const nonce = generateNonce();
      const message = `Sign this message to authenticate with our platform: ${nonce}`;
      
      // Sign message with appropriate wallet
      let signature: string;
      if (walletType === 'metamask') {
        signature = await signMessage(message, address);
      } else {
        signature = await signMessageWithWalletConnect(message, address);
      }
      
      // Sign in with NextAuth
      const result = await signIn('web3', {
        address,
        signature,
        message,
        redirect: false,
      });
      
      if (result?.error) {
        setError(result.error);
      }
      
      // Store the wallet type in local storage
      localStorage.setItem('walletType', walletType);
      
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
      setSelectedWallet(null);
    } finally {
      setIsConnecting(false);
    }
  };
  
  const toggleWalletOptions = () => {
    setShowOptions(!showOptions);
    setError('');
  };
  
  return (
    <div className="flex flex-col items-center w-full">
      {/* Main connect button */}
      <button
        onClick={toggleWalletOptions}
        disabled={isConnecting}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connecting...
          </span>
        ) : (
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Connect Wallet
          </span>
        )}
      </button>
      
      {/* Wallet options dropdown */}
      {showOptions && !isConnecting && (
        <div className="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-2">
            {/* MetaMask option */}
            {/* <button
              onClick={() => handleConnect('metamask')}
              disabled={!hasMetaMask}
              className={`w-full text-left p-3 rounded-md flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${!hasMetaMask ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex-shrink-0 h-8 w-8 relative">
                <svg width="32" height="32" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M630.4 109.1L393.6 330.3L437 203.9L630.4 109.1Z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M157.3 509.3L218 661.2L86.5 647.4L157.3 509.3Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M803.4 647.4L671.9 661.2L732.6 509.3L803.4 647.4Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M240.5 330.3L217.9 419.4L86 412.2L240.5 330.3Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M783.3 330.3L937.7 412.2L806.1 419.4L783.3 330.3Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M218 661.2L236.9 539.4L344.4 542.9L218 661.2Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M787.1 542.9L894.6 539.4L913.5 661.2L787.1 542.9Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M511.9 431.6L544.9 350.8L588.8 500.6L511.9 431.6Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M478.9 350.8L511.9 431.6L435 500.6L478.9 350.8Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">MetaMask</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Connect to your MetaMask wallet</div>
              </div>
            </button> */}
            
            {/* WalletConnect option */}
            <button
              onClick={() => handleConnect('walletconnect')}
              className="w-full text-left p-3 rounded-md flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex-shrink-0 h-8 w-8 relative">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.58818 11.8556C13.1468 8.29694 18.8532 8.29694 22.4118 11.8556L22.8377 12.2815C23.0043 12.4481 23.0043 12.7186 22.8377 12.8852L21.1643 14.5586C21.081 14.6419 20.9458 14.6419 20.8625 14.5586L20.2807 13.9768C17.8616 11.5577 14.1384 11.5577 11.7193 13.9768L11.0978 14.5983C11.0145 14.6816 10.8793 14.6816 10.796 14.5983L9.12263 12.9249C8.95597 12.7583 8.95597 12.4878 9.12263 12.3211L9.58818 11.8556ZM25.4721 14.9159L27.0232 16.4671C27.1898 16.6337 27.1898 16.9043 27.0232 17.0709L20.1606 23.9335C19.994 24.1001 19.7234 24.1001 19.5568 23.9335L14.9421 19.3188C14.9004 19.2771 14.8328 19.2771 14.7911 19.3188L10.1764 23.9335C10.0098 24.1001 9.73924 24.1001 9.57258 23.9335L2.70764 17.0685C2.54098 16.9019 2.54098 16.6313 2.70764 16.4647L4.25876 14.9135C4.42542 14.7469 4.696 14.7469 4.86266 14.9135L9.47738 19.5283C9.51908 19.57 9.58664 19.57 9.62834 19.5283L14.243 14.9135C14.4097 14.7469 14.6803 14.7469 14.8469 14.9135L19.4617 19.5283C19.5034 19.57 19.5709 19.57 19.6126 19.5283L24.2273 14.9135C24.394 14.7469 24.6646 14.7469 24.8313 14.9135L25.4721 14.9159Z" fill="#3B99FC"/>
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">WalletConnect</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Scan with WalletConnect to connect</div>
              </div>
            </button>
          </div>
        </div>
      )}
      
      {/* MetaMask not detected warning */}
      {!hasMetaMask && selectedWallet === 'metamask' && (
        <div className="mt-3">
          <MetaMaskHelper mode="install" />
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-sm rounded-md w-full">
          <div className="flex">
            <svg className="h-5 w-5 text-red-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Connection Error</h3>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </div>
          
          {error.includes('No active wallet') && selectedWallet === 'metamask' && (
            <div className="mt-3">
              <MetaMaskHelper mode="unlock" />
            </div>
          )}
          
          {error.includes('rejected') && selectedWallet === 'metamask' && (
            <div className="mt-3">
              <MetaMaskHelper mode="connect" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletMultiButton;
