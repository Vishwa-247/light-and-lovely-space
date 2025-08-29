import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useSignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);

      // Create a demo user with the provided details
      const demoUser = {
        id: `demo-user-id-${Math.random().toString(36).substring(2, 9)}`,
        email: email || `demo${Math.floor(Math.random() * 1000)}@example.com`,
        user_metadata: {
          full_name:
            fullName || `Demo User ${Math.floor(Math.random() * 1000)}`,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${
            email.split("@")[0] || "demo"
          }`,
        },
      };

      // Wait a moment to simulate network request
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Store the demo user in localStorage to persist across page refreshes
      localStorage.setItem(
        "auth.token",
        JSON.stringify({
          currentSession: {
            access_token: `demo-access-token-${Math.random()
              .toString(36)
              .substring(2, 9)}`,
            refresh_token: `demo-refresh-token-${Math.random()
              .toString(36)
              .substring(2, 9)}`,
            user: demoUser,
          },
        })
      );

      toast({
        title: "Account created!",
        description: `Welcome to StudyMate, ${demoUser.user_metadata.full_name}!`,
      });

      navigate("/profile-builder");
    } catch (error: any) {
      console.error("Error in demo sign up:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { signUp, isLoading };
};
