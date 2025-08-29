import { apiClient } from '../client';
import { UserProfile, ProfileFormData } from '@/types/profile';

export interface ProfileResponse {
  profile: UserProfile;
}

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile> {
    const response = await apiClient.get(`/profile/${userId}`);
    return response.profile;
  },

  async updateProfile(userId: string, updates: Partial<ProfileFormData>): Promise<UserProfile> {
    const response = await apiClient.put(`/profile/${userId}`, updates);
    return response.profile;
  },

  async uploadResume(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await fetch('/api/profile/upload-resume', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload resume');
    }
    
    return response.json();
  },

  async getProfileAnalysis(userId: string): Promise<any> {
    const response = await apiClient.get(`/profile/${userId}/analysis`);
    return response;
  },
};