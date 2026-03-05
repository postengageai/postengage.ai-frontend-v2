import { User } from './settings';

export interface AuthResponse {
  user: User;
  message: string;
  verification_token?: string;
}

export type SignupResponse = AuthResponse;

export interface LoginResponse {
  user: User;
  message: string;
}

export interface RefreshResponse {
  user: User;
}

export interface LogoutResponse {
  message: string;
}

export interface VerifyEmailResponse {
  user: User;
  message: string;
}

export interface ResendVerificationResponse {
  message: string;
}

export interface PasswordResetResponse {
  message: string;
}

export interface VerifyEmailDto {
  token: string;
}

export interface ResendVerificationDto {
  email: string;
}

export interface PasswordResetRequestDto {
  email: string;
}

export interface PasswordResetConfirmDto {
  token: string;
  password: string;
}
