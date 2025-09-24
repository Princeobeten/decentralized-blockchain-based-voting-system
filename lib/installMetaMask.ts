/**
 * Helper functions for MetaMask installation and detection
 */

/**
 * Detects if MetaMask is installed
 * @returns boolean indicating if MetaMask is available
 */
export const isMetaMaskInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.ethereum?.isMetaMask || false;
};

/**
 * Opens MetaMask installation page
 */
export const installMetaMask = (): void => {
  window.open('https://metamask.io/download/', '_blank');
};

/**
 * Detects if MetaMask is unlocked and has accounts accessible
 * @returns Promise resolving to boolean
 */
export const isMetaMaskUnlocked = async (): Promise<boolean> => {
  if (!isMetaMaskInstalled()) return false;
  
  try {
    const accounts = await window.ethereum!.request({ 
      method: 'eth_accounts',
      params: [] 
    });
    return accounts && accounts.length > 0;
  } catch (err) {
    console.error('Error checking if MetaMask is unlocked:', err);
    return false;
  }
};

/**
 * Gets info about current MetaMask connection state
 * @returns Object with MetaMask state info
 */
export const getMetaMaskState = async () => {
  if (!isMetaMaskInstalled()) {
    return {
      installed: false,
      unlocked: false,
      accounts: [],
      selectedAccount: null,
      chainId: null,
      networkName: null
    };
  }
  
  try {
    const accounts = await window.ethereum!.request({ method: 'eth_accounts' });
    const chainId = await window.ethereum!.request({ method: 'eth_chainId' });
    
    // Map chainId to network name
    const networkMap: Record<string, string> = {
      '0x1': 'Ethereum Mainnet',
      '0x5': 'Goerli Testnet',
      '0xaa36a7': 'Sepolia Testnet',
      '0x89': 'Polygon Mainnet',
      '0x13881': 'Mumbai Testnet',
      // Add more as needed
    };
    
    return {
      installed: true,
      unlocked: accounts && accounts.length > 0,
      accounts: accounts || [],
      selectedAccount: accounts && accounts.length > 0 ? accounts[0] : null,
      chainId,
      networkName: networkMap[chainId as string] || `Unknown (${chainId})`
    };
  } catch (err) {
    console.error('Error getting MetaMask state:', err);
    return {
      installed: true,
      unlocked: false,
      accounts: [],
      selectedAccount: null,
      chainId: null,
      networkName: null,
      error: err
    };
  }
};

export default {
  isMetaMaskInstalled,
  installMetaMask,
  isMetaMaskUnlocked,
  getMetaMaskState
};
