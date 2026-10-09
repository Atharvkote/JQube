// JQube — Qube Service Layer
// Handles all Qube (imported GitHub repository) operations.

import type { GithubRepo, Qube, UpdateQubeDTO } from '@/types';
import { api } from '@/api/axios';

const mapQubeDtoToQube = (q: any): Qube => ({
  id: q.id,
  qubeName: q.name || q.repositoryName || 'Unknown',
  repoName: q.repositoryName || 'Unknown',
  repoOwner: q.repositoryOwner || 'Unknown',
  fullName: q.repositoryFullName || 'Unknown',
  description: q.description || '',
  githubUrl: q.htmlUrl || '',
  visibility: q.privateRepository ? 'private' : 'public',
  language: q.language || null, 
  defaultBranch: q.defaultBranch || 'main',
  status: q.archived ? 'Inactive' : 'Active',
  createdAt: q.createdAt || new Date().toISOString(),
  updatedAt: q.updatedAt || new Date().toISOString()
});

export const qubeService = {
  /**
   * Fetch all GitHub repositories available for the authenticated user.
   */
  async getGithubRepositories(): Promise<{ repos: GithubRepo[], stats: { public: number, private: number } }> {
    // 1. Fetch repos from github
    const response = await api.get('/github/repos');
    const rawRepos = response.data.data || [];
    
    // Map them to expected frontend structure
    const mappedRepos: GithubRepo[] = rawRepos.map((r: any) => ({
      ...r,
      owner: r.owner?.login || '',
      private: r.private,
      visibility: r.private ? 'private' : 'public'
    }));

    const stats = {
      public: mappedRepos.filter(r => !r.private).length,
      private: mappedRepos.filter(r => r.private).length
    };

    // 2. Fetch existing qubes to filter out already imported ones
    const qubesResponse = await api.get('/qube');
    const existingQubes = qubesResponse.data.data || [];
    const importedFullNames = new Set(existingQubes.map((q: any) => q.repositoryFullName));

    return {
      repos: mappedRepos.filter((r) => !importedFullNames.has(r.full_name)),
      stats
    };
  },

  /**
   * Import a GitHub repository as a new Qube.
   */
  async importRepository(repo: GithubRepo): Promise<Qube> {
    const payload = {
      repositoryIdentifier: repo.full_name,
      name: repo.name,
      targetBranch: repo.default_branch,
      webhookEnabled: true,
      autoScanEnabled: true,
      aiRemediationEnabled: true
    };
    const response = await api.post('/qube/import', payload);
    return mapQubeDtoToQube(response.data.data);
  },

  /**
   * Get all Qubes registered in the workspace.
   */
  async getAllQubes(): Promise<Qube[]> {
    const response = await api.get('/qube');
    const rawQubes = response.data.data || [];
    return rawQubes.map(mapQubeDtoToQube);
  },

  /**
   * Update editable fields of a Qube.
   */
  async updateQube(id: string, data: UpdateQubeDTO): Promise<Qube> {
    const response = await api.put(`/qube/${id}`, data);
    return mapQubeDtoToQube(response.data.data);
  },

  /**
   * Remove (unlink) a Qube from the workspace.
   */
  async removeQube(id: string): Promise<void> {
    await api.delete(`/qube/${id}`);
  },

  /**
   * Start a new scan for a Qube.
   */
  async startScan(id: string): Promise<any> {
    const response = await api.post(`/qubes/${id}/scans`, {
      commitSha: '0000000000000000000000000000000000000000',
      scanType: 'ALL'
    });
    return response.data;
  },
};
