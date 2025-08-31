import { useState, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth';
import { UserProfile, ProfileFormData } from "@/types/profile";
import { resumeService } from "@/api/services/resumeService";
import { supabase } from "@/integrations/supabase/client";
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
      // Load from Supabase database
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Load related data
      const [educationResult, experienceResult, projectsResult, skillsResult, certificationsResult] = await Promise.all([
        supabase.from('user_education').select('*').eq('user_id', user.id),
        supabase.from('user_experience').select('*').eq('user_id', user.id),
        supabase.from('user_projects').select('*').eq('user_id', user.id),
        supabase.from('user_skills').select('*').eq('user_id', user.id),
        supabase.from('user_certifications').select('*').eq('user_id', user.id),
      ]);

      if (userProfile) {
        // Build profile from database data
        const profile: UserProfile = {
          userId: user.id,
          personalInfo: {
            fullName: userProfile.full_name || "",
            email: userProfile.email || user.email || "",
            phone: userProfile.phone || "",
            location: userProfile.location || "",
            linkedin: userProfile.linkedin_url || "",
            github: userProfile.github_url || "",
            portfolio: userProfile.portfolio_url || "",
          },
          education: educationResult.data?.map(edu => ({
            id: edu.id,
            institution: edu.institution,
            degree: edu.degree,
            field: edu.field_of_study,
            startYear: edu.start_year || "",
            endYear: edu.end_year || "",
            grade: edu.grade || "",
            description: edu.description || "",
          })) || [],
          experience: experienceResult.data?.map(exp => ({
            id: exp.id,
            company: exp.company,
            position: exp.position,
            startDate: exp.start_date,
            endDate: exp.end_date || "",
            current: exp.is_current || false,
            description: exp.description || "",
            technologies: exp.technologies || [],
            location: exp.location || "",
          })) || [],
          projects: projectsResult.data?.map(proj => ({
            id: proj.id,
            title: proj.title,
            description: proj.description || "",
            technologies: proj.technologies || [],
            startDate: proj.start_date || "",
            endDate: proj.end_date || "",
            githubUrl: proj.github_url || "",
            liveUrl: proj.live_url || "",
            highlights: proj.highlights || [],
          })) || [],
          skills: skillsResult.data?.map(skill => ({
            name: skill.name,
            level: skill.level as 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert',
            category: skill.category as 'Technical' | 'Soft' | 'Language' | 'Framework' | 'Tool',
          })) || [],
          certifications: certificationsResult.data?.map(cert => ({
            id: cert.id,
            name: cert.name,
            issuer: cert.issuer,
            issueDate: cert.issue_date || "",
            expiryDate: cert.expiry_date || "",
            credentialId: cert.credential_id || "",
            credentialUrl: cert.credential_url || "",
          })) || [],
          completionPercentage: userProfile.completion_percentage || 0,
          createdAt: userProfile.created_at,
          updatedAt: userProfile.updated_at,
        };
        
        setProfile(profile);
      } else {
        // Create new profile in database
        const newProfile = initializeProfile();
        
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            full_name: newProfile.personalInfo.fullName,
            email: newProfile.personalInfo.email,
            completion_percentage: 0,
          });

        if (insertError) {
          console.error('Error creating profile:', insertError);
        }
        
        setProfile(newProfile);
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
    console.log('🔄 updateProfile called:', { 
      userId: user?.id, 
      hasProfile: !!profile,
      updateKeys: Object.keys(updates)
    });
    
    if (!user?.id) {
      const error = new Error('Authentication required - please sign in again');
      console.error('❌ updateProfile failed: no authenticated user');
      throw error;
    }

    // Verify current session is valid before making database calls
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('🔐 Session validation:', { 
      hasSession: !!session, 
      sessionValid: session && session.expires_at ? session.expires_at > Date.now() / 1000 : false,
      sessionError: !!sessionError 
    });
    
    if (sessionError || !session || !session.access_token) {
      const error = new Error('Session expired - please sign in again');
      console.error('❌ updateProfile failed: invalid session', sessionError);
      throw error;
    }

    setIsLoading(true);
    
    try {
      // Build the update data from the updates passed in
      const upsertData: any = {
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      // Map the updates to database columns
      if (updates.personalInfo) {
        const { personalInfo } = updates;
        if (personalInfo.fullName !== undefined) upsertData.full_name = personalInfo.fullName;
        if (personalInfo.email !== undefined) upsertData.email = personalInfo.email;
        if (personalInfo.phone !== undefined) upsertData.phone = personalInfo.phone;
        if (personalInfo.location !== undefined) upsertData.location = personalInfo.location;
        if (personalInfo.linkedin !== undefined) upsertData.linkedin_url = personalInfo.linkedin;
        if (personalInfo.github !== undefined) upsertData.github_url = personalInfo.github;
        if (personalInfo.portfolio !== undefined) upsertData.portfolio_url = personalInfo.portfolio;
      }

      console.log('📝 Upsert data:', upsertData);

      // Use upsert with proper conflict resolution
      const { data, error: profileError } = await supabase
        .from('user_profiles')
        .upsert(upsertData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false,
          defaultToNull: false
        })
        .select('*')
        .single();

      console.log('✅ Upsert result:', { 
        success: !!data, 
        error: !!profileError,
        data: data ? 'received' : 'none'
      });

      if (profileError) {
        console.error('❌ Database error details:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        });
        
        // Handle specific error types
        if (profileError.code === '23505') {
          throw new Error('Profile already exists - this should not happen');
        } else if (profileError.code === '42501') {
          throw new Error('Permission denied - please check your authentication');
        } else {
          throw new Error(`Database error: ${profileError.message}`);
        }
      }

      if (!data) {
        console.error('❌ No data returned from upsert - possible RLS policy issue');
        throw new Error('Update failed - unable to save changes. Please try signing out and back in.');
      }

      console.log('✅ Profile updated successfully');
      
      // Reload profile to get fresh data
      await loadProfile();
      
    } catch (error) {
      console.error('❌ updateProfile error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadResume = async (file: File, jobRole?: string) => {
    if (!profile || !user) return;

    setIsLoading(true);
    try {
      const result = await resumeService.extractProfileData(file, user.id);
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result?.message || 'Failed to extract profile data');
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

  const applyExtractedData = async (extractedData: any) => {
    if (!user || !extractedData) return;
    
    setIsLoading(true);
    try {
      // Apply personal info
      if (extractedData.personalInfo) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            full_name: extractedData.personalInfo.fullName || '',
            email: extractedData.personalInfo.email || user.email || '',
            phone: extractedData.personalInfo.phone || '',
            location: extractedData.personalInfo.location || '',
            linkedin_url: extractedData.personalInfo.linkedin || '',
            github_url: extractedData.personalInfo.github || '',
            portfolio_url: extractedData.personalInfo.portfolio || '',
          });

        if (profileError) throw profileError;
      }

      // Apply education data
      if (extractedData.education && extractedData.education.length > 0) {
        // Delete existing education first
        await supabase.from('user_education').delete().eq('user_id', user.id);

        const educationData = extractedData.education.map((edu: any) => ({
          user_id: user.id,
          institution: edu.institution,
          degree: edu.degree,
          field_of_study: edu.field,
          start_year: edu.startYear,
          end_year: edu.endYear,
          grade: edu.grade,
          description: edu.description,
        }));

        const { error: eduError } = await supabase
          .from('user_education')
          .insert(educationData);

        if (eduError) throw eduError;
      }

      // Apply experience data
      if (extractedData.experience && extractedData.experience.length > 0) {
        await supabase.from('user_experience').delete().eq('user_id', user.id);

        const experienceData = extractedData.experience.map((exp: any) => ({
          user_id: user.id,
          company: exp.company,
          position: exp.position,
          start_date: exp.startDate,
          end_date: exp.endDate,
          is_current: exp.current,
          description: exp.description,
          technologies: exp.technologies || [],
          location: exp.location,
        }));

        const { error: expError } = await supabase
          .from('user_experience')
          .insert(experienceData);

        if (expError) throw expError;
      }

      // Apply projects data
      if (extractedData.projects && extractedData.projects.length > 0) {
        await supabase.from('user_projects').delete().eq('user_id', user.id);

        const projectsData = extractedData.projects.map((proj: any) => ({
          user_id: user.id,
          title: proj.title,
          description: proj.description,
          technologies: proj.technologies || [],
          start_date: proj.startDate,
          end_date: proj.endDate,
          github_url: proj.githubUrl,
          live_url: proj.liveUrl,
          highlights: proj.highlights || [],
        }));

        const { error: projError } = await supabase
          .from('user_projects')
          .insert(projectsData);

        if (projError) throw projError;
      }

      // Apply skills data
      if (extractedData.skills && extractedData.skills.length > 0) {
        await supabase.from('user_skills').delete().eq('user_id', user.id);

        const skillsData = extractedData.skills.map((skill: any) => ({
          user_id: user.id,
          name: skill.name,
          level: skill.level,
          category: skill.category,
        }));

        const { error: skillError } = await supabase
          .from('user_skills')
          .insert(skillsData);

        if (skillError) throw skillError;
      }

      // Apply certifications data
      if (extractedData.certifications && extractedData.certifications.length > 0) {
        await supabase.from('user_certifications').delete().eq('user_id', user.id);

        const certificationsData = extractedData.certifications.map((cert: any) => ({
          user_id: user.id,
          name: cert.name,
          issuer: cert.issuer,
          issue_date: cert.issueDate,
          expiry_date: cert.expiryDate,
          credential_id: cert.credentialId,
          credential_url: cert.credentialUrl,
        }));

        const { error: certError } = await supabase
          .from('user_certifications')
          .insert(certificationsData);

        if (certError) throw certError;
      }

      // Reload profile to get updated data
      await loadProfile();
      
      toast({
        title: "Success! 🎉",
        description: "Your profile has been automatically filled with extracted data from your resume.",
      });
      
      return true;
    } catch (error) {
      console.error("Failed to apply extracted data:", error);
      toast({
        title: "Error", 
        description: "Failed to apply extracted data. Please try again.",
        variant: "destructive",
      });
      return false;
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
    applyExtractedData,
    loadProfile,
  };
};