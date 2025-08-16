
import { useSignIn } from './auth/useSignIn';
import { useSignUp } from './auth/useSignUp';
import { useSignOut } from './auth/useSignOut';

export const useAuthActions = () => {
  const { signIn, isLoading: isSignInLoading } = useSignIn();
  const { signUp, isLoading: isSignUpLoading } = useSignUp();
  const { signOut, isLoading: isSignOutLoading } = useSignOut();

  const isLoading = isSignInLoading || isSignUpLoading || isSignOutLoading;

  // In demo mode, all authentication functions work with any credentials
  return {
    signIn,
    signUp,
    signOut,
    isLoading
  };
};
