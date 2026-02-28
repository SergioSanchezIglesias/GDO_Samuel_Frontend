import { TestBed } from '@angular/core/testing';
import { type ActivatedRouteSnapshot, Router, type RouterStateSnapshot } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TokenStoragePort } from '../../features/auth/domain/ports/token-storage.port';
import { guestGuard } from './guest.guard';

describe('guestGuard', () => {
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

  it('should return true when user is NOT authenticated', () => {
    mockTokenStorage.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => guestGuard(mockRoute, mockState));

    expect(result).toBe(true);
  });

  it('should return UrlTree to /dashboard when user IS authenticated', () => {
    mockTokenStorage.isAuthenticated.mockReturnValue(true);
    const fakeUrlTree = { toString: () => '/dashboard' };
    mockRouter.createUrlTree.mockReturnValue(fakeUrlTree);

    const result = TestBed.runInInjectionContext(() => guestGuard(mockRoute, mockState));

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
    expect(result).toBe(fakeUrlTree);
  });
});
