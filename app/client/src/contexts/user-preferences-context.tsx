import React, { createContext, useState, useMemo } from 'react';
import type { AppSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/constants/mock-data';

// preferences context value interface
export interface UserPreferencesContextValue {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

// create preferences context
export const UserPreferencesContext = createContext<UserPreferencesContextValue | undefined>(undefined);

// provider component
export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // memoized context values
  const value = useMemo<UserPreferencesContextValue>(
    () => ({
      settings,
      setSettings,
    }),
    [settings, setSettings]
  );

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}
