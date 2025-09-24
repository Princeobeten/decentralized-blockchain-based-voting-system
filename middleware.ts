import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const publicPaths = ['/', '/login', '/register'];
  const isPublicPath = publicPaths.includes(path);

  // Skip middleware for API routes - important for authentication endpoints
  if (path.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  try {
    // Get the session token
    const session = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // For debugging
    console.log(`Middleware check - Path: ${path}, Session exists: ${!!session}`);

    // Redirect logic
    if (!session && !isPublicPath) {
      // If not authenticated and trying to access a protected route
      console.log(`Redirecting unauthenticated user from ${path} to /login`);
      return NextResponse.redirect(new URL('/login', req.url));
    } 
    
    if (session && (path === '/login' || path === '/register')) {
      // If already authenticated and trying to access login/register
      console.log(`Redirecting authenticated user from ${path} to /dashboard`);
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware authentication error:', error);
    // On error, proceed with the request to avoid blocking users
    return NextResponse.next();
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Match specific paths that we want to protect or handle redirects for
    '/',
    '/login',
    '/register',
    '/dashboard',
    '/elections',
    '/admin',
    '/metamask-debug',
    // Exclude all API routes, static files, and favicons
    '/((?!api|_next/static|_next/image|_next/data|favicon.ico).*)',
  ],
};
