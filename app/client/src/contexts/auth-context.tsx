import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authService } from '@/services/auth-service';
import type { LoginDTO, RegisterDTO, User } from '@/types';
import { MOCK_USER } from '@/constants/mock-data';
import { toast } from 'sonner';

// auth context value interface
export interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (loginDTO: LoginDTO) => Promise<void>;
  register: (registerDTO: RegisterDTO) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<boolean>;
  resendVerification: (email: string) => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  logout: () => void;
}

// create auth context
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// auth provider component props
interface AuthProviderProps {
  children: React.ReactNode;
}

// auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);


  // derived state: check if user is administrator
  const isAdmin = useMemo(() => {
    if (!user) return false;
    const roleLower = (user.role || '').toLowerCase();
    return roleLower === 'admin' || roleLower === 'administrator';
  }, [user]);

  // legacy state for backwards compatibility
  const isAuthenticated = isLoggedIn;

  // fetch profile if token exists on mount
  useEffect(() => {
    async function initializeAuth() {
      const token = localStorage.getItem('jqube_auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getProfile();
        if (response.success && response.data) {
          setUser(response.data);
          setIsLoggedIn(true);
        } else {
          // invalid token
          localStorage.removeItem('jqube_auth_token');
        }
      } catch (error) {
        console.error('failed to authenticate token, using mock fallback', error);
        // fallback for offline development
        setUser(MOCK_USER);
        setIsLoggedIn(true);
      } finally {
        setLoading(false);
      }
    }

    initializeAuth();
  }, []);

  // login action handler
  const login = useCallback(async (loginDTO: LoginDTO) => {
    setLoading(true);
    try {
      const response = await authService.login(loginDTO);
      if (response.success && response.data) {
        toast.success(response.message, {
          description: "Redirecting to dashboard...",
          duration: 2000,
        });
        localStorage.setItem('jqube_auth_token', response.data.token);
        // retrieve user details after login
        try {
          const profileResponse = await authService.getProfile();
          if (profileResponse.success && profileResponse.data) {
            setUser(profileResponse.data);
          } else {
            setUser({
              name: response.data.username,
              email: response.data.email,
              role: 'Developer',
            });
          }
        } catch {
          setUser({
            name: response.data.username,
            email: response.data.email,
            role: 'Developer',
          });
        }
        setIsLoggedIn(true);
      }
    } catch (error) {
      toast.error("Invalid user name or password", { description: "Please try again!" });
      setIsLoggedIn(false);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // register action handler
  const register = useCallback(async (registerDTO: RegisterDTO) => {
    setLoading(true);
    try {
      await authService.register(registerDTO);
    } catch (error) {
      console.error('registration service failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // verify email action handler
  const verifyEmail = useCallback(async (email: string, code: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await authService.verifyEmail(email, code);
      return !!response.success;
    } catch (error) {
      console.error('email verification service failed, falling back to mock', error);
      if (code.length === 6) {
        return true;
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // resend verification code handler
  const resendVerification = useCallback(async (email: string) => {
    setLoading(true);
    try {
      await authService.resendVerification(email);
    } catch (error) {
      console.error('failed to resend verification code', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // update user profile details handler
  const updateProfile = useCallback(async (profileData: Partial<User>) => {
    setLoading(true);
    try {
      const response = await authService.updateProfile(profileData);
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('failed to update profile on server, updating local state', error);
      setUser((prev) => (prev ? { ...prev, ...profileData } : null));
    } finally {
      setLoading(false);
    }
  }, []);

  // logout action handler
  const logout = useCallback(() => {
    localStorage.removeItem('jqube_auth_token');
    localStorage.removeItem('jqube_github_connected');
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  // memoized context values
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoggedIn,
      isAuthenticated,
      isAdmin,
      loading,
      login,
      register,
      verifyEmail,
      resendVerification,
      updateProfile,
      logout,
    }),
    [user,
      isLoggedIn,
      isAuthenticated,
      isAdmin,
      loading,
      login,
      register,
      verifyEmail,
      resendVerification,
      updateProfile,
      logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
