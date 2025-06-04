import { ApiClient } from '@/lib/api-client';

// Authentication interfaces
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'SUBADMIN';
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
    profilePicture?: string;
    permissions?: string[];
  };
  token: string;
  refreshToken?: string;
  expiresAt: string;
  isFirstLogin: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone?: string;
  invitationToken?: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'SUBADMIN';
    status: 'PENDING' | 'ACTIVE';
  };
  message: string;
  requiresVerification: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
  expiresAt: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    permissions?: string[];
  };
  expiresAt?: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface SessionInfo {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  lastActivityAt: string;
}

export interface TwoFactorSetupResponse {
  qrCode: string;
  backupCodes: string[];
  secret: string;
}

export interface TwoFactorVerifyRequest {
  code: string;
  backupCode?: string;
}

export interface TwoFactorVerifyResponse {
  success: boolean;
  message: string;
}

export interface InviteUserRequest {
  email: string;
  name: string;
  role: 'ADMIN' | 'SUBADMIN';
  department?: string;
  permissions?: string[];
  expiresIn?: number; // hours
}

export interface InviteUserResponse {
  success: boolean;
  message: string;
  invitationToken: string;
  expiresAt: string;
}

// Authentication Service
export class AuthService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  // Basic authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.apiClient.post('/api/auth/login', credentials);
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return this.apiClient.post('/api/auth/register', userData);
  }

  async logout(): Promise<LogoutResponse> {
    return this.apiClient.post('/api/auth/logout');
  }

  async logoutAllSessions(): Promise<LogoutResponse> {
    return this.apiClient.post('/api/auth/logout-all');
  }

  // Password management
  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return this.apiClient.post('/api/auth/forgot-password', data);
  }

  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return this.apiClient.post('/api/auth/reset-password', data);
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    return this.apiClient.post('/api/auth/change-password', data);
  }

  // Email verification
  async verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    return this.apiClient.post('/api/auth/verify-email', data);
  }

  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    return this.apiClient.post('/api/auth/resend-verification', { email });
  }

  // Token management
  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return this.apiClient.post('/api/auth/refresh-token', data);
  }

  async validateToken(token?: string): Promise<ValidateTokenResponse> {
    return this.apiClient.post('/api/auth/validate-token', { token });
  }

  async revokeToken(token: string): Promise<{ success: boolean; message: string }> {
    return this.apiClient.post('/api/auth/revoke-token', { token });
  }

  // Session management
  async getCurrentSession(): Promise<SessionInfo> {
    return this.apiClient.get('/api/auth/session', {
      cache: { strategy: 'network-first', ttl: 5000 } // 5 seconds cache
    });
  }

  async getAllSessions(): Promise<SessionInfo[]> {
    return this.apiClient.get('/api/auth/sessions', {
      cache: { strategy: 'network-first', ttl: 10000 } // 10 seconds cache
    });
  }

  async terminateSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    return this.apiClient.post(`/api/auth/sessions/${sessionId}/terminate`);
  }

  async terminateAllOtherSessions(): Promise<{ success: boolean; message: string; terminatedCount: number }> {
    return this.apiClient.post('/api/auth/sessions/terminate-others');
  }

  // Two-factor authentication
  async setupTwoFactor(): Promise<TwoFactorSetupResponse> {
    return this.apiClient.post('/api/auth/2fa/setup');
  }

  async verifyTwoFactor(data: TwoFactorVerifyRequest): Promise<TwoFactorVerifyResponse> {
    return this.apiClient.post('/api/auth/2fa/verify', data);
  }

  async disableTwoFactor(password: string): Promise<{ success: boolean; message: string }> {
    return this.apiClient.post('/api/auth/2fa/disable', { password });
  }

  async generateBackupCodes(): Promise<{ backupCodes: string[]; message: string }> {
    return this.apiClient.post('/api/auth/2fa/backup-codes');
  }

  // User invitations (Admin only)
  async inviteUser(inviteData: InviteUserRequest): Promise<InviteUserResponse> {
    return this.apiClient.post('/api/auth/invite', inviteData);
  }

  async validateInvitation(token: string): Promise<{
    valid: boolean;
    invitation?: {
      email: string;
      name: string;
      role: string;
      department?: string;
      expiresAt: string;
    };
  }> {
    return this.apiClient.get(`/api/auth/invite/validate/${token}`);
  }

  async acceptInvitation(token: string, userData: {
    password: string;
    confirmPassword: string;
    name?: string;
    phone?: string;
  }): Promise<LoginResponse> {
    return this.apiClient.post(`/api/auth/invite/accept/${token}`, userData);
  }

  async resendInvitation(email: string): Promise<{ success: boolean; message: string }> {
    return this.apiClient.post('/api/auth/invite/resend', { email });
  }

  async revokeInvitation(token: string): Promise<{ success: boolean; message: string }> {
    return this.apiClient.post(`/api/auth/invite/revoke/${token}`);
  }

  // Account setup (first-time login)
  async completeAccountSetup(setupData: {
    currentPassword?: string;
    newPassword: string;
    confirmPassword: string;
    name?: string;
    phone?: string;
    profilePicture?: File;
  }): Promise<LoginResponse> {
    const formData = new FormData();
    
    if (setupData.currentPassword) formData.append('currentPassword', setupData.currentPassword);
    formData.append('newPassword', setupData.newPassword);
    formData.append('confirmPassword', setupData.confirmPassword);
    if (setupData.name) formData.append('name', setupData.name);
    if (setupData.phone) formData.append('phone', setupData.phone);
    if (setupData.profilePicture) formData.append('profilePicture', setupData.profilePicture);

    return this.apiClient.upload('/api/auth/setup-account', formData);
  }

  async checkAccountSetupRequired(): Promise<{ required: boolean; reason?: string }> {
    return this.apiClient.get('/api/auth/setup-required', {
      cache: { strategy: 'network-only' } // Always check fresh
    });
  }

  // Security features
  async getSecuritySettings(): Promise<{
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    activeSessions: number;
    loginAttempts: number;
    accountLocked: boolean;
    lockoutExpiresAt?: string;
  }> {
    return this.apiClient.get('/api/auth/security', {
      cache: { strategy: 'cache-first', ttl: 30000 } // 30 seconds cache
    });
  }

  async updateSecuritySettings(settings: {
    sessionTimeout?: number;
    requirePasswordChange?: boolean;
    allowMultipleSessions?: boolean;
  }): Promise<{ success: boolean; message: string }> {
    return this.apiClient.put('/api/auth/security', settings);
  }

  async getLoginHistory(params?: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    logins: Array<{
      id: string;
      ipAddress: string;
      userAgent: string;
      success: boolean;
      failureReason?: string;
      location?: string;
      createdAt: string;
    }>;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    return this.apiClient.get('/api/auth/login-history', {
      params,
      cache: { strategy: 'cache-first', ttl: 60000 } // 1 minute cache
    });
  }

  // Account recovery
  async requestAccountRecovery(email: string): Promise<{ success: boolean; message: string }> {
    return this.apiClient.post('/api/auth/account-recovery', { email });
  }

  async verifyRecoveryCode(code: string): Promise<{
    valid: boolean;
    user?: {
      id: string;
      email: string;
      name: string;
    };
  }> {
    return this.apiClient.post('/api/auth/verify-recovery', { code });
  }

  async completeAccountRecovery(code: string, newPassword: string): Promise<LoginResponse> {
    return this.apiClient.post('/api/auth/complete-recovery', {
      code,
      newPassword,
      confirmPassword: newPassword
    });
  }

  // Account lockout management
  async unlockAccount(email: string, adminPassword: string): Promise<{ success: boolean; message: string }> {
    return this.apiClient.post('/api/auth/unlock-account', { email, adminPassword });
  }

  async checkAccountLockout(email: string): Promise<{
    locked: boolean;
    attempts: number;
    maxAttempts: number;
    lockoutExpiresAt?: string;
  }> {
    return this.apiClient.get(`/api/auth/lockout-status/${encodeURIComponent(email)}`, {
      cache: { strategy: 'network-only' } // Always check fresh
    });
  }
}

// Export service instance
export const authService = new AuthService();
