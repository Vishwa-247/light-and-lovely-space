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
    console.log('Simulating AI profile data extraction...');
    
    // Simulate upload and store resume
    const fileName = `${userId}_${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resume-files')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Store resume record in database
    const { data: resumeRecord, error: resumeError } = await supabase
      .from('user_resumes')
      .insert({
        user_id: userId,
        filename: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        processing_status: 'completed',
        extraction_status: 'completed'
      })
      .select()
      .single();

    if (resumeError) throw resumeError;

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock extracted data based on common resume patterns
    const mockExtractedData = {
      personalInfo: {
        fullName: "John Doe",
        email: "john.doe@email.com",
        phone: "+1 (555) 123-4567",
        location: "New York, NY",
        linkedin: "linkedin.com/in/johndoe",
        github: "github.com/johndoe",
        portfolio: "johndoe.dev"
      },
      experience: [
        {
          id: crypto.randomUUID(),
          company: "Tech Corp",
          position: "Software Engineer",
          startDate: "2022-01-01",
          endDate: "2024-01-01",
          current: false,
          description: "Developed web applications using React and Node.js",
          technologies: ["React", "Node.js", "JavaScript", "MongoDB"],
          location: "San Francisco, CA"
        }
      ],
      education: [
        {
          id: crypto.randomUUID(),
          institution: "University of Technology",
          degree: "Bachelor of Science",
          field: "Computer Science",
          startYear: "2018",
          endYear: "2022",
          grade: "3.8 GPA"
        }
      ],
      skills: [
        { name: "JavaScript", level: "Advanced" as const, category: "Technical" as const },
        { name: "React", level: "Advanced" as const, category: "Framework" as const },
        { name: "Node.js", level: "Intermediate" as const, category: "Technical" as const }
      ],
      projects: [
        {
          id: crypto.randomUUID(),
          title: "E-commerce Platform",
          description: "Built a full-stack e-commerce solution",
          technologies: ["React", "Node.js", "MongoDB"],
          startDate: "2023-01-01",
          endDate: "2023-06-01",
          githubUrl: "github.com/johndoe/ecommerce",
          highlights: ["Increased sales by 30%", "Reduced load time by 40%"]
        }
      ],
      certifications: [
        {
          id: crypto.randomUUID(),
          name: "AWS Certified Developer",
          issuer: "Amazon Web Services",
          issueDate: "2023-06-01",
          credentialId: "ABC123"
        }
      ]
    };

    return {
      success: true,
      extraction_id: resumeRecord.id,
      extracted_data: mockExtractedData,
      confidence_score: 0.87,
      message: "Profile data extracted successfully",
      file_path: uploadData.path
    };
  },
};