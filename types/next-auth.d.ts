import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * Extending the built-in session types
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string | null;
      walletAddress?: string | null;
    };
  }

  /**
   * Extending the built-in user types
   */
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
    walletAddress?: string | null;
  }
}

declare module "next-auth/jwt" {
  /** Extending the built-in JWT types */
  interface JWT {
    id: string;
    role?: string | null;
    walletAddress?: string | null;
  }
}
