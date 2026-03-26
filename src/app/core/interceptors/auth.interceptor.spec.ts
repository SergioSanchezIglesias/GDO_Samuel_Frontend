import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TokenStoragePort } from '../../features/auth/domain/ports/token-storage.port';
import { API_URL } from '../config/api.config';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let router: Router;
  const fakeApiUrl = 'http://test-api.com';

  const mockTokenStorage = {
    accessToken: vi.fn<() => string | null>(() => null),
    isAuthenticated: vi.fn<() => boolean>(() => false),
    idRetiro: vi.fn<() => number | null>(() => null),
    saveTokens: vi.fn(),
    getRefreshToken: vi.fn<() => string | null>(() => null),
    clearTokens: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: TokenStoragePort, useValue: mockTokenStorage },
        { provide: API_URL, useValue: fakeApiUrl },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should attach Bearer token to non-auth requests when token exists', () => {
    mockTokenStorage.accessToken.mockReturnValue('my-token');

    http.get(`${fakeApiUrl}/users`).subscribe();

    const req = httpTesting.expectOne(`${fakeApiUrl}/users`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    req.flush([]);
  });

  it('should NOT attach Bearer token when no token exists', () => {
    mockTokenStorage.accessToken.mockReturnValue(null);

    http.get(`${fakeApiUrl}/users`).subscribe();

    const req = httpTesting.expectOne(`${fakeApiUrl}/users`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('should NOT attach Bearer token to /auth/login endpoint', () => {
    mockTokenStorage.accessToken.mockReturnValue('my-token');

    http.post(`${fakeApiUrl}/auth/login`, {}).subscribe();

    const req = httpTesting.expectOne(`${fakeApiUrl}/auth/login`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should NOT attach Bearer token to /auth/register endpoint', () => {
    mockTokenStorage.accessToken.mockReturnValue('my-token');

    http.post(`${fakeApiUrl}/auth/register`, {}).subscribe();

    const req = httpTesting.expectOne(`${fakeApiUrl}/auth/register`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should NOT attach Bearer token to /auth/refresh endpoint', () => {
    mockTokenStorage.accessToken.mockReturnValue('my-token');

    http.post(`${fakeApiUrl}/auth/refresh`, {}).subscribe();

    const req = httpTesting.expectOne(`${fakeApiUrl}/auth/refresh`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should attempt token refresh on 401 response', () => {
    mockTokenStorage.accessToken.mockReturnValue('expired-token');
    mockTokenStorage.getRefreshToken.mockReturnValue('refresh-token');

    http.get(`${fakeApiUrl}/users`).subscribe({
      error: () => {
        // expected if refresh also fails
      },
    });

    const originalReq = httpTesting.expectOne(`${fakeApiUrl}/users`);
    originalReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpTesting.expectOne(`${fakeApiUrl}/auth/refresh`);
    expect(refreshReq.request.method).toBe('POST');
    expect(refreshReq.request.body).toEqual({ refreshToken: 'refresh-token' });
    refreshReq.flush({ accessToken: 'new-access', refreshToken: 'new-refresh' });

    const retryReq = httpTesting.expectOne(`${fakeApiUrl}/users`);
    expect(retryReq.request.headers.get('Authorization')).toBe('Bearer new-access');
    retryReq.flush([]);
  });

  it('should retry original request with new token after successful refresh', () => {
    mockTokenStorage.accessToken.mockReturnValue('expired-token');
    mockTokenStorage.getRefreshToken.mockReturnValue('refresh-token');

    let responseData: unknown;
    http.get(`${fakeApiUrl}/data`).subscribe((data) => {
      responseData = data;
    });

    const originalReq = httpTesting.expectOne(`${fakeApiUrl}/data`);
    originalReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpTesting.expectOne(`${fakeApiUrl}/auth/refresh`);
    refreshReq.flush({ accessToken: 'refreshed-token', refreshToken: 'new-refresh' });

    expect(mockTokenStorage.saveTokens).toHaveBeenCalledWith({
      accessToken: 'refreshed-token',
      refreshToken: 'new-refresh',
    });

    const retryReq = httpTesting.expectOne(`${fakeApiUrl}/data`);
    retryReq.flush({ result: 'success' });

    expect(responseData).toEqual({ result: 'success' });
  });

  it('should clear tokens and propagate error on failed refresh', () => {
    mockTokenStorage.accessToken.mockReturnValue('expired-token');
    mockTokenStorage.getRefreshToken.mockReturnValue('refresh-token');

    let caughtError: unknown;
    http.get(`${fakeApiUrl}/users`).subscribe({
      error: (err) => {
        caughtError = err;
      },
    });

    const originalReq = httpTesting.expectOne(`${fakeApiUrl}/users`);
    originalReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpTesting.expectOne(`${fakeApiUrl}/auth/refresh`);
    refreshReq.flush('Refresh failed', { status: 403, statusText: 'Forbidden' });

    expect(mockTokenStorage.clearTokens).toHaveBeenCalled();
    expect(caughtError).toBeDefined();
  });

  it('should clear tokens on 401 when no refresh token available', () => {
    mockTokenStorage.accessToken.mockReturnValue('expired-token');
    mockTokenStorage.getRefreshToken.mockReturnValue(null);

    let caughtError: unknown;
    http.get(`${fakeApiUrl}/users`).subscribe({
      error: (err) => {
        caughtError = err;
      },
    });

    const originalReq = httpTesting.expectOne(`${fakeApiUrl}/users`);
    originalReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(mockTokenStorage.clearTokens).toHaveBeenCalled();
    expect(caughtError).toBeDefined();
  });

  it('should navigate to /dashboard on 403 response', async () => {
    mockTokenStorage.accessToken.mockReturnValue('valid-token');
    const navigateSpy = vi.spyOn(router, 'navigate');

    let caughtError: unknown;
    http.get(`${fakeApiUrl}/admin/resource`).subscribe({
      error: (err) => {
        caughtError = err;
      },
    });

    const req = httpTesting.expectOne(`${fakeApiUrl}/admin/resource`);
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    expect(caughtError).toBeDefined();
  });

  it('should NOT clear tokens on 403 response', () => {
    mockTokenStorage.accessToken.mockReturnValue('valid-token');

    http.get(`${fakeApiUrl}/admin/resource`).subscribe({ error: () => {} });

    const req = httpTesting.expectOne(`${fakeApiUrl}/admin/resource`);
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(mockTokenStorage.clearTokens).not.toHaveBeenCalled();
  });

  it('should NOT attempt token refresh on 403 response', () => {
    mockTokenStorage.accessToken.mockReturnValue('valid-token');
    mockTokenStorage.getRefreshToken.mockReturnValue('refresh-token');

    http.get(`${fakeApiUrl}/admin/resource`).subscribe({ error: () => {} });

    const req = httpTesting.expectOne(`${fakeApiUrl}/admin/resource`);
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    httpTesting.expectNone(`${fakeApiUrl}/auth/refresh`);
  });

  it('should NOT navigate on 403 when already on /dashboard', async () => {
    mockTokenStorage.accessToken.mockReturnValue('valid-token');
    const navigateSpy = vi.spyOn(router, 'navigate');

    // Simulate being already on /dashboard
    Object.defineProperty(router, 'url', { get: () => '/dashboard', configurable: true });

    http.get(`${fakeApiUrl}/admin/resource`).subscribe({ error: () => {} });

    const req = httpTesting.expectOne(`${fakeApiUrl}/admin/resource`);
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
