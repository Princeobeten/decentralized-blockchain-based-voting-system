# Quick Start Guide - Blockchain-Based Voting System

## 📋 Overview

This guide will help you get started with our decentralized voting platform. Follow these steps to set up the environment and run the application.

## 🚀 Getting Started

### 1. Installation (for developers)

```bash
# Clone the repository
git clone <repo-url>
cd decentralized-blockchain-based-voting-system

# Install dependencies
npm install

# Create .env.local file with your MongoDB URI and NextAuth secret
# See .env.local.example for reference

# Run the development server
npm run dev
```

### 2. Authentication Options

Our system offers two ways to authenticate:

- **Web3 Wallet Authentication** (recommended)
  - Uses MetaMask or any other Web3 wallet
  - Secure, password-less authentication
  - Cryptographically verifies your identity
  
- **Email/Password Authentication**
  - Traditional authentication for users without crypto wallets
  - Register with email and password

### 3. Quick Feature Tour

#### For Voters:
1. **Connect your wallet** or sign in with email/password
2. **Browse active elections** from your dashboard
3. **Cast your vote** in any open election
4. **View results** and verify your vote on the blockchain

#### For Admins:
1. **Create new elections** with title, description, candidates, and time frame
2. **Monitor ongoing elections** and view real-time results
3. **Access voting statistics** and verify the integrity of the process

## 🔍 Key Features

- **Secure Wallet Authentication**: Sign in with your Web3 wallet
- **Immutable Vote Records**: All votes are stored with unique transaction hashes
- **Transparent Results**: View and verify election outcomes
- **One-vote System**: Prevents multiple votes from the same user
- **Mobile Friendly**: Vote from any device

## ❓ Need Help?

- Check out the detailed [SETUP.md](SETUP.md) for more information
- Visit the [wallet demo](/wallet-demo) page to learn about Web3 authentication
- Explore the admin dashboard if you have admin privileges

---

*This application is a minimal prototype demonstrating blockchain concepts. For a production deployment, additional security measures would be implemented.*
