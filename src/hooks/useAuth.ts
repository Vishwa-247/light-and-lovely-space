import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signingIn: boolean;
  signingUp: boolean;
  signingOut: boolean;
}

const AUTH_CACHE_KEY = 'supabase_auth_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedAuth {
  session: Session | null;
  user: User | null;
  timestamp: number;
}

// Utility functions for caching
const getCachedAuth = (): CachedAuth | null => {
  try {
    const cached = localStorage.getItem(AUTH_CACHE_KEY);
    if (!cached) return null;
    
    const parsed = JSON.parse(cached) as CachedAuth;
    const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION;
    
    if (isExpired) {
      localStorage.removeItem(AUTH_CACHE_KEY);
      return null;
    }
    
    return parsed;
  } catch {
    localStorage.removeItem(AUTH_CACHE_KEY);
    return null;
  }
};

const setCachedAuth = (session: Session | null, user: User | null) => {
  try {
    const cached: CachedAuth = {
      session,
      user,
      timestamp: Date.now()
    };
    localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(cached));
  } catch {
    // Ignore cache errors
  }
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i === maxRetries - 1) break;
      
      const delay = baseDelay * Math.pow(2, i);
      await sleep(delay);
    }
  }
  
  throw lastError!;
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    signingIn: false,
    signingUp: false,
    signingOut: false,
  });
  const { toast } = useToast();
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Debounced auth state update
  const debouncedUpdateAuthState = useCallback((session: Session | null, loading: boolean = false) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setAuthState(prev => ({
        ...prev,
        user: session?.user ?? null,
        session,
        loading,
      }));
      
      // Cache the session
      setCachedAuth(session, session?.user ?? null);
    }, 100);
  }, []);

  useEffect(() => {
    // Check cache first for immediate load
    const cached = getCachedAuth();
    if (cached) {
      setAuthState(prev => ({
        ...prev,
        user: cached.user,
        session: cached.session,
        loading: false,
      }));
    }

    // Set up auth state listener with debouncing
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        debouncedUpdateAuthState(session, false);

        // Show welcome toast for successful sign-ins (after debounce)
        if (event === 'SIGNED_IN') {
          setTimeout(() => {
            toast({
              title: "Welcome back!",
              description: "You have successfully signed in.",
            });
          }, 150);
        }
      }
    );

    // Get initial session with retry logic
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await retryWithBackoff(
          () => supabase.auth.getSession(),
          2,
          500
        );
        
        if (error) throw error;
        
        debouncedUpdateAuthState(session, false);
      } catch (error) {
        console.error('Failed to get initial session:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    // Only fetch from Supabase if no valid cache
    if (!cached) {
      getInitialSession();
    }

    return () => {
      subscription.unsubscribe();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [debouncedUpdateAuthState, toast]);

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, signingIn: true }));
    
    try {
      const { error } = await retryWithBackoff(
        () => supabase.auth.signInWithPassword({ email, password }),
        2,
        1000
      );

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
    } finally {
      setAuthState(prev => ({ ...prev, signingIn: false }));
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setAuthState(prev => ({ ...prev, signingUp: true }));
    
    try {
      const { error } = await retryWithBackoff(
        () => supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
            }
          }
        }),
        2,
        1000
      );

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link to complete your registration.",
      });
    } finally {
      setAuthState(prev => ({ ...prev, signingUp: false }));
    }
  };

  const signInWithGoogle = async () => {
    setAuthState(prev => ({ ...prev, signingIn: true }));
    
    try {
      const { error } = await retryWithBackoff(
        () => supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/`,
          }
        }),
        2,
        1000
      );

      if (error) {
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
    } finally {
      // Note: OAuth redirects, so this may not execute
      setAuthState(prev => ({ ...prev, signingIn: false }));
    }
  };

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, signingOut: true }));
    
    try {
      const { error } = await retryWithBackoff(
        () => supabase.auth.signOut(),
        2,
        1000
      );
      
      if (error) {
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // Clear cache on successful sign out
      localStorage.removeItem(AUTH_CACHE_KEY);
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } finally {
      setAuthState(prev => ({ ...prev, signingOut: false }));
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };
};