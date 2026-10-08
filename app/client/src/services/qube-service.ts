// JQube — Qube Service Layer
// Handles all Qube (imported GitHub repository) operations.
// Uses mock data with realistic delays. Real API endpoints can replace the mocks
// by swapping the mock implementations with axios calls via @/api/axios.

import type { GithubRepo, Qube, UpdateQubeDTO } from '@/types';

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ─── In-memory store (simulates a real backend) ───────────────────────────────
let _qubes: Qube[] = [
  {
    id: 'qube-1',
    qubeName: 'frontend-app',
    repoName: 'frontend-app',
    repoOwner: 'jqube-dev',
    fullName: 'jqube-dev/frontend-app',
    description: 'Main React frontend application for the JQube platform.',
    githubUrl: 'https://github.com/jqube-dev/frontend-app',
    visibility: 'public',
    language: 'TypeScript',
    defaultBranch: 'main',
    status: 'Active',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'qube-2',
    qubeName: 'backend-api',
    repoName: 'backend-api',
    repoOwner: 'jqube-dev',
    fullName: 'jqube-dev/backend-api',
    description: 'Spring Boot REST API powering the JQube backend services.',
    githubUrl: 'https://github.com/jqube-dev/backend-api',
    visibility: 'private',
    language: 'Java',
    defaultBranch: 'main',
    status: 'Active',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ─── Mock GitHub repositories (simulates user's available repos) ───────────────
const MOCK_GITHUB_REPOS: GithubRepo[] = [
  {
    id: 101,
    name: 'react-dashboard',
    full_name: 'jqube-dev/react-dashboard',
    owner: 'jqube-dev',
    description: 'A modern dashboard built with React and Tailwind CSS.',
    private: false,
    visibility: 'public',
    html_url: 'https://github.com/jqube-dev/react-dashboard',
    language: 'TypeScript',
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    stargazers_count: 42,
    forks_count: 8,
    default_branch: 'main',
  },
  {
    id: 102,
    name: 'python-ml-service',
    full_name: 'jqube-dev/python-ml-service',
    owner: 'jqube-dev',
    description: 'Machine learning microservice built with FastAPI and PyTorch.',
    private: false,
    visibility: 'public',
    html_url: 'https://github.com/jqube-dev/python-ml-service',
    language: 'Python',
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    stargazers_count: 17,
    forks_count: 3,
    default_branch: 'develop',
  },
  {
    id: 103,
    name: 'auth-microservice',
    full_name: 'jqube-dev/auth-microservice',
    owner: 'jqube-dev',
    description: 'JWT-based authentication microservice with OAuth2 support.',
    private: true,
    visibility: 'private',
    html_url: 'https://github.com/jqube-dev/auth-microservice',
    language: 'Java',
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    stargazers_count: 0,
    forks_count: 0,
    default_branch: 'main',
  },
  {
    id: 104,
    name: 'infra-terraform',
    full_name: 'jqube-dev/infra-terraform',
    owner: 'jqube-dev',
    description: 'AWS infrastructure-as-code using Terraform modules.',
    private: true,
    visibility: 'private',
    html_url: 'https://github.com/jqube-dev/infra-terraform',
    language: 'HCL',
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    stargazers_count: 0,
    forks_count: 0,
    default_branch: 'main',
  },
  {
    id: 105,
    name: 'go-gateway',
    full_name: 'jqube-dev/go-gateway',
    owner: 'jqube-dev',
    description: 'High-performance API gateway service written in Go.',
    private: false,
    visibility: 'public',
    html_url: 'https://github.com/jqube-dev/go-gateway',
    language: 'Go',
    updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    stargazers_count: 29,
    forks_count: 5,
    default_branch: 'main',
  },
  {
    id: 106,
    name: 'mobile-app',
    full_name: 'jqube-dev/mobile-app',
    owner: 'jqube-dev',
    description: 'React Native mobile application for iOS and Android.',
    private: false,
    visibility: 'public',
    html_url: 'https://github.com/jqube-dev/mobile-app',
    language: 'TypeScript',
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    stargazers_count: 11,
    forks_count: 2,
    default_branch: 'main',
  },
];

// ─── Service ─────────────────────────────────────────────────────────────────

export const qubeService = {
  /**
   * Fetch all GitHub repositories available for the authenticated user.
   * Replace mock with: api.get('/github/repos')
   */
  async getGithubRepositories(): Promise<GithubRepo[]> {
    await delay(1200);
    // Filter out repos already imported as Qubes
    const importedFullNames = new Set(_qubes.map((q) => q.fullName));
    return MOCK_GITHUB_REPOS.filter((r) => !importedFullNames.has(r.full_name));
  },

  /**
   * Import a GitHub repository as a new Qube.
   * Replace mock with: api.post('/qubes/import', { fullName })
   */
  async importRepository(repo: GithubRepo): Promise<Qube> {
    await delay(1800);
    const newQube: Qube = {
      id: `qube-${Date.now()}`,
      qubeName: repo.name,
      repoName: repo.name,
      repoOwner: repo.owner,
      fullName: repo.full_name,
      description: repo.description ?? '',
      githubUrl: repo.html_url,
      visibility: repo.visibility,
      language: repo.language,
      defaultBranch: repo.default_branch,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    _qubes = [..._qubes, newQube];
    return newQube;
  },

  /**
   * Get all Qubes registered in the workspace.
   * Replace mock with: api.get('/qubes')
   */
  async getAllQubes(): Promise<Qube[]> {
    await delay(900);
    return [..._qubes];
  },

  /**
   * Update editable fields of a Qube.
   * Replace mock with: api.patch(`/qubes/${id}`, data)
   */
  async updateQube(id: string, data: UpdateQubeDTO): Promise<Qube> {
    await delay(800);
    const idx = _qubes.findIndex((q) => q.id === id);
    if (idx === -1) throw new Error('Qube not found.');
    const updated: Qube = {
      ..._qubes[idx],
      qubeName: data.qubeName,
      description: data.description,
      updatedAt: new Date().toISOString(),
    };
    _qubes = _qubes.map((q) => (q.id === id ? updated : q));
    return updated;
  },

  /**
   * Remove (unlink) a Qube from the workspace.
   * Does NOT delete the underlying GitHub repository.
   * Replace mock with: api.delete(`/qubes/${id}`)
   */
  async removeQube(id: string): Promise<void> {
    await delay(700);
    _qubes = _qubes.filter((q) => q.id !== id);
  },
};
