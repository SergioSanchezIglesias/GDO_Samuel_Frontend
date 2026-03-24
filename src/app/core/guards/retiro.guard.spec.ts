import { TestBed } from '@angular/core/testing';
import { type ActivatedRouteSnapshot, Router, type RouterStateSnapshot } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UserRole } from '../../features/auth/domain/models/auth.model';
import { TokenStoragePort } from '../../features/auth/domain/ports/token-storage.port';
import { retiroGuard } from './retiro.guard';

describe('retiroGuard', () => {
  const mockTokenStorage = {
    accessToken: vi.fn<() => string | null>(() => null),
    isAuthenticated: vi.fn<() => boolean>(() => false),
    userRole: vi.fn<() => UserRole | null>(() => null),
    idRetiro: vi.fn<() => number | null>(() => null),
    saveTokens: vi.fn(),
    getRefreshToken: vi.fn<() => string | null>(() => null),
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

  it('should redirect usuario with idRetiro=null to /auth/vincular-retiro', () => {
    mockTokenStorage.userRole.mockReturnValue('usuario');
    mockTokenStorage.idRetiro.mockReturnValue(null);
    const fakeUrlTree = { toString: () => '/auth/vincular-retiro' };
    mockRouter.createUrlTree.mockReturnValue(fakeUrlTree);

    const result = TestBed.runInInjectionContext(() => retiroGuard(mockRoute, mockState));

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/auth/vincular-retiro']);
    expect(result).toBe(fakeUrlTree);
  });

  it('should return true for organizador with idRetiro=null', () => {
    mockTokenStorage.userRole.mockReturnValue('organizador');
    mockTokenStorage.idRetiro.mockReturnValue(null);

    const result = TestBed.runInInjectionContext(() => retiroGuard(mockRoute, mockState));

    expect(result).toBe(true);
    expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
  });

  it('should return true for any user with idRetiro=5', () => {
    mockTokenStorage.userRole.mockReturnValue('usuario');
    mockTokenStorage.idRetiro.mockReturnValue(5);

    const result = TestBed.runInInjectionContext(() => retiroGuard(mockRoute, mockState));

    expect(result).toBe(true);
    expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
  });
});
