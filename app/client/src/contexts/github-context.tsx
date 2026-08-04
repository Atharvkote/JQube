import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { githubService } from '@/services/github-service';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface GithubContextValue {
  isGithubConnected: boolean;
  githubLoading: boolean;
  githubProfile: any | null;
  connectGithub: () => Promise<void>;
  handleCallback: (code: string, state: string) => Promise<void>;
  disconnectGithub: () => Promise<void>;
}

export const GithubContext = createContext<GithubContextValue | undefined>(undefined);

interface GithubProviderProps {
  children: React.ReactNode;
}

export function GithubProvider({ children }: GithubProviderProps) {
  const { isAuthenticated } = useAuth();
  const [isGithubConnected, setIsGithubConnected] = useState<boolean>(() => {
    return localStorage.getItem('jqube_github_connected') === 'true';
  });
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubProfile, setGithubProfile] = useState<any | null>(null);

  // Sync state on mount or when authentication state changes
  useEffect(() => {
    if (!isAuthenticated) {
      setIsGithubConnected(false);
      setGithubProfile(null);
      return;
    }

    // Attempt to load the GitHub profile. If it succeeds, the user is connected.
    githubService.getGithubProfile().then(response => {
      if (response.success && response.data) {
        setIsGithubConnected(true);
        setGithubProfile(response.data);
        localStorage.setItem('jqube_github_connected', 'true');
      } else {
        setIsGithubConnected(false);
        setGithubProfile(null);
        localStorage.removeItem('jqube_github_connected');
      }
    }).catch(err => {
      setIsGithubConnected(false);
      setGithubProfile(null);
      localStorage.removeItem('jqube_github_connected');
    });
  }, [isAuthenticated]);

  // Action to start the connect flow (using popup window)
  const connectGithub = useCallback(async () => {
    setGithubLoading(true);

    try {
      const response = await githubService.getConnectUrl();

      if (response.success && response.message) {
        const width = 600;
        const height = 750;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
          response.message,
          "Connect to GitHub",
          `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
        );

        if (!popup) {

          toast.error("Popup blocked", {
            description: "Please allow popups for JQube to connect to GitHub.",
          });
          return;
        }


        return new Promise<void>((resolve, reject) => {
          let finished = false;

          const cleanUp = () => {
            finished = true;
            window.removeEventListener("message", messageListener);
            clearInterval(checkClosed);
          };

          const messageListener = async (event: MessageEvent) => {

            if (event.data && event.data.type === "GITHUB_CONNECTED") {
              const success = event.data.success;
              const errorMsg = event.data.error;

              cleanUp();

              try {
                popup.close();
              } catch (e) {
                // Ingore
              }

              if (success) {
                try {
                  const profileResponse =
                    await githubService.getGithubProfile();

                  if (profileResponse.success && profileResponse.data) {
                    setIsGithubConnected(true);
                    setGithubProfile(profileResponse.data);
                    localStorage.setItem(
                      "jqube_github_connected",
                      "true"
                    );

                    resolve();
                  } else {
                    reject(
                      new Error(
                        "Failed to retrieve GitHub profile after connecting."
                      )
                    );
                  }
                } catch (err) {
                  reject(err);
                }
              } else {
                reject(
                  new Error(errorMsg || "GitHub connection failed.")
                );
              }
            }
          };

          window.addEventListener("message", messageListener);

          const checkClosed = setInterval(() => {
            if (popup.closed) {

              if (finished) return;

              setTimeout(async () => {
                if (finished) return;
                cleanUp();

                try {

                  const checkResponse =
                    await githubService.getGithubProfile();

                  if (checkResponse.success && checkResponse.data) {
                    setIsGithubConnected(true);
                    setGithubProfile(checkResponse.data);
                    localStorage.setItem(
                      "jqube_github_connected",
                      "true"
                    );

                    resolve();
                  } else {
                    reject(new Error("Popup closed by user"));
                  }
                } catch (err) {
                  reject(new Error("Popup closed by user"));
                }
              }, 1000);
            }
          }, 1000);
        });
      } else {
        toast.error("Failed to initiate GitHub OAuth flow", {
          description:
            response.message || "No authorization URL was returned.",
        });
      }
    } catch (error) {
      toast.error("GitHub connection failed", {
        description: "Ensure you are signed in !!",
      });

      throw error;
    } finally {
      setGithubLoading(false);
    }
  }, []);

  // Action to handle callback exchange
  const handleCallback = useCallback(async (code: string, state: string) => {
    setGithubLoading(true);
    try {
      const response = await githubService.handleCallback(code, state);
      if (response.success) {
        localStorage.setItem('jqube_github_connected', 'true');
        setIsGithubConnected(true);
        toast.success('GitHub account linked successfully!');

        // Refresh the profile to get updated details
        try {
          const profileResponse = await githubService.getGithubProfile();
          if (profileResponse.success && profileResponse.data) {
            setGithubProfile(profileResponse.data);
          }
        } catch {
          // ignore profile fetch failure
        }
      } else {
        toast.error('Failed to link GitHub account', {
          description: response.message
        });
      }
    } catch (error: any) {
      console.error('OAuth callback failed', error);
      toast.error('GitHub OAuth Callback failed', {
        description: error.response?.data?.message || 'Error exchanging authorization code.'
      });
      throw error;
    } finally {
      setGithubLoading(false);
    }
  }, []);

  const disconnectGithub = useCallback(async () => {
    setGithubLoading(true);
    try {
      await githubService.disconnect();
      localStorage.removeItem('jqube_github_connected');
      setIsGithubConnected(false);
      setGithubProfile(null);
      toast.success('GitHub integration disconnected.');
    } catch (error: any) {
      console.error('Failed to disconnect GitHub', error);
      toast.error('Failed to disconnect GitHub account', {
        description: error.response?.data?.message || 'Could not contact backend service.'
      });
    } finally {
      setGithubLoading(false);
    }
  }, []);

  const value = {
    isGithubConnected,
    githubLoading,
    githubProfile,
    connectGithub,
    handleCallback,
    disconnectGithub,
  };

  return <GithubContext.Provider value={value}>{children}</GithubContext.Provider>;
}

export function useGithub() {
  const context = useContext(GithubContext);
  if (context === undefined) {
    throw new Error('useGithub must be used within a GithubProvider');
  }
  return context;
}
