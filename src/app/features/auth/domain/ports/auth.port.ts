import type { Observable } from 'rxjs';

import type {
  AuthTokens,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../models/auth.model';

export abstract class AuthPort {
  abstract login(request: LoginRequest): Observable<LoginResponse>;
  abstract register(request: RegisterRequest): Observable<RegisterResponse>;
  abstract refresh(refreshToken: string): Observable<AuthTokens>;
  abstract logout(): Observable<void>;
  abstract vincularRetiro(codigo: string): Observable<AuthTokens>;
}
