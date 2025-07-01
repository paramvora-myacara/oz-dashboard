'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ThemeLogo from '@/components/ThemeLogo';
import ThemeToggle from '@/components/ThemeToggle';

export default function SignInPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState(null);
  
  // Get the redirect URL from query params
  const redirectTo = searchParams.get('redirectTo') || '/';

  useEffect(() => {
    if (!loading && user) {
      // User is already signed in, redirect to intended destination
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setError(null);
    
    try {
      const { error } = await signInWithGoogle(redirectTo);
      if (error) {
        console.error('Authentication error:', error);
        setError('Failed to sign in. Please try again.');
      }
      // Note: redirect will happen automatically via OAuth callback with redirectTo parameter
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Failed to sign in. Please try again.');
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0071e3]"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      {/* Background gradient similar to dashboard */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-gray-50 dark:from-black dark:via-black dark:to-gray-900"></div>
      
      {/* Header */}
      <header className="absolute top-0 left-0 z-50 p-8">
        <ThemeLogo />
      </header>
      
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Sign In Card */}
          <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl p-8 shadow-2xl">
            {/* Icon */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#0071e3] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-black dark:text-white mb-3">
                Sign in to OZ Dashboard
              </h1>
              <p className="text-black/60 dark:text-white/60">
                Access protected features and check if your development is in an Opportunity Zone
              </p>
            </div>

            {/* Sign In Button */}
            <div className="space-y-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={signingIn}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-50 dark:bg-white/10 dark:hover:bg-white/15 border border-black/10 dark:border-white/20 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <GoogleIcon />
                <span className="text-black dark:text-white font-medium">
                  {signingIn ? 'Signing in...' : 'Continue with Google'}
                </span>
              </button>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Info about redirect */}
              {redirectTo !== '/' && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-blue-600 dark:text-blue-400 text-sm text-center">
                    After signing in, you'll be redirected to your intended page
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Back to Dashboard */}
          <div className="text-center mt-6">
            <button
              onClick={() => router.push('/')}
              className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors text-sm"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Google Icon Component
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
} 