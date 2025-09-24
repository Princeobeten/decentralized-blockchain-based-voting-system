'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Make sure we're on the client side before rendering Links
  useEffect(() => {
    setMounted(true);
    
    // Debug log for authentication state (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth state:', { status, session: session ? 'exists' : 'none' });
    }
  }, [status, session]);
  
  // If not mounted yet, show a simplified navbar to avoid hydration issues
  if (!mounted) {
    return (
      <nav className="bg-blue-950 relative z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-white font-bold text-xl">🗳️ BlockVote</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }
  
  const handleNavigation = (path: string) => {
    setIsMenuOpen(false); // Close mobile menu
    // Use direct navigation for more reliable page transitions
    window.location.href = path;
  };

  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-900 text-white' : 'text-gray-300 hover:bg-blue-800 hover:text-white';
  };

  return (
    <nav className="bg-blue-950 relative z-30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <button onClick={() => handleNavigation('/')} className="flex items-center">
                <span className="text-white font-bold text-xl">🗳️ BlockVote</span>
              </button>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <button 
                  onClick={() => handleNavigation('/')} 
                  className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/')}`}
                >
                  Home
                </button>
                
                {mounted && session && status === 'authenticated' && (
                  <>
                    {/* Admin Navigation */}
                    {session.user.role === 'admin' ? (
                      <>
                        <button 
                          onClick={() => handleNavigation('/admin')} 
                          className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/admin')}`}
                        >
                          Admin Dashboard
                        </button>
                        <button 
                          onClick={() => handleNavigation('/elections')} 
                          className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/elections')}`}
                        >
                          Manage Elections
                        </button>
                      </>
                    ) : (
                      /* Regular User Navigation */
                      <>
                        <button 
                          onClick={() => handleNavigation('/elections')} 
                          className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/elections')}`}
                        >
                          Elections
                        </button>
                        <button 
                          onClick={() => handleNavigation('/dashboard')} 
                          className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/dashboard')}`}
                        >
                          Dashboard
                        </button>
                        {/* <button 
                          onClick={() => handleNavigation('/metamask-debug')} 
                          className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/metamask-debug')}`}
                        >
                          Wallet Debug
                        </button>
                        <button 
                          onClick={() => handleNavigation('/metamask-test')} 
                          className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/metamask-test')}`}
                        >
                          MetaMask SDK
                        </button> */}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {status === 'loading' ? (
                <div className="text-gray-300 px-3 py-2 text-sm font-medium">
                  Loading...
                </div>
              ) : (mounted && session && status === 'authenticated') ? (
                <div className="flex items-center">
                  <div className="text-gray-300 px-3 py-2 text-sm font-medium">
                    {session.user.walletAddress ? (
                      <div className="flex items-center">
                        <span className="mr-2">🔑</span>
                        <span className="font-mono">
                          {session.user.walletAddress.substring(0, 6)}...
                          {session.user.walletAddress.substring(session.user.walletAddress.length - 4)}
                        </span>
                      </div>
                    ) : (
                      <span>{session.user.name || session.user.email}</span>
                    )}
                  </div>
                  <button
                    onClick={() => signOut({ redirect: true, callbackUrl: '/' })} 
                    className="ml-3 rounded-md bg-blue-800 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-x-2">
                  <button
                    onClick={() => handleNavigation('/login')}
                    className="rounded-md bg-blue-800 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNavigation('/register')}
                    className="rounded-md bg-gray-700 px-3 py-2 text-sm font-medium text-white hover:bg-gray-600"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center rounded-md bg-blue-900 p-2 text-gray-200 hover:bg-blue-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-800"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
          <button
            onClick={() => handleNavigation('/')}
            className={`block w-full text-left rounded-md px-3 py-2 text-base font-medium ${isActive('/')}`}
          >
            Home
          </button>
          
          {mounted && session && status === 'authenticated' && (
            <>
              {/* Admin Navigation - Mobile */}
              {session.user.role === 'admin' ? (
                <>
                  <button
                    onClick={() => handleNavigation('/admin')}
                    className={`block w-full text-left rounded-md px-3 py-2 text-base font-medium ${isActive('/admin')}`}
                  >
                    Admin Dashboard
                  </button>
                  <button
                    onClick={() => handleNavigation('/elections')}
                    className={`block w-full text-left rounded-md px-3 py-2 text-base font-medium ${isActive('/elections')}`}
                  >
                    Manage Elections
                  </button>
                </>
              ) : (
                /* Regular User Navigation - Mobile */
                <>
                  <button
                    onClick={() => handleNavigation('/elections')}
                    className={`block w-full text-left rounded-md px-3 py-2 text-base font-medium ${isActive('/elections')}`}
                  >
                    Elections
                  </button>
                  <button
                    onClick={() => handleNavigation('/dashboard')}
                    className={`block w-full text-left rounded-md px-3 py-2 text-base font-medium ${isActive('/dashboard')}`}
                  >
                    Dashboard
                  </button>
                  {/* <button
                    onClick={() => handleNavigation('/metamask-debug')}
                    className={`block w-full text-left rounded-md px-3 py-2 text-base font-medium ${isActive('/metamask-debug')}`}
                  >
                    Wallet Debug
                  </button>
                  <button
                    onClick={() => handleNavigation('/metamask-test')}
                    className={`block w-full text-left rounded-md px-3 py-2 text-base font-medium ${isActive('/metamask-test')}`}
                  >
                    MetaMask SDK
                  </button> */}
                </>
              )}
            </>
          )}
        </div>
        <div className="border-t border-blue-800 pb-3 pt-4">
          <div className="flex items-center px-5">
            {status === 'loading' ? (
              <div className="text-gray-300 text-sm font-medium">
                Loading...
              </div>
            ) : (mounted && session && status === 'authenticated') ? (
              <div className="w-full">
                <div className="text-base font-medium text-gray-300">
                  {session.user.walletAddress ? (
                    <div className="flex items-center">
                      <span className="mr-2">🔑</span>
                      <span className="font-mono text-sm">
                        {session.user.walletAddress.substring(0, 6)}...
                        {session.user.walletAddress.substring(session.user.walletAddress.length - 4)}
                      </span>
                    </div>
                  ) : (
                    <span>{session.user.name || session.user.email}</span>
                  )}
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
                    className="block rounded-md bg-blue-800 px-3 py-2 text-base font-medium text-white hover:bg-blue-700"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-2 w-full">
                <button
                  onClick={() => handleNavigation('/login')}
                  className="block w-full text-left rounded-md bg-blue-800 px-3 py-2 text-base font-medium text-white hover:bg-blue-700"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavigation('/register')}
                  className="block w-full text-left rounded-md bg-gray-700 px-3 py-2 text-base font-medium text-white hover:bg-gray-600"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
