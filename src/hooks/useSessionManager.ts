
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
        
        // Check if we have stored user authentication
        const authData = localStorage.getItem('auth.token');
        
        if (authData) {
          const userData = JSON.parse(authData);
          const currentUser = userData.currentSession?.user;
          
          if (currentUser && mounted) {
            // Create session object
            const userSession = {
              access_token: userData.currentSession.access_token || 'token-' + Date.now(),
              refresh_token: userData.currentSession.refresh_token || 'refresh-' + Date.now(),
              user: currentUser,
              expires_at: Date.now() + 3600000, // 1 hour from now
              expires_in: 3600
            };
            
            setSession(userSession);
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear invalid auth data
        localStorage.removeItem('auth.token');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    
    // Initialize auth immediately
    initializeAuth();
    
    return () => {
      mounted = false;
    };
  }, []);

  return { session, user, isLoading };
};
