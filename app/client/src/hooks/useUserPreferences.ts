import { useContext } from 'react';
import { UserPreferencesContext, type UserPreferencesContextValue } from '@/contexts/user-preferences-context';

// hook to consume user preferences context
export function useUserPreferences(): UserPreferencesContextValue {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}
export default useUserPreferences;
