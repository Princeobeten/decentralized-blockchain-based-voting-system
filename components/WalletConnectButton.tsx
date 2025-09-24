import { useState, useEffect } from 'react';
import { connectWallet, signMessage, generateNonce, isWeb3Available } from '@/lib/web3Auth';
import { signIn } from 'next-auth/react';
import MetaMaskHelper from './MetaMaskHelper';

const WalletConnectButton = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [hasWallet, setHasWallet] = useState(true); // Assume wallet exists until checked
  
  // Check if web3 wallet is available when component mounts
  useEffect(() => {
    const web3Available = isWeb3Available();
    setHasWallet(web3Available);
    
    // Enhanced debugging
    if (typeof window !== 'undefined') {
      console.log('Window ethereum status:', {
        exists: !!window.ethereum,
        isMetaMask: window.ethereum?.isMetaMask,
        selectedAddress: window.ethereum?.selectedAddress,
        chainId: window.ethereum?.chainId
      });
      
      // Add listener for account changes
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          console.log('MetaMask accounts changed:', accounts);
        });
      }
    }
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError('');
    
    try {
      console.log('Attempting to connect wallet...');
      
      // Check again if MetaMask is available
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask not available. Please install MetaMask and refresh the page.');
      }
      
      // Connect wallet and get address
      const address = await connectWallet();
      
      console.log('Successfully connected to address:', address);
      // Generate a random nonce for authentication
      const nonce = generateNonce();
      const message = `Sign this message to authenticate with our platform: ${nonce}`;
      
      // Ask user to sign the message
      const signature = await signMessage(message, address);
      
      // Sign in with NextAuth using the web3 provider
      const result = await signIn('web3', {
        address,
        signature,
        message,
        redirect: false,
      });
      
      if (result?.error) {
        setError(result.error);
      }
      
      // Redirect happens automatically if successful
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {!hasWallet ? (
        <MetaMaskHelper mode="install" className="mb-4" />
      ) : (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      )}
      
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
          
          {error.includes('No active wallet') && (
            <div className="mt-3">
              <MetaMaskHelper mode="unlock" />
            </div>
          )}
          {error.includes('rejected') && (
            <div className="mt-3">
              <MetaMaskHelper mode="connect" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnectButton;
