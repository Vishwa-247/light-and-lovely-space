import { apiClient } from '../client';

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export const authService = {
  async signIn(credentials: SignInRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/signin', credentials);
    
    // Set token in client
    apiClient.setToken(response.access_token);
    
    // Store user data
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  },

  async signUp(userData: SignUpRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/signup', userData);
    
    // Set token in client
    apiClient.setToken(response.access_token);
    
    // Store user data
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  },

  async signOut(): Promise<void> {
    try {
      await apiClient.post('/auth/signout');
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      // Clear local storage
      apiClient.clearToken();
      localStorage.removeItem('user');
    }
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return apiClient.isAuthenticated() && !!this.getCurrentUser();
  }
};