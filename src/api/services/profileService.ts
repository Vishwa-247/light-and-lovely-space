import { UserProfile, ProfileFormData } from '@/types/profile';

const PROFILE_SERVICE_BASE_URL = 'http://localhost:8006';

export interface ProfileResponse {
  profile: UserProfile;
}

export interface ResumeUploadResponse {
  success: boolean;
  extraction_id: string;
  extracted_data: any;
  confidence_score: number;
  message: string;
  metadata: {
    filename: string;
    file_size: number;
    extraction_date: string;
    ai_provider: string;
    storage_path: string;
  };
}

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile> {
    try {
      const response = await fetch(`${PROFILE_SERVICE_BASE_URL}/profile/${userId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // Profile doesn't exist, return empty profile
          return this.createEmptyProfile(userId);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.transformBackendToProfile(data.profile);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw new Error(`Failed to fetch profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async updateProfile(userId: string, updates: Partial<ProfileFormData>): Promise<UserProfile> {
    try {
      const response = await fetch(`${PROFILE_SERVICE_BASE_URL}/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.transformBackendToProfile(data.profile);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw new Error(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async uploadResume(file: File, userId: string): Promise<ResumeUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('user_id', userId);

      const response = await fetch(`${PROFILE_SERVICE_BASE_URL}/extract-profile`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to upload resume:', error);
      throw new Error(`Failed to upload resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async applyExtractedData(userId: string, extractedData: any): Promise<boolean> {
    try {
      const response = await fetch(`${PROFILE_SERVICE_BASE_URL}/profile/${userId}/apply-extraction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(extractedData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Failed to apply extracted data:', error);
      throw new Error(`Failed to apply extracted data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async getUserResume(userId: string): Promise<any> {
    try {
      const response = await fetch(`${PROFILE_SERVICE_BASE_URL}/profile/${userId}/resume`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.resume;
    } catch (error) {
      console.error('Failed to fetch resume:', error);
      return null;
    }
  },

  async deleteResume(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${PROFILE_SERVICE_BASE_URL}/profile/${userId}/resume`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Failed to delete resume:', error);
      throw new Error(`Failed to delete resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  createEmptyProfile(userId: string): UserProfile {
    return {
      userId,
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        portfolio: '',
      },
      education: [],
      experience: [],
      projects: [],
      skills: [],
      certifications: [],
      completionPercentage: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  transformBackendToProfile(backendProfile: any): UserProfile {
    if (!backendProfile) {
      throw new Error('No profile data received from backend');
    }

    return {
      userId: backendProfile.user_id || '',
      personalInfo: {
        fullName: backendProfile.full_name || '',
        email: backendProfile.email || '',
        phone: backendProfile.phone || '',
        location: backendProfile.location || '',
        linkedin: backendProfile.linkedin_url || '',
        github: backendProfile.github_url || '',
        portfolio: backendProfile.portfolio_url || '',
      },
      education: (backendProfile.education || []).map((edu: any) => ({
        id: edu.id,
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field_of_study || edu.field,
        startYear: edu.start_year || edu.startYear,
        endYear: edu.end_year || edu.endYear,
        grade: edu.grade || '',
        description: edu.description || '',
      })),
      experience: (backendProfile.experience || []).map((exp: any) => ({
        id: exp.id,
        company: exp.company,
        position: exp.position,
        startDate: exp.start_date || exp.startDate,
        endDate: exp.end_date || exp.endDate,
        current: exp.is_current || exp.current || false,
        description: exp.description || '',
        technologies: exp.technologies || [],
        location: exp.location || '',
      })),
      projects: (backendProfile.projects || []).map((proj: any) => ({
        id: proj.id,
        title: proj.title,
        description: proj.description || '',
        technologies: proj.technologies || [],
        startDate: proj.start_date || proj.startDate,
        endDate: proj.end_date || proj.endDate,
        githubUrl: proj.github_url || proj.githubUrl || '',
        liveUrl: proj.live_url || proj.liveUrl || '',
        highlights: proj.highlights || [],
      })),
      skills: (backendProfile.skills || []).map((skill: any) => ({
        name: skill.name,
        level: skill.level as 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert',
        category: skill.category as 'Technical' | 'Soft' | 'Language' | 'Framework' | 'Tool',
      })),
      certifications: (backendProfile.certifications || []).map((cert: any) => ({
        id: cert.id,
        name: cert.name,
        issuer: cert.issuer,
        issueDate: cert.issue_date || cert.issueDate,
        expiryDate: cert.expiry_date || cert.expiryDate || '',
        credentialId: cert.credential_id || cert.credentialId || '',
        credentialUrl: cert.credential_url || cert.credentialUrl || '',
      })),
      summary: backendProfile.professional_summary || '',
      resumeData: backendProfile.resume_data ? {
        filename: backendProfile.resume_data.filename,
        uploadDate: backendProfile.resume_data.upload_date,
        parsedData: backendProfile.resume_data.parsed_data,
        extractedText: backendProfile.resume_data.extracted_text,
        aiAnalysis: backendProfile.resume_data.ai_analysis,
        skillGaps: backendProfile.resume_data.skill_gaps,
        recommendations: backendProfile.resume_data.recommendations,
      } : undefined,
      completionPercentage: backendProfile.completion_percentage || 0,
      createdAt: backendProfile.created_at || new Date().toISOString(),
      updatedAt: backendProfile.updated_at || new Date().toISOString(),
    };
  },
};