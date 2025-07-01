'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DevelopmentChecker from '@/components/DevelopmentChecker';

export default function CheckDevelopmentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIsAuthChecked(true);
      if (!user) {
        router.push('/sign-in?redirectTo=' + encodeURIComponent('/check-development'));
      }
    }
  }, [user, loading, router]);

  // Show minimal loading while checking auth (no spinner to avoid rotation animation)
  if (loading && !isAuthChecked) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
                Check Development Location
              </h1>
              <p className="text-black/60 dark:text-white/60 text-lg">
                Enter an address or coordinates to check if your development is in an Opportunity Zone
              </p>
            </div>
            <div className="bg-white/50 dark:bg-white/5 rounded-xl p-4 mb-8 border border-black/10 dark:border-white/10">
              <div className="animate-pulse h-4 bg-black/10 dark:bg-white/10 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show auth required if not logged in (after we've checked)
  if (!loading && isAuthChecked && !user) {
    return null; // Router will handle redirect
  }

  // If still loading or redirecting, show minimal layout without spinner
  if (!user && !loading && !isAuthChecked) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-black/60 dark:text-white/60">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
              Check Development Location
            </h1>
            <p className="text-black/60 dark:text-white/60 text-lg">
              Enter an address or coordinates to check if your development is in an Opportunity Zone
            </p>
          </div>

          {/* User info */}
          <div className="bg-white/50 dark:bg-white/5 rounded-xl p-4 mb-8 border border-black/10 dark:border-white/10">
            <p className="text-sm text-black/60 dark:text-white/60">
              Signed in as: <span className="font-medium text-black dark:text-white">{user.email}</span>
            </p>
          </div>

          {/* Development Checker Component */}
          <DevelopmentChecker />
        </div>
      </div>
    </div>
  );
} 