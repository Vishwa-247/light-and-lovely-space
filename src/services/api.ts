import { apiClient } from '@/api/client';
import { CourseType, ChapterType, FlashcardType, McqType, QnaType, MockInterviewType, InterviewQuestionType, InterviewAnalysisType } from '@/types';

// Define the StudyMaterial type that's missing
export interface StudyMaterial {
  id: number;
  course_id: string;
  course_type: string;
  topic: string;
  difficulty_level: string;
  created_by: string;
  status: string;
  course_layout?: any;
  created_at: string;
}

// Static data for demo purposes
const staticCourseData = {
  "Network Security": {
    beginner: {
      title: "Network Security Fundamentals",
      chapters: [
        { title: "Introduction to Network Security", content: "This chapter covers the basics of network security, including key terminology, common threats, and foundational security principles." },
        { title: "Network Security Architecture", content: "Learn about the layered approach to network security and how different security controls work together." },
        { title: "Authentication and Access Control", content: "Understand the basics of authentication systems and how access controls protect network resources." },
        { title: "Common Network Attacks", content: "Explore the most common types of network attacks and their impact on organizations." },
        { title: "Basic Security Tools", content: "An introduction to essential tools for monitoring and maintaining network security." }
      ],
      flashcards: [
        { question: "What is the principle of least privilege?", answer: "Providing users with only the minimum levels of access needed to perform their job functions" },
        { question: "What is a firewall?", answer: "A network security device that monitors and filters incoming and outgoing network traffic" },
        { question: "Define authentication", answer: "The process of verifying the identity of a user or system" },
        { question: "What is encryption?", answer: "The process of converting information into a code to prevent unauthorized access" },
        { question: "What is a DDoS attack?", answer: "A distributed denial-of-service attack that attempts to make a server unavailable by overwhelming it with traffic from multiple sources" }
      ]
    }
  }
};

export const createCourse = async (
  title: string,
  purpose: CourseType['purpose'],
  difficulty: CourseType['difficulty'],
  summary: string,
  userId: string
): Promise<CourseType> => {
  try {
    const response = await apiClient.post('/courses', {
      title,
      purpose,
      difficulty,
      summary,
      userId
    });
    return response;
  } catch (error) {
    console.error("Error creating course:", error);
    // Return mock data for demo
    return {
      id: crypto.randomUUID(),
      title,
      purpose,
      difficulty,
      summary,
      created_at: new Date().toISOString(),
      user_id: userId
    } as CourseType;
  }
};

