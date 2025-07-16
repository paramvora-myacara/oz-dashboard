'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChatStore } from '@/stores/chatStore';
import { XMarkIcon } from '@heroicons/react/24/solid';

export default function AuthOverlay({ onClose, returnTo = '/' }) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const { saveGuestForAuth } = useChatStore();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      // Save guest conversation before OAuth redirect
      saveGuestForAuth();
      const { error } = await signInWithGoogle(returnTo);
      if (error) {
        setError(error.message);
        console.error('Authentication error:', error);
      }
    } catch (error) {
      setError(error.message);
      console.error('Authentication error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await signUpWithEmail(email, password, returnTo);
        if (error) {
          setError(error.message);
        } else {
          setMessage('Check your email for the confirmation link!');
        }
      } else {
        const { error } = await signInWithEmail(email, password, returnTo);
        if (error) {
          setError(error.message);
        }
        // Auth context will handle the user state change
      }
    } catch (error) {
      setError(error.message);
      console.error('Authentication error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/80 dark:bg-black/80 backdrop-blur-2xl flex flex-col items-center justify-center z-50">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-xl transition-all"
      >
        <XMarkIcon className="h-5 w-5 text-white/40 hover:text-white/60"/>
      </button>

      <div className="text-center max-w-sm px-6 w-full">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-[#0071e3] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Sign up below to <span className="italic">unlock</span> the full potential of Ozzie
          </h2>
          <p className="text-white/70 text-sm">
            By continuing, you agree to our privacy policy.
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-xl">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-800 rounded-xl">
            <p className="text-sm text-green-400">{message}</p>
          </div>
        )}

        {/* Sign in buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-gray-50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GoogleIcon />
            <span className="text-gray-900 font-medium">
              {loading ? 'Signing in...' : 'Continue with Google'}
            </span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-black text-white/50">or</span>
            </div>
          </div>

          {/* Email Authentication Form */}
          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-all"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>

              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-full text-sm text-white/60 hover:text-white/80 transition-colors"
              >
                ← Back to sign in
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-all"
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={6}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-all"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : (isSignUp ? 'Create account' : 'Sign in')}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-white/60 hover:text-white/80 transition-colors"
                >
                  {isSignUp ? 'Already have an account?' : 'Need an account?'}
                </button>
                
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-white/60 hover:text-white/80 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            </form>
          )}
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

 