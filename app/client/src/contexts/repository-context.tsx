import React, { createContext, useState, useCallback, useMemo } from 'react';
import type { Repository, GitRepository, PullRequest, WebhookLog } from '@/types';
import {
  MOCK_REPOSITORIES,
  MOCK_GIT_REPOSITORIES,
  MOCK_PULL_REQUESTS,
  MOCK_WEBHOOK_LOGS,
} from '@/constants/mock-data';

// repository context value interface
export interface RepositoryContextValue {
  repositories: Repository[];
  gitRepositories: GitRepository[];
  pullRequests: PullRequest[];
  webhookLogs: WebhookLog[];
  triggerScan: (repoId: string) => void;
  connectGitRepo: (repo: GitRepository) => void;
  disconnectGitRepo: (id: string) => void;
}

// create repository context
export const RepositoryContext = createContext<RepositoryContextValue | undefined>(undefined);

// provider component
export function RepositoryProvider({ children }: { children: React.ReactNode }) {
  const [repositories, setRepositories] = useState<Repository[]>(MOCK_REPOSITORIES);
  const [gitRepositories, setGitRepositories] = useState<GitRepository[]>(MOCK_GIT_REPOSITORIES);
  const [pullRequests] = useState<PullRequest[]>(MOCK_PULL_REQUESTS);
  const [webhookLogs] = useState<WebhookLog[]>(MOCK_WEBHOOK_LOGS);

  // trigger security scan on repository
  const triggerScan = useCallback((repoId: string) => {
    setRepositories((prev) =>
      prev.map((repo) =>
        repo.id === repoId ? { ...repo, status: 'Scanning' as const } : repo
      )
    );
    setTimeout(() => {
      setRepositories((prev) =>
        prev.map((repo) =>
          repo.id === repoId ? { ...repo, status: 'Active' as const } : repo
        )
      );
    }, 5000);
  }, []);

  // connect new git provider integration
  const connectGitRepo = useCallback((repo: GitRepository) => {
    setGitRepositories((prev) => [...prev, repo]);
  }, []);

  // disconnect git provider integration
  const disconnectGitRepo = useCallback((id: string) => {
    setGitRepositories((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // memoized context values
  const value = useMemo<RepositoryContextValue>(
    () => ({
      repositories,
      gitRepositories,
      pullRequests,
      webhookLogs,
      triggerScan,
      connectGitRepo,
      disconnectGitRepo,
    }),
    [repositories, gitRepositories, pullRequests, webhookLogs, triggerScan, connectGitRepo, disconnectGitRepo]
  );

  return <RepositoryContext.Provider value={value}>{children}</RepositoryContext.Provider>;
}
