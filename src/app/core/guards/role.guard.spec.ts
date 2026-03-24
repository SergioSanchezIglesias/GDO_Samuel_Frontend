import { TestBed } from '@angular/core/testing';
import { type ActivatedRouteSnapshot, Router, type RouterStateSnapshot } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TokenStoragePort } from '../../features/auth/domain/ports/token-storage.port';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  // Using explicit return value per test via mockReturnValue avoids inference issues
  // with vi.fn(). The mock object is cast to satisfy the provider.
  const mockTokenStorage = {
    accessToken: vi.fn(),
    isAuthenticated: vi.fn(),
    userRole: vi.fn(),
    idRetiro: vi.fn<() => number | null>(() => null),
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
    // Safe defaults
    mockTokenStorage.isAuthenticated.mockReturnValue(false);
    mockTokenStorage.userRole.mockReturnValue(null);
    mockTokenStorage.accessToken.mockReturnValue(null);

    TestBed.configureTestingModule({
      providers: [
        { provide: TokenStoragePort, useValue: mockTokenStorage },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  it('should redirect to /auth/login when user is not authenticated', () => {
    mockTokenStorage.isAuthenticated.mockReturnValue(false);
    const fakeUrlTree = { toString: () => '/auth/login' };
    mockRouter.createUrlTree.mockReturnValue(fakeUrlTree);

    const result = TestBed.runInInjectionContext(() => roleGuard('organizador')(mockRoute, mockState));

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
    expect(result).toBe(fakeUrlTree);
  });

  it('should return true when authenticated user has the required role organizador', () => {
    mockTokenStorage.isAuthenticated.mockReturnValue(true);
    mockTokenStorage.userRole.mockReturnValue('organizador');

    const result = TestBed.runInInjectionContext(() => roleGuard('organizador')(mockRoute, mockState));

    expect(result).toBe(true);
  });

  it('should return true when authenticated user has the required role usuario', () => {
    mockTokenStorage.isAuthenticated.mockReturnValue(true);
    mockTokenStorage.userRole.mockReturnValue('usuario');

    const result = TestBed.runInInjectionContext(() => roleGuard('usuario')(mockRoute, mockState));

    expect(result).toBe(true);
  });

  it('should redirect to /dashboard when authenticated user has wrong role', () => {
    mockTokenStorage.isAuthenticated.mockReturnValue(true);
    mockTokenStorage.userRole.mockReturnValue('usuario');
    const fakeUrlTree = { toString: () => '/dashboard' };
    mockRouter.createUrlTree.mockReturnValue(fakeUrlTree);

    // Guard requires organizador but user is usuario
    const result = TestBed.runInInjectionContext(() => roleGuard('organizador')(mockRoute, mockState));

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
    expect(result).toBe(fakeUrlTree);
  });

  it('should redirect to /dashboard when organizador tries to access usuario-only route', () => {
    mockTokenStorage.isAuthenticated.mockReturnValue(true);
    mockTokenStorage.userRole.mockReturnValue('organizador');
    const fakeUrlTree = { toString: () => '/dashboard' };
    mockRouter.createUrlTree.mockReturnValue(fakeUrlTree);

    // Guard requires usuario but user is organizador
    const result = TestBed.runInInjectionContext(() => roleGuard('usuario')(mockRoute, mockState));

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
    expect(result).toBe(fakeUrlTree);
  });

  it('should redirect to /auth/login (not /dashboard) when unauthenticated, regardless of required role', () => {
    mockTokenStorage.isAuthenticated.mockReturnValue(false);
    const loginUrlTree = { toString: () => '/auth/login' };
    mockRouter.createUrlTree.mockReturnValue(loginUrlTree);

    const result = TestBed.runInInjectionContext(() => roleGuard('usuario')(mockRoute, mockState));

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
    expect(result).toBe(loginUrlTree);
  });
});
