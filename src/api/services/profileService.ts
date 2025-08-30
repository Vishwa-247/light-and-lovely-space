import { supabase } from '@/integrations/supabase/client';
import { UserProfile, ProfileFormData } from '@/types/profile';

export interface ProfileResponse {
  profile: UserProfile;
}

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile> {
    // Get main profile data
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    // Get related data
    const [educationData, experienceData, projectsData, skillsData, certificationsData] = await Promise.all([
      supabase.from('user_education').select('*').eq('user_id', userId),
      supabase.from('user_experience').select('*').eq('user_id', userId),
      supabase.from('user_projects').select('*').eq('user_id', userId),
      supabase.from('user_skills').select('*').eq('user_id', userId),
      supabase.from('user_certifications').select('*').eq('user_id', userId)
    ]);

    return this.transformDatabaseToProfile(profile, {
      education: educationData.data || [],
      experience: experienceData.data || [],
      projects: projectsData.data || [],
      skills: skillsData.data || [],
      certifications: certificationsData.data || []
    });
  },

  async updateProfile(userId: string, updates: Partial<ProfileFormData>): Promise<UserProfile> {
    // Update main profile
    const { data: profileData, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        full_name: updates.personalInfo?.fullName,
        email: updates.personalInfo?.email,
        phone: updates.personalInfo?.phone,
        location: updates.personalInfo?.location,
        linkedin_url: updates.personalInfo?.linkedin,
        github_url: updates.personalInfo?.github,
        portfolio_url: updates.personalInfo?.portfolio,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    // Update related tables if provided
    if (updates.education) {
      await supabase.from('user_education').delete().eq('user_id', userId);
      if (updates.education.length > 0) {
        await supabase.from('user_education').insert(
          updates.education.map(edu => ({
            id: edu.id,
            user_id: userId,
            institution: edu.institution,
            degree: edu.degree,
            field_of_study: edu.field,
            start_year: edu.startYear,
            end_year: edu.endYear,
            grade: edu.grade,
            description: edu.description
          }))
        );
      }
    }

    if (updates.experience) {
      await supabase.from('user_experience').delete().eq('user_id', userId);
      if (updates.experience.length > 0) {
        await supabase.from('user_experience').insert(
          updates.experience.map(exp => ({
            id: exp.id,
            user_id: userId,
            company: exp.company,
            position: exp.position,
            start_date: exp.startDate,
            end_date: exp.endDate,
            is_current: exp.current,
            description: exp.description,
            technologies: exp.technologies,
            location: exp.location
          }))
        );
      }
    }

    if (updates.projects) {
      await supabase.from('user_projects').delete().eq('user_id', userId);
      if (updates.projects.length > 0) {
        await supabase.from('user_projects').insert(
          updates.projects.map(proj => ({
            id: proj.id,
            user_id: userId,
            title: proj.title,
            description: proj.description,
            technologies: proj.technologies,
            start_date: proj.startDate,
            end_date: proj.endDate,
            github_url: proj.githubUrl,
            live_url: proj.liveUrl,
            highlights: proj.highlights
          }))
        );
      }
    }

    if (updates.skills) {
      await supabase.from('user_skills').delete().eq('user_id', userId);
      if (updates.skills.length > 0) {
        await supabase.from('user_skills').insert(
          updates.skills.map(skill => ({
            user_id: userId,
            name: skill.name,
            level: skill.level,
            category: skill.category
          }))
        );
      }
    }

    if (updates.certifications) {
      await supabase.from('user_certifications').delete().eq('user_id', userId);
      if (updates.certifications.length > 0) {
        await supabase.from('user_certifications').insert(
          updates.certifications.map(cert => ({
            id: cert.id,
            user_id: userId,
            name: cert.name,
            issuer: cert.issuer,
            issue_date: cert.issueDate,
            expiry_date: cert.expiryDate,
            credential_id: cert.credentialId,
            credential_url: cert.credentialUrl
          }))
        );
      }
    }

    return this.getProfile(userId);
  },

  transformDatabaseToProfile(dbProfile: any, relatedData: any): UserProfile {
    const profile = dbProfile || {};
    
    return {
      userId: profile.user_id || '',
      personalInfo: {
        fullName: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        linkedin: profile.linkedin_url || '',
        github: profile.github_url || '',
        portfolio: profile.portfolio_url || ''
      },
      education: relatedData.education.map((edu: any) => ({
        id: edu.id,
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field_of_study,
        startYear: edu.start_year,
        endYear: edu.end_year,
        grade: edu.grade,
        description: edu.description
      })),
      experience: relatedData.experience.map((exp: any) => ({
        id: exp.id,
        company: exp.company,
        position: exp.position,
        startDate: exp.start_date,
        endDate: exp.end_date,
        current: exp.is_current || false,
        description: exp.description,
        technologies: exp.technologies || [],
        location: exp.location
      })),
      projects: relatedData.projects.map((proj: any) => ({
        id: proj.id,
        title: proj.title,
        description: proj.description,
        technologies: proj.technologies || [],
        startDate: proj.start_date,
        endDate: proj.end_date,
        githubUrl: proj.github_url,
        liveUrl: proj.live_url,
        highlights: proj.highlights || []
      })),
      skills: relatedData.skills.map((skill: any) => ({
        name: skill.name,
        level: skill.level as 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert',
        category: skill.category as 'Technical' | 'Soft' | 'Language' | 'Framework' | 'Tool'
      })),
      certifications: relatedData.certifications.map((cert: any) => ({
        id: cert.id,
        name: cert.name,
        issuer: cert.issuer,
        issueDate: cert.issue_date,
        expiryDate: cert.expiry_date,
        credentialId: cert.credential_id,
        credentialUrl: cert.credential_url
      })),
      summary: profile.professional_summary || '',
      completionPercentage: profile.completion_percentage || 0,
      createdAt: profile.created_at || new Date().toISOString(),
      updatedAt: profile.updated_at || new Date().toISOString()
    };
  },

  async uploadResume(file: File, userId: string): Promise<any> {
    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resume-files')
      .upload(fileName, file);

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Call the resume-extractor Edge Function
    const { data, error } = await supabase.functions.invoke('resume-extractor', {
      body: new FormData([
        ['resume', file],
        ['user_id', userId]
      ] as any)
    });
    
    if (error) {
      throw new Error(`Failed to extract resume data: ${error.message}`);
    }
    
    return data;
  },

  async getProfileAnalysis(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('resume_extractions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      throw new Error(`Failed to fetch analysis: ${error.message}`);
    }
    
    return data;
  },
};