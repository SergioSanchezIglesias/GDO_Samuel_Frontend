import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { LoginRequest, LoginResponse, User } from '../domain/models/auth.model';
import { AuthPort } from '../domain/ports/auth.port';
import { TokenStoragePort } from '../domain/ports/token-storage.port';
import { LoginUseCase } from './login.usecase';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  const mockAuthPort = {
    login: vi.fn(),
    register: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
  };

  const mockTokenStorage = {
    accessToken: vi.fn(() => null),
    isAuthenticated: vi.fn(() => false),
    idRetiro: vi.fn<() => number | null>(() => null),
    saveTokens: vi.fn(),
    getRefreshToken: vi.fn(),
    clearTokens: vi.fn(),
  };

  const loginRequest: LoginRequest = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    provider: 'local',
    rol: 'usuario',
  };

  const mockResponse: LoginResponse = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    user: mockUser,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        LoginUseCase,
        { provide: AuthPort, useValue: mockAuthPort },
        { provide: TokenStoragePort, useValue: mockTokenStorage },
      ],
    });

    useCase = TestBed.inject(LoginUseCase);
  });

  it('should call authPort.login() with the request', () => {
    mockAuthPort.login.mockReturnValue(of(mockResponse));

    useCase.execute(loginRequest).subscribe();

    expect(mockAuthPort.login).toHaveBeenCalledWith(loginRequest);
  });

  it('should save tokens on success', () => {
    mockAuthPort.login.mockReturnValue(of(mockResponse));

    useCase.execute(loginRequest).subscribe();

    expect(mockTokenStorage.saveTokens).toHaveBeenCalledWith({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('should return the User from the response on success', () => {
    mockAuthPort.login.mockReturnValue(of(mockResponse));

    let result: User | undefined;
    useCase.execute(loginRequest).subscribe((user) => {
      result = user;
    });

    expect(result).toEqual(mockUser);
  });

  it('should propagate error and NOT save tokens on failure', () => {
    const error = new Error('Login failed');
    mockAuthPort.login.mockReturnValue(throwError(() => error));

    let caughtError: unknown;
    useCase.execute(loginRequest).subscribe({
      error: (err) => {
        caughtError = err;
      },
    });

    expect(caughtError).toBe(error);
    expect(mockTokenStorage.saveTokens).not.toHaveBeenCalled();
  });
});
