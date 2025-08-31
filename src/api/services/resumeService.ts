import { supabase } from '@/integrations/supabase/client';

export interface ResumeAnalysisRequest {
  jobRole: string;
  jobDescription?: string;
  userId?: string;
}

export interface ResumeAnalysisResponse {
  filename: string;
  file_size: number;
  upload_date: string;
  job_role: string;
  job_description: string;
  extracted_text: string;
  extracted_data: any;
  analysis: {
    overall_score: number;
    job_match_score: number;
    ats_score: number;
    strengths: string[];
    weaknesses: string[];
    skill_gaps: string[];
    recommendations: string[];
    keywords_found: string[];
    missing_keywords: string[];
    sections_analysis: any;
    improvement_priority: string[];
    role_specific_advice: string[];
  };
  processing_status: string;
}

export interface ProfileExtractionResponse {
  success: boolean;
  extraction_id: string;
  extracted_data: any;
  confidence_score: number;
  message: string;
  file_path: string;
}

export const resumeService = {
  async analyzeResume(file: File, data: ResumeAnalysisRequest): Promise<ResumeAnalysisResponse> {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('job_role', data.jobRole);
    if (data.jobDescription) {
      formData.append('job_description', data.jobDescription);
    }
    if (data.userId) {
      formData.append('user_id', data.userId);
    }

    const response = await fetch('http://localhost:8000/resume/analyze', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to analyze resume');
    }

    return response.json();
  },

  async extractProfileData(file: File, userId: string): Promise<ProfileExtractionResponse> {
    console.log('Extracting profile data from resume...');
    
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('user_id', userId);

    try {
      // Get auth token for direct API call
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Use direct fetch to properly send FormData with files
      const response = await fetch(`https://jwmsgrodliegekbrhvgt.supabase.co/functions/v1/resume-extractor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.success) {
        throw new Error(data?.error || 'Failed to extract profile data');
      }

      console.log('Profile extraction successful:', data);
      return data;
    } catch (error) {
      console.error('Resume extraction error:', error);
      throw error;
    }
  },
};