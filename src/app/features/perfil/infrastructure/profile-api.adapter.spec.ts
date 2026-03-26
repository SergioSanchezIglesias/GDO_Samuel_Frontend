import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { API_URL } from '../../../core/config/api.config';
import type { Profile, UpdateProfileRequest } from '../domain/models/profile.model';
import { ProfilePort } from '../domain/ports/profile.port';
import { ProfileApiAdapter } from './profile-api.adapter';

const fakeApiUrl = 'http://test-api.com';

const mockProfile: Profile = {
  id: 10,
  name: 'Test User',
  email: 'test@example.com',
  provider: 'local',
  rol: 'usuario',
};

describe('ProfileApiAdapter', () => {
  let adapter: ProfileApiAdapter;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ProfilePort, useClass: ProfileApiAdapter },
        { provide: API_URL, useValue: fakeApiUrl },
      ],
    });

    adapter = TestBed.inject(ProfilePort) as ProfileApiAdapter;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('getProfile', () => {
    it('sends GET to /usuarios/:id', () => {
      adapter.getProfile(10).subscribe((res) => {
        expect(res).toEqual(mockProfile);
      });

      const req = httpTesting.expectOne(`${fakeApiUrl}/usuarios/10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProfile);
    });

    it('uses the correct user id in the URL', () => {
      adapter.getProfile(99).subscribe();

      const req = httpTesting.expectOne(`${fakeApiUrl}/usuarios/99`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProfile);
    });
  });

  describe('updateProfile', () => {
    it('sends PATCH to /usuarios/:id with the dto body', () => {
      const dto: UpdateProfileRequest = { name: 'New Name', email: 'new@example.com' };
      const updatedProfile: Profile = { ...mockProfile, name: 'New Name', email: 'new@example.com' };

      adapter.updateProfile(10, dto).subscribe((res) => {
        expect(res).toEqual(updatedProfile);
      });

      const req = httpTesting.expectOne(`${fakeApiUrl}/usuarios/10`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(dto);
      req.flush(updatedProfile);
    });

    it('uses the correct user id in the PATCH URL', () => {
      const dto: UpdateProfileRequest = { name: 'Other User' };

      adapter.updateProfile(42, dto).subscribe();

      const req = httpTesting.expectOne(`${fakeApiUrl}/usuarios/42`);
      expect(req.request.method).toBe('PATCH');
      req.flush(mockProfile);
    });
  });
});
