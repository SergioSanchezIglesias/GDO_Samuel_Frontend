import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { API_URL } from '../../../../core/config/api.config';
import type { LoginRequest, RegisterRequest } from '../../domain/models/auth.model';
import { AuthPort } from '../../domain/ports/auth.port';
import { AuthApiAdapter } from './auth-api.adapter';

describe('AuthApiAdapter', () => {
  let adapter: AuthApiAdapter;
  let httpTesting: HttpTestingController;
  const fakeApiUrl = 'http://test-api.com';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthPort, useClass: AuthApiAdapter },
        { provide: API_URL, useValue: fakeApiUrl },
      ],
    });

    adapter = TestBed.inject(AuthPort) as AuthApiAdapter;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should send POST to /auth/login with correct body', () => {
    const loginRequest: LoginRequest = {
      email: 'test@example.com',
      password: 'password123',
      codigoRetiro: '123456',
    };
    const mockResponse = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: 1, name: 'Test', email: 'test@example.com', provider: 'local' as const },
    };

    adapter.login(loginRequest).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTesting.expectOne(`${fakeApiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(loginRequest);
    req.flush(mockResponse);
  });

  it('should send POST to /auth/register with correct body', () => {
    const registerRequest: RegisterRequest = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };
    const mockResponse = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: 1, name: 'Test User', email: 'test@example.com', provider: 'local' as const },
    };

    adapter.register(registerRequest).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTesting.expectOne(`${fakeApiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(registerRequest);
    req.flush(mockResponse);
  });

  it('should send POST to /auth/refresh with refreshToken in body', () => {
    const mockTokens = {
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    };

    adapter.refresh('old-refresh-token').subscribe((tokens) => {
      expect(tokens).toEqual(mockTokens);
    });

    const req = httpTesting.expectOne(`${fakeApiUrl}/auth/refresh`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ refreshToken: 'old-refresh-token' });
    req.flush(mockTokens);
  });

  it('should send POST to /auth/logout with empty body', () => {
    adapter.logout().subscribe();

    const req = httpTesting.expectOne(`${fakeApiUrl}/auth/logout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush(null);
  });
});
