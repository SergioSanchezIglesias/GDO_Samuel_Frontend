const AUTH_PROVIDER = {
  LOCAL: 'local',
  GOOGLE: 'google',
} as const;

type AuthProvider = (typeof AUTH_PROVIDER)[keyof typeof AUTH_PROVIDER];

export type UserRole = 'organizador' | 'usuario';

export interface User {
  id: number;
  name: string;
  email: string;
  provider: AuthProvider;
  rol: UserRole;
}

export interface JwtPayload {
  sub: string;
  email: string;
  rol: UserRole;
  iat: number;
  exp: number;
  idRetiro?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VincularRetiroRequest {
  codigo: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthError {
  statusCode: number;
  message: string;
}
