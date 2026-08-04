import { useContext } from 'react';
import { GithubContext, type GithubContextValue } from '@/contexts/github-context';

export function useGithub(): GithubContextValue {
  const context = useContext(GithubContext);
  if (!context) {
    throw new Error('useGithub must be used within a GithubProvider');
  }
  return context;
}

export default useGithub;
