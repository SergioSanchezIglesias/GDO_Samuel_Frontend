import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TokenStoragePort } from '../../auth/domain/ports/token-storage.port';
import type { Profile, UpdateProfileRequest } from '../domain/models/profile.model';
import { ProfilePort } from '../domain/ports/profile.port';
import { UpdateProfileUseCase } from './update-profile.use-case';

// JWT with payload { sub: '42' }
const fakeJwtPayload = btoa(JSON.stringify({ sub: '42' })).replace(/=/g, '');
const fakeToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${fakeJwtPayload}.fake-sig`;

const mockProfile: Profile = {
  id: 42,
  name: 'Updated Name',
  email: 'updated@example.com',
  provider: 'local',
  rol: 'usuario',
};

describe('UpdateProfileUseCase', () => {
  let useCase: UpdateProfileUseCase;

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
        UpdateProfileUseCase,
        { provide: ProfilePort, useValue: mockProfilePort },
        { provide: TokenStoragePort, useValue: mockTokenStorage },
      ],
    });

    useCase = TestBed.inject(UpdateProfileUseCase);
  });

  it('decodes JWT sub and calls profilePort.updateProfile with userId and dto', () => {
    const dto: UpdateProfileRequest = { name: 'Updated Name', email: 'updated@example.com' };
    mockProfilePort.updateProfile.mockReturnValue(of(mockProfile));

    useCase.execute(dto).subscribe();

    expect(mockProfilePort.updateProfile).toHaveBeenCalledWith(42, dto);
  });

  it('returns the updated Profile observable from the port', () => {
    const dto: UpdateProfileRequest = { name: 'Updated Name', email: 'updated@example.com' };
    mockProfilePort.updateProfile.mockReturnValue(of(mockProfile));

    let result: Profile | undefined;
    useCase.execute(dto).subscribe((p) => {
      result = p;
    });

    expect(result).toEqual(mockProfile);
  });

  it('includes password in dto for local provider when provided', () => {
    const dto: UpdateProfileRequest = { name: 'Name', email: 'x@x.com', password: 'newPass123' };
    mockProfilePort.updateProfile.mockReturnValue(of(mockProfile));

    useCase.execute(dto).subscribe();

    expect(mockProfilePort.updateProfile).toHaveBeenCalledWith(42, dto);
    const calledWith = mockProfilePort.updateProfile.mock.calls[0][1] as UpdateProfileRequest;
    expect(calledWith.password).toBe('newPass123');
  });

  it('propagates an error when no access token is stored', () => {
    mockTokenStorage.accessToken.mockReturnValue(null);

    let caughtError: unknown;
    useCase.execute({ name: 'Name' }).subscribe({
      error: (err) => {
        caughtError = err;
      },
    });

    expect(caughtError).toBeInstanceOf(Error);
    expect(mockProfilePort.updateProfile).not.toHaveBeenCalled();
  });
});
