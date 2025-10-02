// Authentication utilities using local storage
import { User, LoginCredentials, RegisterData, WalletAuthData } from '@/types/models';
import { 
  getUserByEmail, 
  getUserByWalletAddress, 
  saveUser, 
  generateId,
  setCurrentUser,
  clearCurrentUser,
  getCurrentUser 
} from './localStorage';

// Simple password hashing (in production, use bcrypt)
const hashPassword = (password: string): string => {
  // This is a simple hash for demo purposes
  // In production, use bcrypt or similar
  return btoa(password + 'salt_key_2024');
};

const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

// Traditional email/password authentication
export const loginWithCredentials = async (credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const user = getUserByEmail(credentials.email);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    if (!verifyPassword(credentials.password, user.passwordHash)) {
      return { success: false, error: 'Invalid password' };
    }
    
    setCurrentUser(user);
    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Login failed' };
  }
};

// Register new user with email/password
export const registerWithCredentials = async (data: RegisterData): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    // Validate input
    if (data.password !== data.confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }
    
    if (data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    
    // Check if user already exists
    const existingUser = getUserByEmail(data.email);
    if (existingUser) {
      return { success: false, error: 'User already exists with this email' };
    }
    
    // Create new user
    const newUser: User = {
      id: generateId(),
      name: data.name,
      email: data.email,
      passwordHash: hashPassword(data.password),
      role: 'voter', // Default role
      createdAt: new Date().toISOString(),
      walletAddress: null,
    };
    
    saveUser(newUser);
    setCurrentUser(newUser);
    
    return { success: true, user: newUser };
  } catch (error) {
    return { success: false, error: 'Registration failed' };
  }
};

// Web3 wallet authentication (disabled)
export const generateWalletMessage = (walletAddress: string): string => {
  return `Wallet authentication is currently disabled.`;
};

export const loginWithWallet = async (authData: WalletAuthData): Promise<{ success: boolean; user?: User; error?: string }> => {
  return { success: false, error: 'Wallet authentication is currently disabled' };
};

// Logout
export const logout = (): void => {
  clearCurrentUser();
};

// Get current authenticated user
export const getAuthenticatedUser = (): User | null => {
  return getCurrentUser();
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

// Check if user is admin
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};

// Web3 wallet connection utilities (disabled)
export const connectWallet = async (): Promise<{ success: boolean; address?: string; error?: string }> => {
  return { success: false, error: 'Wallet functionality is currently disabled' };
};

export const signMessage = async (message: string): Promise<{ success: boolean; signature?: string; error?: string }> => {
  return { success: false, error: 'Wallet functionality is currently disabled' };
};

// Check wallet connection status (disabled)
export const isWalletConnected = async (): Promise<boolean> => {
  return false;
};