export const getAllCourses = async (userId?: string): Promise<CourseType[]> => {
  try {
    const response = await apiClient.get('/courses');
    return response.data || [];
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
};

export const getUserCourses = async (): Promise<CourseType[]> => {
  try {
    const response = await apiClient.get('/courses/user');
    return response.data || [];
  } catch (error) {
    console.error("Error fetching user courses:", error);
    return [];
  }
};

export const checkCourseGenerationStatus = async (courseId: string): Promise<{
  isComplete: boolean;
  status: string;
  error?: string;
}> => {
  try {
    const response = await apiClient.get(`/courses/${courseId}/status`);
    return response;
  } catch (error) {
    console.error("Error checking course status:", error);
    return {
      isComplete: true,
      status: "completed"
    };
  }
};

export const getCourseById = async (courseId: string): Promise<CourseType | null> => {
  try {
    const response = await apiClient.get(`/courses/${courseId}`);
    return response;
  } catch (error) {
    console.error("Error fetching course:", error);
    return null;
  }
};

export const getChaptersByCourseId = async (courseId: string): Promise<ChapterType[]> => {
  try {
    const response = await apiClient.get(`/courses/${courseId}/chapters`);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return [];
  }
};

export const getFlashcardsByCourseId = async (courseId: string): Promise<FlashcardType[]> => {
  try {
    const response = await apiClient.get(`/courses/${courseId}/flashcards`);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    return [];
  }
};

export const getMcqsByCourseId = async (courseId: string): Promise<McqType[]> => {
  try {
    const response = await apiClient.get(`/courses/${courseId}/mcqs`);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching MCQs:", error);
    return [];
  }
};

export const getQnasByCourseId = async (courseId: string): Promise<QnaType[]> => {
  try {
    const response = await apiClient.get(`/courses/${courseId}/qnas`);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching QnAs:", error);
    return [];
  }
};

export const createMockInterview = async (
  jobRole: string,
  techStack: string,
  experience: string
): Promise<MockInterviewType> => {
  try {
    const response = await apiClient.post('/interviews', {
      jobRole,
      techStack,
      experience
    });
    return response;
  } catch (error) {
    console.error("Error creating mock interview:", error);
    // Return mock data for demo
    return {
      id: crypto.randomUUID(),
      job_role: jobRole,
      tech_stack: techStack,
      experience: experience,
      user_id: 'demo-user',
      completed: false,
      created_at: new Date().toISOString()
    } as MockInterviewType;
  }
};

export const getUserMockInterviews = async (): Promise<MockInterviewType[]> => {
  try {
    const response = await apiClient.get('/interviews/user');
    return response.data || [];
  } catch (error) {
    console.error("Error fetching user interviews:", error);
    return [];
  }
};

export const getMockInterviewById = async (interviewId: string): Promise<MockInterviewType | null> => {
  try {
    const response = await apiClient.get(`/interviews/${interviewId}`);
    return response;
  } catch (error) {
    console.error("Error fetching interview:", error);
    return null;
  }
};

export const getInterviewQuestionsByInterviewId = async (interviewId: string): Promise<InterviewQuestionType[]> => {
  try {
    const response = await apiClient.get(`/interviews/${interviewId}/questions`);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching interview questions:", error);
    return [];
  }
};

export const createInterviewAnalysis = async (
  interviewId: string,
  analysis: any
): Promise<InterviewAnalysisType> => {
  try {
    const response = await apiClient.post(`/interviews/${interviewId}/analysis`, analysis);
    return response;
  } catch (error) {
    console.error("Error creating interview analysis:", error);
    // Return mock data for demo
    return {
      id: crypto.randomUUID(),
      interview_id: interviewId,
      facial_data: { confident: 75, stressed: 20, hesitant: 15, nervous: 25, excited: 60 },
      pronunciation_feedback: "Good clarity and pace, but could work on tone variation for better engagement.",
      technical_feedback: "Strong technical knowledge demonstrated with accurate examples and depth of understanding.",
      language_feedback: "Excellent grammar and vocabulary usage with good fluency throughout the interview.",
      recommendations: [
        {
          title: "Improve Confidence",
          description: "Practice speaking more confidently and maintain eye contact",
          link: "https://example.com/confidence-tips"
        },
        {
          title: "Technical Examples",
          description: "Work on providing more detailed technical examples",
          link: "https://example.com/technical-practice"
        }
      ],
      created_at: new Date().toISOString()
    } as InterviewAnalysisType;
  }
};

export const getInterviewAnalysisByInterviewId = async (interviewId: string): Promise<InterviewAnalysisType | null> => {
  try {
    const response = await apiClient.get(`/interviews/${interviewId}/analysis`);
    return response;
  } catch (error) {
    console.error("Error fetching interview analysis:", error);
    return null;
  }
};

// Legacy function for compatibility
export const api = {
  createCourse,
  getAllCourses,
  getUserCourses,
  checkCourseGenerationStatus,
  getCourseById,
  getChaptersByCourseId,
  getFlashcardsByCourseId,
  getMcqsByCourseId,
  getQnasByCourseId,
  createMockInterview,
  getUserMockInterviews,
  getMockInterviewById,
  getInterviewQuestionsByInterviewId,
  createInterviewAnalysis,
  getInterviewAnalysisByInterviewId
};

export default api;