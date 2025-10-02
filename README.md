🗳️ Decentralized Blockchain-Based Voting System – Minimal Prototype

A minimal web-based voting system leveraging blockchain principles to ensure transparency, security, and verifiability of elections. Built with Next.js and MongoDB.

🚀 Features (MVP)

User registration & authentication (voter, admin roles)

Voter eligibility verification (simulated with credentials)

Create and manage elections/ballots

Cast votes securely (stored immutably in DB simulating blockchain ledger)

View results in real time

🛠 Tech Stack

Frontend: Next.js 14 (React), Tailwind CSS

Backend: Next.js API Routes (Node.js/Express-like)

Database: MongoDB + Mongoose (simulated blockchain ledger)

Auth: NextAuth.js (Web3 wallet and credentials providers)

Blockchain: Web3.js for wallet authentication

Deployment: Vercel

⚠️ This MVP uses MongoDB collections to simulate a permissioned blockchain ledger. Later, it can integrate with real smart contracts on a blockchain (Ethereum, Hyperledger, etc.).

📂 Project Structure
/blockchain-voting-system
│── /pages
│   ├── index.js                # Landing page
│   ├── login.js                # Voter/Admin login
│   ├── dashboard.js            # Admin dashboard
│   ├── elections.js            # List of available elections
│   ├── api/
│       ├── auth/               # Authentication endpoints
│       ├── elections/          # Create/list elections
│       ├── votes/              # Cast and count votes
│── /components
│   ├── Navbar.js
│   ├── ElectionCard.js
│   ├── VoteForm.js
│── /models
│   ├── User.js
│   ├── Election.js
│   ├── Vote.js
│── /lib
│   ├── dbConnect.js
│── /styles
│   ├── globals.css
│── .env.local
│── package.json
│── README.md

🗄️ Database Models
User
{
  name: String,
  email: String,
  passwordHash: String,
  role: "voter" | "admin",
  createdAt: Date
}

Election
{
  title: String,
  description: String,
  candidates: [String],
  startDate: Date,
  endDate: Date,
  createdBy: ObjectId (User)
}

Vote
{
  electionId: ObjectId (Election),
  voterId: ObjectId (User),
  candidate: String,
  timestamp: Date,
  transactionHash: String // simulate blockchain tx hash
}

⚙️ Installation & Setup
1️⃣ Clone Repository
git clone https://github.com/your-username/blockchain-voting-system.git
cd blockchain-voting-system

2️⃣ Install Dependencies
npm install

3️⃣ Configure Environment Variables

Create .env.local in the root directory:

MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000

4️⃣ Run Locally
npm run dev


App runs at: http://localhost:3000

📝 Usage Flows

**Admin**
- Login (email/password or wallet connection)
- Create elections (title, description, candidates, time frame)
- Monitor votes & view results in real-time
- Manage elections (edit upcoming, view active, check completed)

**Voter**
- Login (email/password or wallet connection)
- Browse available elections by status (active, upcoming, past)
- Cast secure votes (one-time per election)
- View personal voting history with transaction verification
- Verify votes in the blockchain-based ledger

🔐 Authentication Methods

1. **Web3 Wallet Authentication**
   - Connect using MetaMask or any Web3-compatible wallet
   - System generates a challenge message for the user to sign
   - Signature cryptographically verifies wallet ownership without sharing private keys
   - First-time wallet users are auto-registered as voters
   - Wallet address serves as the unique identifier

2. **Traditional Authentication**
   - Email/password authentication for users without cryptocurrency wallets
   - Secure password storage using SHA-256 hashing (would use bcrypt in production)
   - Both methods provide the same access to the platform

🧲 Security Features

- **Immutable Vote Records**: Once cast, votes cannot be altered
- **Transparent Verification**: Each vote generates a unique transaction hash
- **One-vote Policy**: System prevents users from voting multiple times in the same election
- **Cryptographic Authentication**: Wallet signatures prove user identity without password exposure
- **Role-based Access Control**: Admin/voter permissions strictly enforced

💻 Implementation Details

- **App Structure**: Modern Next.js 14 App Router architecture for optimal performance
- **Database as Blockchain**: MongoDB simulates a blockchain ledger for storing votes
- **API Routes**: RESTful endpoints for elections, votes, results, and user data
- **Responsive UI**: Mobile-friendly design using Tailwind CSS
- **TypeScript**: Type safety throughout the codebase