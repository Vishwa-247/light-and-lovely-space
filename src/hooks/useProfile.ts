import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
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
      fullName: user?.name || "",
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
      // For now, use local storage as demo backend
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
      // Call FastAPI backend for resume analysis and profile extraction
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('user_id', user.id);
      if (jobRole) {
        formData.append('job_role', jobRole);
      }

      const response = await fetch('http://localhost:8000/api/profile/extract-profile', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to process resume');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to extract profile data');
      }

      const extractedData = result.data;
      
      // Transform and merge extracted data with current profile
      const updatedProfile: UserProfile = {
        ...profile,
        personalInfo: {
          ...profile.personalInfo,
          ...extractedData.personalInfo,
        },
        education: extractedData.education || profile.education,
        experience: extractedData.experience || profile.experience,
        projects: extractedData.projects || profile.projects,
        skills: extractedData.skills || profile.skills,
        certifications: extractedData.certifications || profile.certifications,
        achievements: extractedData.achievements || [],
        languages: extractedData.languages || [],
        interests: extractedData.interests || [],
        summary: extractedData.summary || "",
        resumeData: extractedData.resumeData,
        completionPercentage: extractedData.completionPercentage || 85,
        updatedAt: extractedData.updatedAt,
      };

      localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));
      setProfile(updatedProfile);

      toast({
        title: "Success",
        description: "Resume uploaded and profile updated automatically",
      });

      return extractedData;

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

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    uploadResume,
    loadProfile,
  };
};