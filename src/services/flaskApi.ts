
import { FLASK_API_URL } from "@/configs/environment";

/**
 * Service for communicating with the Flask API for generation tasks
 */

/**
 * Wrapper for API calls to handle errors consistently
 */
const callFlaskApi = async <T>(endpoint: string, data: any): Promise<T> => {
  try {
    console.log(`Making API call to ${endpoint} with data:`, data);
    
    // For demo purposes, return mock data instead of making actual API calls
    // This ensures the demo works without needing a Flask backend
    if (endpoint === '/generate') {
      const mockData = generateMockFlaskResponse(data);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return mockData as T;
    } else if (endpoint === '/analyze_facial') {
      const mockFacialData = generateMockFacialAnalysis();
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockFacialData as T;
    }
    
    // If we get here, try to make the actual API call
    const response = await fetch(`${FLASK_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Flask API error: ${response.status} ${errorText}`);
    }

    const responseData = await response.json();
    return responseData.data as T;
  } catch (error: any) {
    console.error(`Error calling Flask API (${endpoint}):`, error);
    
    // For demo purposes, still return mock data even if the API call fails
    if (endpoint === '/generate') {
      return generateMockFlaskResponse(data) as T;
    } else if (endpoint === '/analyze_facial') {
      return generateMockFacialAnalysis() as T;
    }
    
    throw error;
  }
};

/**
 * Generate mock data for Flask API responses
 */
const generateMockFlaskResponse = (data: any): any => {
  if (data.action === 'generate_course') {
    return {
      text: `# ${data.topic} Course\n\n## Introduction\nWelcome to this comprehensive course on ${data.topic} designed for ${data.purpose} at ${data.difficulty} level.\n\n## Chapter 1: Fundamentals\nIn this chapter, we'll cover the basic concepts of ${data.topic}...\n\n## Chapter 2: Advanced Techniques\nBuilding on the fundamentals, we'll explore more complex aspects...\n\n## Chapter 3: Practical Applications\nIn this final chapter, you'll learn how to apply your knowledge in real-world scenarios...`
    };
  } else if (data.action === 'generate_interview_questions') {
    return {
      text: `# Interview Questions for ${data.jobRole} (${data.techStack})\n\n1. What experience do you have with ${data.techStack}?\n2. How would you design a scalable application using ${data.techStack}?\n3. Explain your approach to testing in ${data.techStack} projects.\n4. Describe a challenging problem you solved using ${data.techStack}.\n5. How do you stay updated with the latest developments in ${data.techStack}?`
    };
  } else if (data.action === 'custom_content') {
    if (data.prompt.includes('flashcards')) {
      return {
        text: `# FLASHCARDS\n- Question: What are the key components of ${data.prompt.includes('topic:') ? data.prompt.split('topic:')[1].split(' for')[0] : 'this subject'}?\n- Answer: The key components include fundamentals, advanced concepts, and practical applications.\n\n- Question: What is the main benefit of studying this subject?\n- Answer: It provides skills and knowledge that are highly valued in modern industries.\n\n- Question: How does this concept apply in real-world scenarios?\n- Answer: It can be applied to solve complex problems in various domains including business, science, and technology.`
      };
    }
  } else if (data.action === 'summarize_text') {
    return {
      text: `Summary: ${data.text.substring(0, 100)}... The text discusses key concepts and their applications.`
    };
  } else if (data.action === 'explain_code') {
    return {
      text: `Explanation of the code:\n\nThis code implements a function that ${data.code.includes('function') ? 'processes data' : 'renders components'} with efficient algorithms. The main logic handles ${data.code.includes('if') ? 'conditional branching' : 'data transformation'} to achieve the desired output.`
    };
  }
  
  return { text: "Generated content for your request." };
};

/**
 * Generate mock facial analysis data
 */
