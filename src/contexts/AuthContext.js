'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { trackUserEvent } from '@/lib/events';

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (event === 'SIGNED_IN' && currentUser) {
          console.log('AuthContext: SIGNED_IN event detected. User:', currentUser.id);
          // Introduce a small delay to mitigate potential race conditions on initial sign-in
          setTimeout(async () => {
            // Check and set first_auth_source if it's not set
            let { data: userProfile, error: profileError } = await supabase
              .from('users')
              .select('first_auth_source')
              .eq('id', currentUser.id)
              .maybeSingle();

            if (profileError) {
              console.error("Error fetching user profile:", profileError);
            }

            // If user not found, trigger might not have run. Wait and retry.
            if (!profileError && !userProfile) {
              await new Promise(r => setTimeout(r, 1000));
              const { data, error } = await supabase.from('users').select('first_auth_source').eq('id', currentUser.id).maybeSingle();
              userProfile = data;
              if (error) console.error("Error fetching user profile on retry:", error);
            }
            
            if (userProfile && userProfile.first_auth_source === null) {
              let returnTo = sessionStorage.getItem('returnTo') || sessionStorage.getItem('authFlow_returnTo');

              // Fallback to the current path if sessionStorage is not available.
              // This is crucial for email confirmation links and robust against race conditions clearing sessionStorage.
              if (!returnTo || returnTo === '/') {
                const currentPath = window.location.pathname;
                if (currentPath && currentPath !== '/' && !currentPath.startsWith('/auth/')) {
                  returnTo = currentPath;
                }
              }
              
              if (returnTo && returnTo !== '/') {
                const finalSource = `oz-dashboard${returnTo}`;

                const { error: updateError } = await supabase
                  .from('users')
                  .update({ first_auth_source: finalSource })
                  .eq('id', currentUser.id);

                if (updateError) {
                  console.error("Error updating first_auth_source:", updateError);
                } else {
                  console.log(`Updated first_auth_source for user ${currentUser.id} to ${finalSource}`);
                }
              }
            }

            // Track dashboard access event, which also ensures user profiles/interests tables are created
            await trackUserEvent('dashboard_accessed', '/', {}, currentUser);
          }, 500);
        }

        setLoading(false);
      }
    );

    return () => {
      authListener.unsubscribe();
    }
  }, [])

  const signInWithGoogle = async (returnTo = '/') => {
    // Clear any previous redirect flags to allow new OAuth flow
    sessionStorage.removeItem('authFlow_redirectProcessed');
    
    const redirectUrl = new URL('/auth/callback', window.location.origin);
    if (returnTo && returnTo !== '/') {
      redirectUrl.searchParams.set('next', returnTo);
    }
    
    // Store in sessionStorage for debugging and retrieval
    sessionStorage.setItem('authFlow_debug', JSON.stringify({
      returnTo,
      redirectUrl: redirectUrl.toString(),
      timestamp: new Date().toISOString(),
      currentUrl: window.location.href
    }));
    
    // Also store returnTo directly for easy access
    if (returnTo && returnTo !== '/') {
      sessionStorage.setItem('returnTo', returnTo);
    }
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl.toString(),
      },
    })
    return { data, error }
  }

  const signInWithEmail = async (email, password, returnTo = '/') => {
    if (returnTo && returnTo !== '/') {
      sessionStorage.setItem('returnTo', returnTo);
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUpWithEmail = async (email, password, returnTo = '/') => {
    if (returnTo && returnTo !== '/') {
      sessionStorage.setItem('returnTo', returnTo);
    }
    const redirectUrl = new URL('/auth/callback', window.location.origin);
    if (returnTo && returnTo !== '/') {
      redirectUrl.searchParams.set('next', returnTo);
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl.toString(),
      },
    })
    return { data, error }
  }

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  }

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    signOut,
    getCurrentUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 