import { apiClient } from '../client';

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
  personalInfo: any;
  experience: any[];
  education: any[];
  projects: any[];
  skills: string[];
  certifications: any[];
  resumeData: any;
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
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('user_id', userId);

    const response = await fetch('/api/resume/extract-profile', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to extract profile data');
    }

    return response.json();
  },
};