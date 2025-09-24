'use client';

import Link from 'next/link';
import WalletIcon from '../public/icons/WalletIcon';
import { useSDK, MetaMaskProvider } from '@metamask/sdk-react';
import { formatAddress } from '../lib/utils';

// We need to create our own button component since we're not using ShadcnUI
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }> = ({ 
  children, 
  className = '',
  ...props 
}) => (
  <button
    className={`flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md text-white font-medium shadow-sm transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Popover components since we're not using ShadcnUI
const Popover: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative">
    {children}
  </div>
);

const PopoverTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => children;

const PopoverContent: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`absolute mt-2 w-44 bg-gray-100 border rounded-md shadow-lg right-0 z-10 top-10 ${className}`}>
    {children}
  </div>
);

export const ConnectWalletButton = () => {
  const { sdk, connected, connecting, account } = useSDK();
  
  const connect = async () => {
    try {
      await sdk?.connect();
    } catch (err) {
      console.warn(`No accounts found`, err);
    }
  };
  
  const disconnect = () => {
    if (sdk) {
      sdk.terminate();
    }
  };
  
  return (
    <div className="relative">
      {connected ? (
        <Popover>
          <PopoverTrigger>
            <Button>{formatAddress(account)}</Button>
          </PopoverTrigger>
          <PopoverContent>
            <div 
              className="p-2 hover:bg-gray-200 cursor-pointer"
              onClick={disconnect}
            >
              Disconnect
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <Button disabled={connecting} onClick={connect}>
          <WalletIcon className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      )}
    </div>
  );
};

export const MetaMaskNavBar = () => {
  const host = typeof window !== 'undefined' ? window.location.host : 'defaultHost';
  
  const sdkOptions = {
    logging: { developerMode: false },
    checkInstallationImmediately: false,
    dappMetadata: {
      name: 'BlockVote',
      url: host,
    },
  };
  
  return (
    <nav className="flex items-center justify-between max-w-screen-xl px-6 mx-auto py-7 rounded-xl">
      <Link href="/" className="flex gap-1 px-6">
        <span className="hidden text-2xl font-bold sm:block">
          <span className="text-gray-900">BlockVote</span>
        </span>
      </Link>
      <div className="flex gap-4 px-6">
        <MetaMaskProvider debug={false} sdkOptions={sdkOptions}>
          <ConnectWalletButton />
        </MetaMaskProvider>
      </div>
    </nav>
  );
};

export default MetaMaskNavBar;
