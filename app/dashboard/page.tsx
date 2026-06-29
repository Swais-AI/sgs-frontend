'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Role to Dashboard URL mapping
const ROLE_DASHBOARD_MAP: Record<string, string> = {
  "College Admin": "http://16.112.236.67:3001/admin/students",
  "Headmaster": "http://16.112.236.67:3000",
  "Faculty": "http://16.112.236.67:3002/dashboard",
  "Student": "http://16.112.236.67:84/student/dashboard",
  "Parent": "http://16.112.236.67:3009/parent/dashboard",
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Skip if already redirecting
    if (isRedirecting) return;
    
    const userRole = sessionStorage.getItem('userRole');
    const dashboardUrl = sessionStorage.getItem('dashboardRedirectUrl');
    
    // If no role, redirect to home
    if (!userRole) {
      router.push('/');
      return;
    }

    setIsRedirecting(true);

    // If we have a stored dashboard URL, use it
    if (dashboardUrl) {
      window.location.href = dashboardUrl;
      return;
    }

    // Otherwise, use the mapping
    const url = ROLE_DASHBOARD_MAP[userRole];
    if (url) {
      window.location.href = url;
    } else {
      setError('Invalid role selected. Please contact administrator.');
      setIsRedirecting(false);
    }
  }, [router, isRedirecting]);

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600 mt-2">{error}</p>
        <button 
          onClick={() => router.push('/')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <p>Redirecting to your dashboard...</p>
    </div>
  );
}
