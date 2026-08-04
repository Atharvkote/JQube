import { api } from '@/api/axios';
import type {
  LoginDTO,
  RegisterDTO,
  LoginResponse,
  RegistrationSuccessDTO,
  ApiResponse,
  User,
} from '@/types';

// authentication api service wrapper
export const authService = {
  // authenticate credentials
  async login(loginDTO: LoginDTO): Promise<ApiResponse<LoginResponse>> {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', loginDTO);
    return response.data;
  },

  // register new user profile
  async register(registerDTO: RegisterDTO): Promise<ApiResponse<RegistrationSuccessDTO>> {
    const response = await api.post<ApiResponse<RegistrationSuccessDTO>>('/auth/register', registerDTO);
    return response.data;
  },

  // verify email with otp code
  async verifyEmail(email: string, code: string): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>('/auth/verify', { email, verificationCode: code });
    return response.data;
  },

  // resend verification code
  async resendVerification(email: string): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>('/auth/resend-code', { email });
    return response.data;
  },

  // get authenticated user profile
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<any>>('/user/me');
    if (response.data && response.data.success && response.data.data) {
      const serverUser = response.data.data;
      const mappedUser: User = {
        name: serverUser.username,
        username: serverUser.username,
        email: serverUser.email,
        role: serverUser.roles?.[0]?.replace('ROLE_', '') || 'USER',
      };
      return {
        ...response.data,
        data: mappedUser,
      };
    }
    return response.data;
  },

  // update profile information
  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    const response = await api.put<ApiResponse<User>>('/auth/profile', profileData);
    return response.data;
  },
};
