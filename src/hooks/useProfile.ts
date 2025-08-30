import { useState, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth';
import { UserProfile, ProfileFormData } from "@/types/profile";
import { profileService } from "@/api/services/profileService";
import { useToast } from "@/hooks/use-toast";

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize empty profile
  const initializeProfile = (): UserProfile => ({
    userId: user?.id || "",
    personalInfo: {
      fullName: user?.user_metadata?.full_name || "",
      email: user?.email || "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      portfolio: "",
    },
    education: [],
    experience: [],
    projects: [],
    skills: [],
    certifications: [],
    completionPercentage: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Try to load from backend first
      try {
        const backendProfile = await profileService.getProfile(user.id);
        setProfile(backendProfile);
        return;
      } catch (backendError) {
        console.log("Backend profile not found, trying localStorage");
      }

      // Fall back to localStorage if backend fails
      const savedProfile = localStorage.getItem(`profile_${user.id}`);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      } else {
        // Initialize new profile
        const newProfile = initializeProfile();
        setProfile(newProfile);
        localStorage.setItem(`profile_${user.id}`, JSON.stringify(newProfile));
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      setError("Failed to load profile");
      // Initialize fallback profile
      setProfile(initializeProfile());
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<ProfileFormData>) => {
    if (!profile || !user) return;

    setIsLoading(true);
    try {
      const updatedProfile: UserProfile = {
        ...profile,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Save to local storage for demo
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      
      // TODO: Replace with actual API call
      // await profileService.updateProfile(user.id, updates);
      
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadResume = async (file: File, jobRole?: string) => {
    if (!profile || !user) return;

    setIsLoading(true);
    try {
      const result = await profileService.uploadResume(file, user.id);
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to extract profile data');
      }

    } catch (error) {
      console.error("Failed to upload resume:", error);
      toast({
        title: "Error",
        description: "Failed to upload resume. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const applyExtractedData = async () => {
    if (!user) return;
    
    try {
      // Reload profile from backend to get the latest extracted data
      await loadProfile();
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been automatically filled with extracted data",
      });
    } catch (error) {
      console.error("Failed to apply extracted data:", error);
      toast({
        title: "Error", 
        description: "Failed to apply extracted data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    uploadResume,
    applyExtractedData,
    loadProfile,
  };
};