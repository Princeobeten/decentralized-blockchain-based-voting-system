import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Get the server session
 * Use this for server components and API routes
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Get the current user from the session
 * Use this for server components and API routes
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

/**
 * Check if the current user has the specified role
 * @param role The role to check
 */
export async function hasRole(role: string) {
  const user = await getCurrentUser();
  return user?.role === role;
}

/**
 * Middleware helper to check authentication for API routes
 * @param handler The API route handler
 */
export function withAuth(handler: Function) {
  return async (req: NextRequest) => {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return handler(req, session);
  };
}

/**
 * Middleware helper to check role-based authentication for API routes
 * @param handler The API route handler
 * @param role The required role
 */
export function withRole(handler: Function, role: string) {
  return async (req: NextRequest) => {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== role) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    return handler(req, session);
  };
}