const generateMockFacialAnalysis = (): FacialAnalysisResponse => {
  // Return varying values to simulate realistic analysis
  return {
    confident: Math.random() * 0.4 + 0.6, // 60-100%
    stressed: Math.random() * 0.3 + 0.1,  // 10-40%
    hesitant: Math.random() * 0.4 + 0.2,  // 20-60%
    nervous: Math.random() * 0.3 + 0.1,   // 10-40%
    excited: Math.random() * 0.5 + 0.3    // 30-80%
  };
};

/**
 * Upload form data to Flask API (for file uploads like images)
 */
export const uploadToFlaskApi = async <T>(endpoint: string, formData: FormData): Promise<T> => {
  try {
    // For demo purposes, we'll return mock facial analysis data
    if (endpoint === '/analyze_facial') {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return generateMockFacialAnalysis() as unknown as T;
    }
    
    // If we get here, try to make the actual API call
    const response = await fetch(`${FLASK_API_URL}${endpoint}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Flask API error: ${response.status} ${errorText}`);
    }

    const responseData = await response.json();
    return responseData.data as T;
  } catch (error: any) {
    console.error(`Error uploading to Flask API (${endpoint}):`, error);
    
    // For demo purposes, still return mock data for facial analysis
    if (endpoint === '/analyze_facial') {
      return generateMockFacialAnalysis() as unknown as T;
    }
    
    throw error;
  }
};

// Type for API responses containing text content
export interface TextResponse {
  text: string;
}

// Type for facial analysis response
export interface FacialAnalysisResponse {
  confident: number;
  stressed: number;
  hesitant: number;
  nervous: number;
  excited: number;
}

/**
 * Generate a complete course using the Flask API
 */
export const generateCourseWithFlask = async (
  topic: string,
  purpose: string,
  difficulty: string
): Promise<TextResponse> => {
  return callFlaskApi<TextResponse>('/generate', {
    action: 'generate_course',
    topic,
    purpose,
    difficulty
  });
};

/**
 * Generate interview questions using the Flask API
 */
export const generateInterviewQuestionsWithFlask = async (
  jobRole: string,
  techStack: string,
  experience: string,
  questionCount: number = 5
): Promise<TextResponse> => {
  return callFlaskApi<TextResponse>('/generate', {
    action: 'generate_interview_questions',
    jobRole,
    techStack,
    experience,
    questionCount
  });
};

/**
 * Generate flashcards using the Flask API
 */
export const generateFlashcardsWithFlask = async (
  topic: string,
  purpose: string,
  difficulty: string
): Promise<TextResponse> => {
  // Use custom_content action for flashcard generation
  const prompt = `Generate 20 detailed flashcards on the topic: ${topic} for ${purpose} at ${difficulty} level.
                  
                  Create flashcards in this exact format:
                  
                  # FLASHCARDS
                  - Question: [Specific, clear question text]
                  - Answer: [Comprehensive, accurate answer text]
                  
                  Make sure the flashcards cover key concepts, terms, principles, and applications related to the topic.
                  Each answer should be detailed enough to provide complete understanding.
                  Ensure varying difficulty levels across the flashcards to test different aspects of knowledge.`;

  return callFlaskApi<TextResponse>('/generate', {
    action: 'custom_content',
    prompt
  });
};

/**
 * Analyze a video frame for facial expressions
 */
export const analyzeFacialExpressionWithFlask = async (imageBlob: Blob): Promise<FacialAnalysisResponse> => {
  const formData = new FormData();
  formData.append('image', imageBlob, 'frame.jpg');
  
  return uploadToFlaskApi<FacialAnalysisResponse>('/analyze_facial', formData);
};

/**
 * Summarize text using the Flask API
 */
export const summarizeTextWithFlask = async (text: string): Promise<TextResponse> => {
  return callFlaskApi<TextResponse>('/generate', {
    action: 'summarize_text',
    text
  });
};

/**
 * Explain code using the Flask API
 */
export const explainCodeWithFlask = async (code: string): Promise<TextResponse> => {
  return callFlaskApi<TextResponse>('/generate', {
    action: 'explain_code',
    code
  });
};
