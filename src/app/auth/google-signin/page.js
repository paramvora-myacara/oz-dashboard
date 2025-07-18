'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function GoogleSignInContent() {
  const { doGoogleSignIn } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    const returnTo = searchParams.get('returnTo') || '/';
    // This will redirect the popup window to Google's auth page.
    doGoogleSignIn(returnTo);
  }, [doGoogleSignIn, searchParams]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'sans-serif'
    }}>
      <p>Redirecting to Google Sign-In...</p>
      <p style={{ fontSize: '0.8rem', color: '#666' }}>
        Please complete the sign-in process in this window.
      </p>
    </div>
  );
}

export default function GoogleSignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GoogleSignInContent />
    </Suspense>
  );
} 