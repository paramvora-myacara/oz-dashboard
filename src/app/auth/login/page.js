'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const returnTo = searchParams.get('returnTo') || '/';

  useEffect(() => {
    // If user is already authenticated, redirect to returnTo
    if (user && !loading) {
      router.push(returnTo);
    }
  }, [user, loading, router, returnTo]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError('');
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
        console.error('Authentication error:', error);
      }
      // The useEffect above will handle the redirect after auth
    } catch (error) {
      setError(error.message);
      console.error('Authentication error:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setIsSigningIn(true);
    setError('');
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await signUpWithEmail(email, password);
        if (error) {
          setError(error.message);
        } else {
          setMessage('Check your email for the confirmation link!');
        }
      } else {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setError(error.message);
        }
        // The useEffect above will handle the redirect after auth
      }
    } catch (error) {
      setError(error.message);
      console.error('Authentication error:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsSigningIn(true);
    setError('');
    setMessage('');

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for the password reset link!');
        setShowForgotPassword(false);
      }
    } catch (error) {
      setError(error.message);
      console.error('Password reset error:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0071e3] mx-auto mb-4"></div>
          <p className="text-black/60 dark:text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="w-16 h-16 bg-[#0071e3] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          
          <h1 className="text-3xl font-semibold text-black dark:text-white mb-2">
            Sign in to OZ Dashboard
          </h1>
          <p className="text-black/60 dark:text-white/60">
            Access premium OZ features and tools
          </p>
        </div>

        <div className="glass-card bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-8">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
            </div>
          )}

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-black/10 dark:border-white/10"
          >
            <GoogleIcon />
            <span className="text-gray-900 dark:text-white font-medium">
              {isSigningIn ? 'Signing in...' : 'Continue with Google'}
            </span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/10 dark:border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-black text-black/60 dark:text-white/60">or</span>
            </div>
          </div>

          {/* Email Authentication Form */}
          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black/70 dark:text-white/70 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-black/10 dark:border-white/10 rounded-xl text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:border-[#0071e3] transition-all"
                  placeholder="Enter your email"
                />
              </div>

              <button
                type="submit"
                disabled={isSigningIn}
                className="w-full px-6 py-4 bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningIn ? 'Sending...' : 'Send reset link'}
              </button>

              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-full text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
              >
                ← Back to sign in
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black/70 dark:text-white/70 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-black/10 dark:border-white/10 rounded-xl text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:border-[#0071e3] transition-all"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-black/70 dark:text-white/70 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-black/10 dark:border-white/10 rounded-xl text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:border-[#0071e3] transition-all"
                  placeholder="Enter your password"
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isSigningIn}
                className="w-full px-6 py-4 bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningIn ? 'Processing...' : (isSignUp ? 'Create account' : 'Sign in')}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
                >
                  {isSignUp ? 'Already have an account?' : 'Need an account?'}
                </button>
                
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-black/60 dark:text-white/60">
              By continuing, you agree to our privacy policy.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
); 