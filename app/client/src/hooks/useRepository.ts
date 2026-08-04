import { useContext } from 'react';
import { RepositoryContext, type RepositoryContextValue } from '@/contexts/repository-context';

// hook to consume repository context
export function useRepository(): RepositoryContextValue {
  const context = useContext(RepositoryContext);
  if (!context) {
    throw new Error('useRepository must be used within a RepositoryProvider');
  }
  return context;
}
export default useRepository;
