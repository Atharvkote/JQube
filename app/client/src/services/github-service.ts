import { api } from '@/api/axios';
import type { ApiResponse } from '@/types';

export const githubService = {
  // Retrieves the GitHub OAuth authorization URL from the backend
  async getConnectUrl(): Promise<ApiResponse<void>> {
    const response = await api.get<ApiResponse<void>>('/github/connect');
    return response.data;
  },

  // Sends the authorization code and state callback parameters to the backend
  async handleCallback(code: string, state: string): Promise<ApiResponse<void>> {
    const response = await api.get<ApiResponse<void>>(`/github/callback`, {
      params: { code, state },
    });
    return response.data;
  },

  // Gets the connected GitHub profile details
  async getGithubProfile(): Promise<ApiResponse<any>> {
    const response = await api.get<ApiResponse<any>>('/github/profile');
    return response.data;
  },

  // Disconnects/deletes the connected GitHub account
  async disconnect(): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>('/github/disconnect');
    return response.data;
  },
};
