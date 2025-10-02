# Setting Up the Decentralized Blockchain-Based Voting System

This document provides detailed instructions for setting up and running the voting system locally.

## Prerequisites

- Node.js 18+ (recommended: Node.js 20)
- npm 9+ or yarn
- MongoDB (local instance or MongoDB Atlas account)
- Web3 wallet (MetaMask or similar) for wallet authentication testing

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd decentralized-blockchain-based-voting-system
```

## Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in the root directory
2. Copy the content from `.env.local.example` and fill in your values:

```bash
# Database Configuration
MONGODB_URI=your_mongodb_connection_string

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret_key  # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
```

### MongoDB Setup Options

#### Option 1: MongoDB Atlas (Recommended for beginners)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Whitelist your IP address
5. Get your connection string and replace `username`, `password`, and `clustername` with your details:
   ```
   mongodb+srv://username:password@clustername.mongodb.net/blockchain-voting?retryWrites=true&w=majority
   ```

#### Option 2: Local MongoDB Instance

1. [Install MongoDB Community Edition](https://www.mongodb.com/docs/manual/installation/)
2. Start the MongoDB service
3. Use the connection string:
   ```
   mongodb://localhost:27017/blockchain-voting
   ```

## Step 4: Start the Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:3000

## Step 5: Initial Setup

### Admin Account Setup

The first time you run the application, you'll need to create an admin account:

1. Navigate to `/register` and create a regular account
2. Connect to your MongoDB database and manually update the user's role:

```js
// Using MongoDB Compass or MongoDB Atlas UI:
// Find the user in the users collection and update:
{ $set: { role: "admin" } }

// Or using the MongoDB Shell:
use blockchain-voting
db.users.updateOne(
  { email: "your-admin-email@example.com" }, 
  { $set: { role: "admin" } }
)
```

### Testing Wallet Authentication

1. Install MetaMask browser extension if you don't have it
2. Create or import a wallet in MetaMask
3. Ensure MetaMask is connected to the appropriate network (any network works for testing)
4. Navigate to the login page and click "Connect Wallet"
5. Follow the MetaMask prompts to connect and sign the verification message

## Step 6: Create Your First Election

1. Login as an admin
2. Navigate to the Admin Dashboard
3. Click "Create Election"
4. Fill in the election details:
   - Title and description
   - Start and end dates/times
   - Add at least two candidates
5. Submit the form
6. Your election is now created and will appear in the elections list when active

## Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**
   - Verify your connection string is correct
   - Check if IP whitelist is properly configured (for MongoDB Atlas)
   - Ensure your MongoDB user has the correct permissions

2. **NextAuth Configuration Problems**
   - Make sure `NEXTAUTH_SECRET` is properly set
   - Check that `NEXTAUTH_URL` matches your actual URL

3. **Web3 Wallet Connection Issues**
   - Clear your browser cache and MetaMask connection history
   - Try refreshing the page
   - Ensure your browser allows MetaMask popups

### Getting Help

If you encounter any other issues, please create an issue in the GitHub repository with:
- Description of the problem
- Error messages (if any)
- Steps to reproduce
- Environment details (OS, browser, Node.js version)
