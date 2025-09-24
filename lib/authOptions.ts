import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifySignature } from '@/lib/web3Auth';
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import type { Adapter } from 'next-auth/adapters';
import crypto from 'crypto';

interface Credentials {
  email?: string;
  password?: string;
  address?: string;
  signature?: string;
  message?: string;
}

// Define and export the NextAuth configuration
export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as Adapter,
  providers: [
    // Traditional email/password provider
    CredentialsProvider({
      id: "credentials",
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }
        
        await dbConnect();
        
        // Find user by email
        const user = await User.findOne({ email: credentials.email });
        
        if (!user) {
          throw new Error('No user found with this email');
        }
        
        // Hash the provided password using the same method as in registration
        const hashedPassword = crypto
          .createHash('sha256')
          .update(credentials.password)
          .digest('hex');
        
        // Compare the hashed password with the stored hash
        const validPassword = hashedPassword === user.passwordHash;
        
        if (!validPassword) {
          throw new Error('Invalid password');
        }
        
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role
        };
      }
    }),
    // Web3 wallet authentication provider
    CredentialsProvider({
      id: "web3",
      name: 'Web3',
      credentials: {
        address: { label: "Wallet Address", type: "text" },
        signature: { label: "Signature", type: "text" },
        message: { label: "Message", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.address || !credentials?.signature || !credentials?.message) {
          throw new Error('Wallet address, signature, and message are required');
        }
        
        await dbConnect();
        
        const { address, signature, message } = credentials;
        
        // Verify the signature
        const isValid = verifySignature(message, signature, address);
        
        if (!isValid) {
          throw new Error('Invalid signature');
        }
        
        // Find or create user with this wallet address
        let user = await User.findOne({ walletAddress: address });
        
        if (!user) {
          // Create new user with wallet
          user = await User.create({
            name: `Voter ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
            walletAddress: address,
            role: 'voter'
          });
        }
        
        return {
          id: user._id.toString(),
          name: user.name,
          walletAddress: user.walletAddress,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.walletAddress = user.walletAddress;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.walletAddress = token.walletAddress;
      return session;
    }
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login', 
  },
  secret: process.env.NEXTAUTH_SECRET,
};
