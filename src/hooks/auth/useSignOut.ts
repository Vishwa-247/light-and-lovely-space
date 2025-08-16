
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

export const useSignOut = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Clear demo user from localStorage
      localStorage.removeItem('auth.token');
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully. Come back soon!"
      });
      
      // Force navigation to home page
      window.location.href = "/";
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { signOut, isLoading };
};
