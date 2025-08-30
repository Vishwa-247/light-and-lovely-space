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

    const response = await fetch('/api/resume/analyze', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
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
      const { data, error } = await supabase.functions.invoke('resume-extractor', {
        body: formData,
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to extract profile data');
      }

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