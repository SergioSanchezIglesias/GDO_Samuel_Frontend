import { TestBed } from '@angular/core/testing';
import { type ActivatedRouteSnapshot, Router, type RouterStateSnapshot } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TokenStoragePort } from '../../features/auth/domain/ports/token-storage.port';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const mockTokenStorage = {
    accessToken: vi.fn(() => null),
    isAuthenticated: vi.fn(() => false),
    saveTokens: vi.fn(),
    getRefreshToken: vi.fn(),
    clearTokens: vi.fn(),
  };

  const mockRouter = {
    createUrlTree: vi.fn(),
  };

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        { provide: TokenStoragePort, useValue: mockTokenStorage },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  it('should return true when user is authenticated', () => {
    mockTokenStorage.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(result).toBe(true);
  });

  it('should return UrlTree to /auth/login when user is NOT authenticated', () => {
    mockTokenStorage.isAuthenticated.mockReturnValue(false);
    const fakeUrlTree = { toString: () => '/auth/login' };
    mockRouter.createUrlTree.mockReturnValue(fakeUrlTree);

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
    expect(result).toBe(fakeUrlTree);
  });
});
