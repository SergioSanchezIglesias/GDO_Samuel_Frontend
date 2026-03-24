import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { catchError, EMPTY, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthPort } from '../domain/ports/auth.port';
import { TokenStoragePort } from '../domain/ports/token-storage.port';
import { LogoutUseCase } from './logout.use-case';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let router: Router;

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

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        LogoutUseCase,
        provideRouter([]),
        { provide: AuthPort, useValue: mockAuthPort },
        { provide: TokenStoragePort, useValue: mockTokenStorage },
      ],
    });

    useCase = TestBed.inject(LogoutUseCase);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('calls authPort.logout()', () => {
    mockAuthPort.logout.mockReturnValue(of(undefined));

    useCase.execute();

    expect(mockAuthPort.logout).toHaveBeenCalled();
  });

  it('clears tokens and navigates to /auth/login on successful logout', () => {
    mockAuthPort.logout.mockReturnValue(of(undefined));

    useCase.execute();

    expect(mockTokenStorage.clearTokens).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('clears tokens and navigates to /auth/login even when server logout fails', () => {
    // The LogoutUseCase uses finalize() — clearTokens + navigate ALWAYS run,
    // even on error. We swallow the error with catchError so Vitest doesn't
    // see an unhandled rejection, while still exercising the finalize path.
    mockAuthPort.logout.mockReturnValue(
      throwError(() => new Error('Server error')).pipe(catchError(() => EMPTY)),
    );

    useCase.execute();

    expect(mockTokenStorage.clearTokens).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
