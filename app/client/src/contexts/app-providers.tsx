import React from 'react';
import { AuthProvider } from './auth-context';
import { GithubProvider } from './github-context';
import { ThemeProvider } from './theme-context';
import { NotificationProvider } from './notification-context';
import { RepositoryProvider } from './repository-context';
import { ScanProvider } from './scan-context';
import { UserPreferencesProvider } from './user-preferences-context';

// master app providers aggregator component
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <GithubProvider>
        <ThemeProvider>
          <UserPreferencesProvider>
            <RepositoryProvider>
              <ScanProvider>
                <NotificationProvider>{children}</NotificationProvider>
              </ScanProvider>
            </RepositoryProvider>
          </UserPreferencesProvider>
        </ThemeProvider>
      </GithubProvider>
    </AuthProvider>
  );
}
export default AppProviders;
