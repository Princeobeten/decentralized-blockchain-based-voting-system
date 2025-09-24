import EthereumProvider from '@walletconnect/ethereum-provider';
import { Web3Modal } from '@web3modal/standalone';

// WalletConnect v2 requires a project ID
// Get one for free at https://cloud.walletconnect.com/sign-in
const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// Check if project ID is properly configured
if (!PROJECT_ID || PROJECT_ID === 'your_walletconnect_project_id') {
  console.error('WalletConnect Project ID is not configured. Please add your Project ID to .env.local');
}

// Ensure we have a value for PROJECT_ID (even if invalid, to avoid type errors)
const SAFE_PROJECT_ID = PROJECT_ID || 'missing-project-id';

// Initialize the Web3Modal (for WalletConnect)
let web3Modal: Web3Modal | null = null;
let provider: EthereumProvider | null = null;

if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    projectId: SAFE_PROJECT_ID,
    standaloneChains: ['eip155:1'],
    walletConnectVersion: 2,
  });
}

/**
 * Initialize WalletConnect provider
 */
/**
 * Maximum number of retry attempts for WebSocket connections
 */
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Initialize WalletConnect provider with retry logic
 */
export const initWalletConnectProvider = async () => {
  try {
    // Check for missing project ID before initializing
    if (!PROJECT_ID || PROJECT_ID === 'your_walletconnect_project_id') {
      throw new Error('WalletConnect Project ID is not configured. Please set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in your .env.local file.');
    }
    
    // Use retry logic for provider initialization
    let attempt = 0;
    let lastError;
    
    while (attempt < MAX_RETRY_ATTEMPTS) {
      try {
        console.log(`WalletConnect initialization attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS}`);
        
        provider = await EthereumProvider.init({
          projectId: SAFE_PROJECT_ID,
          chains: [1], // Ethereum Mainnet
          optionalChains: [5, 11155111, 137, 80001], // Goerli, Sepolia, Polygon, Mumbai
          showQrModal: true,
          methods: ['eth_sendTransaction', 'personal_sign'],
          events: ['chainChanged', 'accountsChanged'],
          // Add network configuration to help with connection issues
          relayUrl: 'wss://relay.walletconnect.org',
          metadata: {
            name: 'BlockVote',
            description: 'Decentralized blockchain-based voting system',
            url: window.location.origin,
            icons: ['https://walletconnect.com/walletconnect-logo.png']
          }
        });
        
        // If we reach here, initialization was successful
        console.log('WalletConnect provider initialized successfully');
        return provider;
      } catch (error) {
        lastError = error;
        console.error(`WalletConnect initialization attempt ${attempt + 1} failed:`, error);
        attempt++;
        
        // Wait before retrying (exponential backoff: 1s, 2s, 4s...)
        if (attempt < MAX_RETRY_ATTEMPTS) {
          const backoffTime = Math.pow(2, attempt - 1) * 1000;
          console.log(`Retrying in ${backoffTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
      }
    }
    
    // If we've exhausted all attempts, throw the last error
    throw lastError || new Error('Failed to initialize WalletConnect provider after multiple attempts');
    

    return provider;
  } catch (error) {
    console.error('Error initializing WalletConnect provider:', error);
    throw error;
  }
};

/**
 * Connect to wallet using WalletConnect
 * @returns Connected wallet address
 */
export const connectWithWalletConnect = async (): Promise<string> => {
  try {
    // Initialize provider if not available
    if (!provider) {
      provider = await initWalletConnectProvider();
    }

    // Safety check after initialization
    if (!provider) {
      throw new Error('Failed to initialize WalletConnect provider');
    }

    // Enable session (triggers QR Code modal)
    await provider.enable();

    // Check if accounts are available
    const accounts = provider.accounts;
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found after connecting with WalletConnect');
    }

    return accounts[0];
  } catch (error) {
    console.error('WalletConnect connection error:', error);
    throw new Error(`Failed to connect with WalletConnect: ${(error as Error).message}`);
  }
};

/**
 * Sign a message using WalletConnect
 * @param message Message to sign
 * @param address Wallet address
 * @returns Signature
 */
export const signMessageWithWalletConnect = async (message: string, address: string): Promise<string> => {
  try {
    // Make sure provider is initialized
    if (!provider) {
      // Try to initialize provider if not already done
      try {
        await initWalletConnectProvider();
      } catch (initError) {
        throw new Error('WalletConnect provider not initialized. Please connect first.');
      }
    }

    // Double-check that provider is available after potential initialization
    if (!provider) {
      throw new Error('WalletConnect provider not available. Please refresh and try again.');
    }

    const signature = await provider.request({
      method: 'personal_sign',
      params: [message, address, ''],
    });

    return signature as string;
  } catch (error) {
    console.error('WalletConnect signature error:', error);
    throw new Error(`Failed to sign message with WalletConnect: ${(error as Error).message}`);
  }
};

/**
 * Disconnect WalletConnect session
 */
export const disconnectWalletConnect = async (): Promise<void> => {
  try {
    if (provider) {
      await provider.disconnect();
      provider = null;
    }
  } catch (error) {
    console.error('Error disconnecting WalletConnect:', error);
    // Reset provider even if disconnect fails
    provider = null;
  }
};

/**
 * Get the current WalletConnect provider instance
 * @returns The current provider or null if not initialized
 */
export const getWalletConnectProvider = () => provider;

export default {
  initWalletConnectProvider,
  connectWithWalletConnect,
  signMessageWithWalletConnect,
  disconnectWalletConnect,
  getWalletConnectProvider,
};
