'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Disable all forms of prerendering for this page
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Role to Dashboard URL mapping
const ROLE_DASHBOARD_MAP: Record<string, string> = {
  "College Admin": "https://staging.sgs.swais.in/admin/students",
  "Headmaster":    "https://staging.sgs.swais.in/headmaster",
  "Faculty":       "https://staging.sgs.swais.in/faculty/dashboard",
  "Student":       "https://staging.sgs.swais.in/student",
  "Parent":        "https://staging.sgs.swais.in/parent/dashboard",
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Wait for NextAuth session to resolve
    if (status === 'loading') return;
    if (isRedirecting) return;

    const userRole = sessionStorage.getItem('userRole');
    const dashboardUrl = sessionStorage.getItem('dashboardRedirectUrl');

    // Use Google-authenticated email (reliable) instead of typed email
    const userEmail = session?.user?.email || sessionStorage.getItem('userEmail');

    if (!userRole) {
      router.push('/');
      return;
    }

    setIsRedirecting(true);

    const targetUrl = dashboardUrl || ROLE_DASHBOARD_MAP[userRole];

    if (!targetUrl) {
      setError('Invalid role selected. Please contact administrator.');
      setIsRedirecting(false);
      return;
    }

    // SSO token handoff for Faculty role
    if (userRole === 'Faculty' && userEmail) {
      fetch('/api/sso-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.access_token) {
            window.location.href = `${targetUrl}?token=${encodeURIComponent(data.access_token)}`;
          } else {
            window.location.href = targetUrl;
          }
        })
        .catch(() => {
          window.location.href = targetUrl;
        });
    } else {
      window.location.href = targetUrl;
    }
  }, [router, isRedirecting, session, status]);

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
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p>Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
