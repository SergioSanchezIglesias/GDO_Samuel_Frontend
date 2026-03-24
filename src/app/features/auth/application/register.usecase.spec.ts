import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RegisterRequest, RegisterResponse, User } from '../domain/models/auth.model';
import { AuthPort } from '../domain/ports/auth.port';
import { TokenStoragePort } from '../domain/ports/token-storage.port';
import { RegisterUseCase } from './register.usecase';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;

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

  const registerRequest: RegisterRequest = {
    name: 'New User',
    email: 'new@example.com',
    password: 'password123',
  };

  const mockUser: User = {
    id: 2,
    name: 'New User',
    email: 'new@example.com',
    provider: 'local',
    rol: 'usuario',
  };

  const mockResponse: RegisterResponse = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    user: mockUser,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        RegisterUseCase,
        { provide: AuthPort, useValue: mockAuthPort },
        { provide: TokenStoragePort, useValue: mockTokenStorage },
      ],
    });

    useCase = TestBed.inject(RegisterUseCase);
  });

  it('should call authPort.register() with the request', () => {
    mockAuthPort.register.mockReturnValue(of(mockResponse));

    useCase.execute(registerRequest).subscribe();

    expect(mockAuthPort.register).toHaveBeenCalledWith(registerRequest);
  });

  it('should save tokens on success', () => {
    mockAuthPort.register.mockReturnValue(of(mockResponse));

    useCase.execute(registerRequest).subscribe();

    expect(mockTokenStorage.saveTokens).toHaveBeenCalledWith({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('should return the User from the response on success', () => {
    mockAuthPort.register.mockReturnValue(of(mockResponse));

    let result: User | undefined;
    useCase.execute(registerRequest).subscribe((user) => {
      result = user;
    });

    expect(result).toEqual(mockUser);
  });

  it('should propagate error and NOT save tokens on failure', () => {
    const error = new Error('Register failed');
    mockAuthPort.register.mockReturnValue(throwError(() => error));

    let caughtError: unknown;
    useCase.execute(registerRequest).subscribe({
      error: (err) => {
        caughtError = err;
      },
    });

    expect(caughtError).toBe(error);
    expect(mockTokenStorage.saveTokens).not.toHaveBeenCalled();
  });
});
