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
          console.log('AuthContext: SIGNED_IN event detected. Firing dashboard_accessed event for user:', currentUser.id);
          // Track dashboard access event, which also ensures user profiles/interests tables are created
          await trackUserEvent('dashboard_accessed', '/', {}, currentUser);
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

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUpWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
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