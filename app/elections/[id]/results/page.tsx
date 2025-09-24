'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import ElectionResults from '@/components/ElectionResults';

export default function ResultsPage() {
  const params = useParams();
  // Handle the case where params could be null
  const electionId = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : '';
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/elections" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Elections
          </Link>
        </div>
        
        <Suspense fallback={
          <div className="flex justify-center items-center min-h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        }>
          <ElectionResults electionId={electionId} />
        </Suspense>
      </div>
    </div>
  );
}
