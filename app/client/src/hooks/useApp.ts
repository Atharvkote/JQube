import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGithub } from '@/hooks/useGithub';
import { useRepository } from '@/hooks/useRepository';
import { useNotification } from '@/hooks/useNotification';
import { useScan } from '@/hooks/useScan';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import type { AppContextValue } from '@/contexts';

// hook to consume aggregated app context values
export function useApp(): AppContextValue {
  const auth = useAuth();
  const github = useGithub();
  const repo = useRepository();
  const notify = useNotification();
  const scan = useScan();
  const prefs = useUserPreferences();

  return useMemo<AppContextValue>(
    () => ({
      // auth context
      user: auth.user,
      isAuthenticated: auth.isAuthenticated,
      loading: auth.loading || github.githubLoading,
      isGithubConnected: github.isGithubConnected,
      login: auth.login,
      register: auth.register,
      verifyEmail: auth.verifyEmail,
      resendVerification: auth.resendVerification,
      logout: auth.logout,
      connectGithub: github.connectGithub,
      githubProfile: github.githubProfile,
      disconnectGithub: github.disconnectGithub,

      // repositories context
      repositories: repo.repositories,
      triggerScan: repo.triggerScan,

      // vulnerabilities context
      vulnerabilities: scan.vulnerabilities,

      // scan history context
      scanHistory: scan.scanHistory,

      // notifications context
      notifications: notify.notifications,
      unreadCount: notify.unreadCount,
      markAsRead: notify.markAsRead,
      markNotificationAsRead: notify.markAsRead,
      markAllRead: notify.markAllRead,
      markAllNotificationsAsRead: notify.markAllRead,
      clearNotifications: notify.clearNotifications,

      // pull requests context
      pullRequests: repo.pullRequests,

      // webhook logs context
      webhookLogs: repo.webhookLogs,

      // git integration context
      gitRepositories: repo.gitRepositories,
      connectGitRepo: repo.connectGitRepo,
      disconnectGitRepo: repo.disconnectGitRepo,

      // remediation history context
      remediationHistory: scan.remediationHistory,
      addRemediationEntry: scan.addRemediationEntry,

      // user preferences context
      settings: prefs.settings,
      setSettings: prefs.setSettings,
    }),
    [auth, github, repo, notify, scan, prefs]
  );
}

export default useApp;
