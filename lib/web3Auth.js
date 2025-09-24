import Web3 from 'web3';
import { ethers } from 'ethers';
import { toUtf8Bytes, hexlify } from 'ethers';

// Initialize Web3 if window is available (client-side)
let web3;
let ethereum;

// Define common network chain IDs
const CHAIN_IDS = {
  ETH_MAINNET: '0x1',
  GOERLI: '0x5',
  SEPOLIA: '0xaa36a7',
  POLYGON: '0x89',
  MUMBAI: '0x13881',
  // Add more as needed
};

if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
  ethereum = window.ethereum;
  web3 = new Web3(ethereum);
}

/**
 * Connect to user's wallet (MetaMask or other Web3 provider)
 * @returns {Promise<string>} - The connected wallet address
 */
export const connectWallet = async () => {
  // Explicit check for ethereum object
  if (!ethereum) {
    if (typeof window !== 'undefined' && window.ethereum) {
      // Edge case: ethereum exists on window but wasn't captured in the module scope
      ethereum = window.ethereum;
      web3 = new Web3(ethereum);
    } else {
      throw new Error('No Web3 provider detected. Please install MetaMask or a similar wallet.');
    }
  }

  try {
    // Try to detect if there's a cached provider connection
    if (typeof localStorage !== 'undefined') {
      const cachedProvider = localStorage.getItem('walletProvider');
      console.log('Cached wallet provider:', cachedProvider);
    }

    // First check network connection
    let chainId;
    try {
      // Get current chain ID
      chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log('Connected to chain ID:', chainId);
    } catch (chainError) {
      console.warn('Unable to detect chain ID:', chainError);
      // Continue anyway as this is just informational
    }
    
    // Check if MetaMask is already unlocked by getting existing accounts
    const existingAccounts = await ethereum.request({
      method: 'eth_accounts',
      params: [] // Explicit empty params
    }).catch(error => {
      console.warn('Error checking existing accounts:', error);
      return [];
    });
    
    console.log('Existing accounts:', existingAccounts);
    
    if (existingAccounts && existingAccounts.length > 0) {
      // User already has MetaMask connected and unlocked
      console.log('MetaMask already connected with account:', existingAccounts[0]);
      return existingAccounts[0];
    }
    
    console.log('No existing connection, requesting access...');
    
    // Sometimes MetaMask needs a small delay before requesting accounts
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Try multiple approaches to request accounts
    let requestedAccounts;
    
    try {
      // First attempt - standard approach
      requestedAccounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });
    } catch (initialError) {
      console.warn('Initial eth_requestAccounts failed:', initialError);
      
      // Second attempt with explicit params
      try {
        requestedAccounts = await ethereum.request({
          method: 'eth_requestAccounts',
          params: []
        });
      } catch (retryError) {
        console.error('Retry eth_requestAccounts failed:', retryError);
        throw retryError; // Re-throw to be caught by outer catch
      }
    }
    
    if (!requestedAccounts || requestedAccounts.length === 0) {
      throw new Error('No accounts found. Please unlock your wallet and try again.');
    }
    
    // Get the selected account
    const selectedAccount = requestedAccounts[0];
    console.log('Connected wallet address:', selectedAccount);
    
    // Cache the wallet provider selection
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('walletProvider', 'metamask');
      localStorage.setItem('lastConnected', Date.now().toString());
    }
    
    return selectedAccount; // Return the first connected address
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    
    // More specific error messages based on the error code
    if (error.code === 4001) {
      throw new Error('Connection rejected. You denied the connection request.');
    } else if (error.code === -32002) {
      throw new Error('Request already pending. Please check your wallet extension.');
    } else if (error.code === -32603) {
      throw new Error('No active wallet found. Please make sure MetaMask is unlocked and try again.');
    } else {
      throw new Error(`Failed to connect to wallet: ${error.message || 'Unknown error'}`);
    }
  }
};

/**
 * Sign a message to verify wallet ownership
 * @param {string} message - Message to sign
 * @param {string} address - Wallet address to sign with
 * @returns {Promise<string>} - Signature
 */
export const signMessage = async (message, address) => {
  if (!ethereum) {
    throw new Error('No Web3 provider detected. Please install MetaMask or a similar wallet.');
  }

  try {
    const signature = await ethereum.request({
      method: 'personal_sign',
      params: [hexlify(toUtf8Bytes(message)), address, ''],
    });
    return signature;
  } catch (error) {
    console.error('Error signing message:', error);
    throw new Error('Failed to sign message. User may have denied signature request.');
  }
};

/**
 * Verify a signature
 * @param {string} message - Original message that was signed
 * @param {string} signature - The signature to verify
 * @param {string} address - The wallet address that supposedly signed the message
 * @returns {boolean} - Whether the signature is valid
 */
export const verifySignature = (message, signature, address) => {
  try {
    // In ethers v6, we use the Signature class and verifyMessage
    const signerAddress = ethers.verifyMessage(message, signature);
    return signerAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
};

/**
 * Generate a nonce for authentication
 * @returns {string} - Random nonce
 */
export const generateNonce = () => {
  return Math.floor(Math.random() * 1000000).toString();
};

export const isWeb3Available = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

export default {
  connectWallet,
  signMessage,
  verifySignature,
  generateNonce,
  isWeb3Available,
};