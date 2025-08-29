
import { createContext, useContext, ReactNode } from 'react';
import { useAuthActions } from '@/hooks/useAuthActions';
import { useSessionManager } from '@/hooks/useSessionManager';

interface AuthContextType {
  session: any;
  user: any;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Use our custom hooks
  const { session, user, isLoading: sessionLoading } = useSessionManager();
  const { signIn, signUp, signOut, isLoading: authActionsLoading } = useAuthActions();
  
  // Combine loading states
  const isLoading = sessionLoading || authActionsLoading;

  const value = {
    session,
    user,
    isLoading,
    signIn,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
