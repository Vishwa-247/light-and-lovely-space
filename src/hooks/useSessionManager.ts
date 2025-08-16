
import { useState, useEffect } from 'react';
import { authService } from '@/api/services/authService';

export const useSessionManager = () => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    async function initializeAuth() {
      try {
        if (mounted) setIsLoading(true);
        
        // Clear any existing session and user data first
        if (mounted) {
          setSession(null);
          setUser(null);
        }
        
        // For demo purposes, check if we have stored demo user
        const demoAuthData = localStorage.getItem('auth.token');
        
        if (demoAuthData) {
          const demoData = JSON.parse(demoAuthData);
          const demoUser = demoData.currentSession?.user;
          
          if (demoUser) {
            // Create a fake session object
            const mockSession = {
              access_token: demoData.currentSession.access_token || 'demo-token',
              refresh_token: demoData.currentSession.refresh_token || 'demo-refresh-token',
              user: demoUser,
              expires_at: Date.now() + 3600000, // 1 hour from now
              expires_in: 3600
            };
            
            if (mounted) {
              setSession(mockSession);
              setUser(demoUser);
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    
    // Initialize auth
    initializeAuth();
    
    return () => {
      mounted = false;
    };
  }, []);

  return { session, user, isLoading };
};
