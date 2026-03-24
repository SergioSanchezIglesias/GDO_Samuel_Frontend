import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthTokens } from '../domain/models/auth.model';
import { AuthPort } from '../domain/ports/auth.port';
import { TokenStoragePort } from '../domain/ports/token-storage.port';
import { VincularRetiroUseCase } from './vincular-retiro.usecase';

describe('VincularRetiroUseCase', () => {
  let useCase: VincularRetiroUseCase;

  const mockAuthPort = {
    login: vi.fn(),
    register: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    vincularRetiro: vi.fn(),
  };

  const mockTokenStorage = {
    accessToken: vi.fn<() => string | null>(() => null),
    isAuthenticated: vi.fn<() => boolean>(() => false),
    idRetiro: vi.fn<() => number | null>(() => null),
    saveTokens: vi.fn(),
    getRefreshToken: vi.fn<() => string | null>(() => null),
    clearTokens: vi.fn(),
  };

  const mockTokens: AuthTokens = {
    accessToken: 'new-access-token',
    refreshToken: 'new-refresh-token',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        VincularRetiroUseCase,
        { provide: AuthPort, useValue: mockAuthPort },
        { provide: TokenStoragePort, useValue: mockTokenStorage },
      ],
    });

    useCase = TestBed.inject(VincularRetiroUseCase);
  });

  it('should call authPort.vincularRetiro() with the codigo', () => {
    mockAuthPort.vincularRetiro.mockReturnValue(of(mockTokens));

    useCase.execute('123456').subscribe();

    expect(mockAuthPort.vincularRetiro).toHaveBeenCalledWith('123456');
  });

  it('should call tokenStorage.saveTokens() with response tokens on success', () => {
    mockAuthPort.vincularRetiro.mockReturnValue(of(mockTokens));

    useCase.execute('123456').subscribe();

    expect(mockTokenStorage.saveTokens).toHaveBeenCalledWith(mockTokens);
  });

  it('should return the tokens observable on success', () => {
    mockAuthPort.vincularRetiro.mockReturnValue(of(mockTokens));

    let result: AuthTokens | undefined;
    useCase.execute('123456').subscribe((tokens) => {
      result = tokens;
    });

    expect(result).toEqual(mockTokens);
  });

  it('should propagate the error and NOT call saveTokens on failure', () => {
    const error = new Error('Invalid code');
    mockAuthPort.vincularRetiro.mockReturnValue(throwError(() => error));

    let caughtError: unknown;
    useCase.execute('000000').subscribe({
      error: (err) => {
        caughtError = err;
      },
    });

    expect(caughtError).toBe(error);
    expect(mockTokenStorage.saveTokens).not.toHaveBeenCalled();
  });
});
