'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { isWeb3Available, connectWallet, signMessage } from '@/lib/web3Auth';
import MetaMaskHelper from '@/components/MetaMaskHelper';
import WalletMultiButton from '@/components/WalletMultiButton';

export default function WalletDemoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [nonce, setNonce] = useState<string | null>(null);
  const [signatureMessage, setSignatureMessage] = useState<string | null>(null);
  const [web3Available, setWeb3Available] = useState(false);
  const [step, setStep] = useState(1);
  
  useEffect(() => {
    setWeb3Available(isWeb3Available());
    
    // Generate a random nonce
    const randomNonce = Math.floor(Math.random() * 1000000).toString();
    setNonce(randomNonce);
    setSignatureMessage(`I am signing this message to authenticate with BlockVote: ${randomNonce}`);
  }, []);
  
  const handleConnect = async () => {
    if (!web3Available) {
      setConnectionError('No Web3 provider detected. Please install MetaMask or a similar wallet.');
      return;
    }
    
    setIsConnecting(true);
    setConnectionError('');
    
    try {
      const walletAddress = await connectWallet();
      setAddress(walletAddress);
      setStep(2);
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      // Provide more user-friendly error messages
      if (err.message?.includes('No active wallet')) {
        setConnectionError('MetaMask is locked. Please unlock your wallet and try again.');
      } else if (err.message?.includes('rejected')) { 
        setConnectionError('Connection request rejected. Please approve the connection in MetaMask.');
      } else if (err.message?.includes('pending')) {
        setConnectionError('A connection request is already pending. Please check your MetaMask extension.');
      } else {
        setConnectionError(err.message || 'Failed to connect wallet. Please check your browser console for details.');
      }
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleSign = async () => {
    if (!address || !signatureMessage) return;
    
    setIsConnecting(true);
    setConnectionError('');
    
    try {
      const sig = await signMessage(signatureMessage, address);
      setSignature(sig);
      setStep(3);
    } catch (err: any) {
      console.error('Signature error:', err);
      
      // Provide more user-friendly error messages
      if (err.message?.includes('denied')) {
        setConnectionError('Signature request denied. You need to approve the signature request in your wallet.');
      } else if (err.message?.includes('pending')) {
        setConnectionError('A signature request is already pending. Please check your MetaMask extension.');
      } else if (err.message?.includes('User rejected')) {
        setConnectionError('You rejected the signature request. Signing the message is required for authentication.');
      } else {
        setConnectionError(err.message || 'Failed to sign message. Please check your browser console for details.');
      }
    } finally {
      setIsConnecting(false);
    }
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
        
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden max-w-3xl mx-auto">
          <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Web3 Wallet Authentication Demo</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              This interactive demo explains how blockchain wallet-based authentication works in our voting system.
            </p>
            
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
              <div className="flex">
                <svg className="h-6 w-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Wallet Authentication Temporarily Disabled</h3>
                  <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-200">
                    This demo is currently in read-only mode as wallet authentication features are temporarily disabled for maintenance. You can still explore how the feature works, but actual wallet connections will not function at this time.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-6">
            {!web3Available ? (
              <MetaMaskHelper mode="install" className="mb-6" />
            ) : (
              <div className="space-y-8">
                {/* Step 1: Connect Wallet */}
                <div className={`bg-${step === 1 ? 'blue-50 dark:bg-blue-900/20' : 'gray-50 dark:bg-gray-800'} rounded-lg p-5 border ${step === 1 ? 'border-blue-200 dark:border-blue-800' : 'border-gray-200 dark:border-gray-700'}`}>
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full ${step === 1 ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-200 dark:bg-gray-700'} text-${step === 1 ? 'blue-600 dark:text-blue-300' : 'gray-500 dark:text-gray-400'}`}>
                      <span className="text-sm font-medium">1</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Connect Your Wallet</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        First, we need to connect to your Ethereum wallet to get your public address.
                        This is like finding out who you are, without asking for your password.
                      </p>
                      
                      {step === 1 && (
                        <div className="mt-4">
                          {connectionError && (
                            <div className="mb-4">
                              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
                                <div className="flex">
                                  <svg className="h-5 w-5 text-red-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                  <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Connection Error</h3>
                                    <p className="text-sm text-red-700 dark:text-red-200">{connectionError}</p>
                                  </div>
                                </div>
                              </div>
                              
                              {connectionError.includes('locked') && (
                                <div className="mt-3">
                                  <MetaMaskHelper mode="unlock" />
                                </div>
                              )}
                              
                              {connectionError.includes('rejected') && (
                                <div className="mt-3">
                                  <MetaMaskHelper mode="connect" />
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="mb-4">
                            <WalletMultiButton />
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            For this demo, after connecting with the button above, click the button below to proceed with the step-by-step demonstration.
                          </p>
                          
                          <button
                            onClick={handleConnect}
                            disabled={isConnecting}
                            className="mt-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                          >
                            {isConnecting ? 'Connecting...' : 'Continue with Demo'}
                          </button>
                        </div>
                      )}
                      
                      {address && (
                        <div className="mt-4 bg-white dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your wallet address:</p>
                          <p className="font-mono text-sm text-gray-800 dark:text-gray-200 break-all">
                            {address}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Step 2: Sign Message */}
                <div className={`bg-${step === 2 ? 'blue-50 dark:bg-blue-900/20' : step > 2 ? 'gray-50 dark:bg-gray-800' : 'gray-50/50 dark:bg-gray-800/50'} rounded-lg p-5 border ${step === 2 ? 'border-blue-200 dark:border-blue-800' : 'border-gray-200 dark:border-gray-700'} ${step < 2 && 'opacity-50'}`}>
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full ${step === 2 ? 'bg-blue-100 dark:bg-blue-800' : step > 2 ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-200 dark:bg-gray-700'} text-${step === 2 ? 'blue-600 dark:text-blue-300' : step > 2 ? 'gray-500 dark:text-gray-400' : 'gray-400 dark:text-gray-500'}`}>
                      <span className="text-sm font-medium">2</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sign Authentication Message</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Next, we'll ask you to sign a message proving you control this wallet.
                        This is like showing your ID without revealing your private key.
                      </p>
                      
                      {step === 2 && (
                        <div className="mt-4">
                          {connectionError && (
                            <div className="mb-4">
                              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
                                <div className="flex">
                                  <svg className="h-5 w-5 text-red-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                  <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Signature Error</h3>
                                    <p className="text-sm text-red-700 dark:text-red-200">{connectionError}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm rounded-md">
                                <div className="flex items-start">
                                  <svg className="h-5 w-5 text-blue-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                  <div className="ml-3">
                                    <h3 className="text-sm font-medium">Safe Signing Information</h3>
                                    <p className="mt-1 text-xs">Signing a message is completely safe and doesn't give any spending permissions to your wallet. It's only used to verify that you are the owner of this address.</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {signatureMessage && (
                            <div className="mb-4 bg-white dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Message to sign:</p>
                              <p className="text-sm text-gray-800 dark:text-gray-200">{signatureMessage}</p>
                            </div>
                          )}
                          
                          <button
                            onClick={handleSign}
                            disabled={isConnecting}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                          >
                            {isConnecting ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing...
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Sign Message
                              </span>
                            )}
                          </button>
                        </div>
                      )}
                      
                      {signature && step > 2 && (
                        <div className="mt-4 bg-white dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your signature:</p>
                          <p className="font-mono text-xs text-gray-800 dark:text-gray-200 break-all">
                            {signature.substring(0, 60)}...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Step 3: Authentication Complete */}
                <div className={`bg-${step === 3 ? 'blue-50 dark:bg-blue-900/20' : 'gray-50/50 dark:bg-gray-800/50'} rounded-lg p-5 border ${step === 3 ? 'border-blue-200 dark:border-blue-800' : 'border-gray-200 dark:border-gray-700'} ${step < 3 && 'opacity-50'}`}>
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full ${step === 3 ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-200 dark:bg-gray-700'} text-${step === 3 ? 'blue-600 dark:text-blue-300' : 'gray-400 dark:text-gray-500'}`}>
                      <span className="text-sm font-medium">3</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Authentication Complete</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Authentication completed successfully! In the actual login flow, the system would:
                      </p>
                      
                      {step === 3 && (
                        <div className="mt-4">
                          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <li>Verify your signature on the server-side</li>
                            <li>Create or find your user account based on your wallet address</li>
                            <li>Issue a session token for secure access to the voting platform</li>
                            <li>Redirect you to the dashboard</li>
                          </ol>
                          
                          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                            <div className="flex">
                              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                                  Benefits of Web3 Authentication
                                </h3>
                                <ul className="mt-2 text-sm text-green-700 dark:text-green-200 list-disc list-inside">
                                  <li>No passwords to remember or store</li>
                                  <li>Cryptographically secure proof of identity</li>
                                  <li>Same technology that secures blockchain transactions</li>
                                  <li>Protects user privacy and prevents data breaches</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-6 text-center">
                            <Link
                              href="/login"
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                            >
                              Go to Login Page
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Technical Explanation */}
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">How It Works: Technical Explanation</h2>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 text-sm text-gray-700 dark:text-gray-300 space-y-4">
                    <p>
                      <strong>1. Connect Wallet:</strong> When you click "Connect Wallet", you can choose between:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        <strong>MetaMask:</strong> We use the 
                        <code className="font-mono text-xs bg-gray-200 dark:bg-gray-800 p-1 rounded">ethereum.request()</code> 
                        method from your browser extension to request access to your wallet addresses.
                      </li>
                      <li>
                        <strong>WalletConnect:</strong> We generate a QR code that you can scan with any WalletConnect-compatible 
                        mobile wallet app. This establishes a secure connection between your mobile wallet and our application.
                      </li>
                    </ul>
                    
                    <p>
                      <strong>2. Sign Message:</strong> For authentication, we create a unique challenge message containing a 
                      random nonce (number used once). You sign this with your wallet's private key using 
                      <code className="font-mono text-xs bg-gray-200 dark:bg-gray-800 p-1 rounded">personal_sign</code> method.
                    </p>
                    
                    <p>
                      <strong>3. Verify Signature:</strong> On the server, we can verify that the signature was created by the owner 
                      of the wallet address. This is done using cryptographic methods that prove the signature 
                      matches both the message and the public address.
                    </p>
                    
                    <p>
                      <strong>4. Authentication:</strong> If verification succeeds, we create or find a user account associated with 
                      the wallet address and generate a secure session token. This allows you to access protected 
                      routes without needing to reconnect your wallet for every request.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
