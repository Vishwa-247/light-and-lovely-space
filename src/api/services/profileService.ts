import { apiClient } from '../client';
import { UserProfile, ProfileFormData } from '@/types/profile';

export interface ProfileResponse {
  profile: UserProfile;
}

const BACKEND_URL = 'http://localhost:8006';

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile> {
    const response = await fetch(`${BACKEND_URL}/profile/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    
    return response.json();
  },

  async updateProfile(userId: string, updates: Partial<ProfileFormData>): Promise<UserProfile> {
    const response = await fetch(`${BACKEND_URL}/profile/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    
    return response.json();
  },

  async uploadResume(file: File, userId: string): Promise<any> {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('user_id', userId);
    
    const response = await fetch(`${BACKEND_URL}/extract-profile`, {
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
    const response = await fetch(`${BACKEND_URL}/profile/${userId}/analysis`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch analysis');
    }
    
    return response.json();
  },
};