import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TokenStoragePort } from '../../auth/domain/ports/token-storage.port';
import type { Profile } from '../domain/models/profile.model';
import { ProfilePort } from '../domain/ports/profile.port';
import { GetProfileUseCase } from './get-profile.use-case';

// JWT with payload { sub: '42' }
const fakeJwtPayload = btoa(JSON.stringify({ sub: '42' })).replace(/=/g, '');
const fakeToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${fakeJwtPayload}.fake-sig`;

const mockProfile: Profile = {
  id: 42,
  name: 'Test User',
  email: 'test@example.com',
  provider: 'local',
  rol: 'usuario',
};

describe('GetProfileUseCase', () => {
  let useCase: GetProfileUseCase;

  const mockProfilePort = {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  };

  const mockTokenStorage = {
    accessToken: vi.fn<() => string | null>(() => fakeToken),
    isAuthenticated: vi.fn(() => true),
    idRetiro: vi.fn<() => number | null>(() => null),
    saveTokens: vi.fn(),
    getRefreshToken: vi.fn(),
    clearTokens: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        GetProfileUseCase,
        { provide: ProfilePort, useValue: mockProfilePort },
        { provide: TokenStoragePort, useValue: mockTokenStorage },
      ],
    });

    useCase = TestBed.inject(GetProfileUseCase);
  });

  it('decodes JWT sub and calls profilePort.getProfile with userId', () => {
    mockProfilePort.getProfile.mockReturnValue(of(mockProfile));

    useCase.execute().subscribe();

    expect(mockProfilePort.getProfile).toHaveBeenCalledWith(42);
  });

  it('returns the Profile observable from the port', () => {
    mockProfilePort.getProfile.mockReturnValue(of(mockProfile));

    let result: Profile | undefined;
    useCase.execute().subscribe((p) => {
      result = p;
    });

    expect(result).toEqual(mockProfile);
  });

  it('propagates an error when no access token is stored', () => {
    mockTokenStorage.accessToken.mockReturnValue(null);

    let caughtError: unknown;
    useCase.execute().subscribe({
      error: (err) => {
        caughtError = err;
      },
    });

    expect(caughtError).toBeInstanceOf(Error);
    expect(mockProfilePort.getProfile).not.toHaveBeenCalled();
  });
});
