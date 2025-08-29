import { apiClient } from '../client';
import { CourseType } from '../../types';

export interface CourseGenerationRequest {
  course_name: string;
  purpose: CourseType['purpose'];
  difficulty: CourseType['difficulty'];
  additional_requirements?: string;
}

export interface CourseGenerationResponse {
  course_id: string;
  status: string;
  message: string;
  estimated_completion_time?: number;
}

export const courseService = {
  async generateCourse(request: CourseGenerationRequest): Promise<CourseGenerationResponse> {
    const response = await apiClient.post('/courses/generate', request);
    return response;
  },

  async getCourses(): Promise<CourseType[]> {
    const response = await apiClient.get('/courses');
    return response.data || [];
  },

  async getCourse(courseId: string): Promise<CourseType> {
    const response = await apiClient.get(`/courses/${courseId}`);
    return response.data;
  },

  async getCourseContent(courseId: string): Promise<CourseType> {
    const response = await apiClient.get(`/courses/${courseId}/content`);
    return response.data;
  },

  // Legacy methods for compatibility with existing code
  async getCourseById(courseId: string): Promise<CourseType> {
    return this.getCourse(courseId);
  },

  async updateCourseProgress(courseId: string, progress: any): Promise<void> {
    // This would be implemented when progress tracking is added
    console.log('Update course progress:', courseId, progress);
  },

  async generateAdditionalContent(
    courseId: string, 
    contentType: 'flashcards' | 'mcqs' | 'qna', 
    topic: string, 
    difficulty?: string
  ): Promise<boolean> {
    // This would be implemented when additional content generation is added
    console.log('Generate additional content:', courseId, contentType, topic, difficulty);
    return true;
  }
};