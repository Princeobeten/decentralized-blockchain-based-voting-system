// TypeScript interfaces for the voting system models

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'voter' | 'admin';
  createdAt: string;
  walletAddress?: string | null;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  candidates: string[];
  startDate: string;
  endDate: string;
  createdBy: string; // User ID
  createdAt: string;
  status?: 'upcoming' | 'active' | 'completed';
}

export interface Vote {
  id: string;
  electionId: string;
  voterId: string;
  candidate: string;
  timestamp: string;
  transactionHash: string; // Simulated blockchain transaction hash
}

export interface VoteResult {
  candidate: string;
  votes: number;
  percentage: number;
}

export interface ElectionResults {
  electionId: string;
  totalVotes: number;
  results: VoteResult[];
  lastUpdated: string;
}

// Authentication related types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface WalletAuthData {
  walletAddress: string;
  signature: string;
  message: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Election status helper
export const getElectionStatus = (election: Election): 'upcoming' | 'active' | 'completed' => {
  const now = new Date();
  const startDate = new Date(election.startDate);
  const endDate = new Date(election.endDate);
  
  if (now < startDate) return 'upcoming';
  if (now > endDate) return 'completed';
  return 'active';
};

// Vote validation
export const isValidVote = (vote: Partial<Vote>): vote is Vote => {
  return !!(
    vote.id &&
    vote.electionId &&
    vote.voterId &&
    vote.candidate &&
    vote.timestamp &&
    vote.transactionHash
  );
};

// Election validation
export const isValidElection = (election: Partial<Election>): election is Election => {
  return !!(
    election.id &&
    election.title &&
    election.description &&
    election.candidates &&
    election.candidates.length > 0 &&
    election.startDate &&
    election.endDate &&
    election.createdBy &&
    election.createdAt
  );
};

// User validation
export const isValidUser = (user: Partial<User>): user is User => {
  return !!(
    user.id &&
    user.name &&
    user.email &&
    user.passwordHash &&
    user.role &&
    user.createdAt
  );
};
