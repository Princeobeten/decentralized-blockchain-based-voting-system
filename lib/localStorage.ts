// Local Storage utilities for the voting system
import { User, Election, Vote } from '@/types/models';

// Storage keys
const STORAGE_KEYS = {
  USERS: 'voting_system_users',
  ELECTIONS: 'voting_system_elections',
  VOTES: 'voting_system_votes',
  CURRENT_USER: 'voting_system_current_user',
} as const;

// Generic storage functions
export const getFromStorage = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from localStorage key ${key}:`, error);
    return [];
  }
};

export const saveToStorage = <T>(key: string, data: T[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage key ${key}:`, error);
  }
};

// User management
export const getUsers = (): User[] => {
  return getFromStorage<User>(STORAGE_KEYS.USERS);
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  saveToStorage(STORAGE_KEYS.USERS, users);
};

export const getUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users.find(u => u.email === email) || null;
};

export const getUserByWalletAddress = (walletAddress: string): User | null => {
  const users = getUsers();
  return users.find(u => u.walletAddress === walletAddress) || null;
};

export const getUserById = (id: string): User | null => {
  const users = getUsers();
  return users.find(u => u.id === id) || null;
};

// Election management
export const getElections = (): Election[] => {
  return getFromStorage<Election>(STORAGE_KEYS.ELECTIONS);
};

export const saveElection = (election: Election): void => {
  const elections = getElections();
  const existingIndex = elections.findIndex(e => e.id === election.id);
  
  if (existingIndex >= 0) {
    elections[existingIndex] = election;
  } else {
    elections.push(election);
  }
  
  saveToStorage(STORAGE_KEYS.ELECTIONS, elections);
};

export const getElectionById = (id: string): Election | null => {
  const elections = getElections();
  return elections.find(e => e.id === id) || null;
};

export const deleteElection = (id: string): void => {
  const elections = getElections();
  const filtered = elections.filter(e => e.id !== id);
  saveToStorage(STORAGE_KEYS.ELECTIONS, filtered);
};

// Vote management
export const getVotes = (): Vote[] => {
  return getFromStorage<Vote>(STORAGE_KEYS.VOTES);
};

export const saveVote = (vote: Vote): void => {
  const votes = getVotes();
  votes.push(vote);
  saveToStorage(STORAGE_KEYS.VOTES, votes);
};

export const getVotesByElection = (electionId: string): Vote[] => {
  const votes = getVotes();
  return votes.filter(v => v.electionId === electionId);
};

export const getVotesByUser = (userId: string): Vote[] => {
  const votes = getVotes();
  return votes.filter(v => v.voterId === userId);
};

export const hasUserVoted = (userId: string, electionId: string): boolean => {
  const votes = getVotes();
  return votes.some(v => v.voterId === userId && v.electionId === electionId);
};

// Current user session management
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error reading current user from localStorage:', error);
    return null;
  }
};

export const setCurrentUser = (user: User | null): void => {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  } catch (error) {
    console.error('Error saving current user to localStorage:', error);
  }
};

export const clearCurrentUser = (): void => {
  setCurrentUser(null);
};

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const generateTransactionHash = (): string => {
  // Simulate blockchain transaction hash
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

// Hash password using the same method as in auth.ts
const hashPassword = (password: string): string => {
  return btoa(password + 'salt_key_2024');
};

// Initialize default admin user if none exists
export const initializeDefaultAdmin = (): void => {
  const users = getUsers();
  
  // Check if admin exists with correct password hash
  const existingAdmin = users.find(u => u.role === 'admin' && u.email === 'admin@blockvote.com');
  
  if (!existingAdmin) {
    const defaultAdmin: User = {
      id: generateId(),
      name: 'System Administrator',
      email: 'admin@blockvote.com',
      passwordHash: hashPassword('admin123'), // Properly hashed password
      role: 'admin',
      createdAt: new Date().toISOString(),
      walletAddress: null,
    };
    
    saveUser(defaultAdmin);
    console.log('Default admin user created: admin@blockvote.com / admin123');
  } else {
    // Check if existing admin has unhashed password and fix it
    if (existingAdmin.passwordHash === 'admin123') {
      existingAdmin.passwordHash = hashPassword('admin123');
      saveUser(existingAdmin);
      console.log('Admin password hash updated');
    }
  }
};

// Reset admin user (for fixing password hash issues)
export const resetAdminUser = (): void => {
  const users = getUsers();
  const filteredUsers = users.filter(u => !(u.role === 'admin' && u.email === 'admin@blockvote.com'));
  saveToStorage(STORAGE_KEYS.USERS, filteredUsers);
  
  const defaultAdmin: User = {
    id: generateId(),
    name: 'System Administrator',
    email: 'admin@blockvote.com',
    passwordHash: hashPassword('admin123'),
    role: 'admin',
    createdAt: new Date().toISOString(),
    walletAddress: null,
  };
  
  saveUser(defaultAdmin);
  console.log('Admin user reset with proper password hash');
};

// Clear all data (for development/testing)
export const clearAllData = (): void => {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('All voting system data cleared');
};
