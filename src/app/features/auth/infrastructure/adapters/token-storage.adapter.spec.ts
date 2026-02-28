import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { API_URL } from '../../../../core/config/api.config';
import type { AuthTokens } from '../../domain/models/auth.model';
import { TokenStorageAdapter } from './token-storage.adapter';

describe('TokenStorageAdapter', () => {
  let adapter: TokenStorageAdapter;
  let httpTesting: HttpTestingController;
  const fakeApiUrl = 'http://test-api.com';

  let store: Record<string, string>;

  beforeEach(() => {
    vi.useFakeTimers();

    store = {};

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key];
        }),
        clear: vi.fn(() => {
          store = {};
        }),
        get length() {
          return Object.keys(store).length;
        },
        key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
      },
      writable: true,
      configurable: true,
    });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        TokenStorageAdapter,
        { provide: API_URL, useValue: fakeApiUrl },
      ],
    });

    adapter = TestBed.inject(TokenStorageAdapter);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should store access token in memory and refresh token in localStorage', () => {
    const tokens: AuthTokens = {
      accessToken: 'access-123',
      refreshToken: 'refresh-456',
    };

    adapter.saveTokens(tokens);

    expect(adapter.accessToken()).toBe('access-123');
    expect(localStorage.setItem).toHaveBeenCalledWith('gdo_refresh_token', 'refresh-456');
  });

  it('should return refresh token from localStorage', () => {
    store['gdo_refresh_token'] = 'stored-refresh';

    const result = adapter.getRefreshToken();

    expect(result).toBe('stored-refresh');
    expect(localStorage.getItem).toHaveBeenCalledWith('gdo_refresh_token');
  });

  it('should set access token to null and remove refresh token on clearTokens', () => {
    adapter.saveTokens({ accessToken: 'token', refreshToken: 'refresh' });
    expect(adapter.accessToken()).toBe('token');

    adapter.clearTokens();

    expect(adapter.accessToken()).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalledWith('gdo_refresh_token');
  });

  it('should return true for isAuthenticated when access token exists', () => {
    adapter.saveTokens({ accessToken: 'token', refreshToken: 'refresh' });

    expect(adapter.isAuthenticated()).toBe(true);
  });

  it('should return false for isAuthenticated when no access token', () => {
    expect(adapter.isAuthenticated()).toBe(false);
  });

  it('should return false for isAuthenticated after clearTokens', () => {
    adapter.saveTokens({ accessToken: 'token', refreshToken: 'refresh' });
    adapter.clearTokens();

    expect(adapter.isAuthenticated()).toBe(false);
  });

  it('should have readonly accessToken that reflects internal state', () => {
    expect(adapter.accessToken()).toBeNull();

    adapter.saveTokens({ accessToken: 'new-token', refreshToken: 'refresh' });

    expect(adapter.accessToken()).toBe('new-token');
  });

  it('should schedule a proactive refresh timer on saveTokens', () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

    adapter.saveTokens({ accessToken: 'token', refreshToken: 'refresh' });

    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 780_000);
  });

  it('should cancel the proactive refresh timer on clearTokens', () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

    adapter.saveTokens({ accessToken: 'token', refreshToken: 'refresh' });
    adapter.clearTokens();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('should make a refresh HTTP call when the proactive timer fires', () => {
    store['gdo_refresh_token'] = 'refresh-token-value';

    adapter.saveTokens({ accessToken: 'token', refreshToken: 'refresh-token-value' });

    vi.advanceTimersByTime(780_000);

    const req = httpTesting.expectOne(`${fakeApiUrl}/auth/refresh`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ refreshToken: 'refresh-token-value' });

    req.flush({ accessToken: 'new-access', refreshToken: 'new-refresh' });
  });

  it('should clear tokens when proactive refresh fails', () => {
    store['gdo_refresh_token'] = 'refresh-token-value';

    adapter.saveTokens({ accessToken: 'token', refreshToken: 'refresh-token-value' });

    vi.advanceTimersByTime(780_000);

    const req = httpTesting.expectOne(`${fakeApiUrl}/auth/refresh`);
    req.flush('error', { status: 500, statusText: 'Server Error' });

    expect(adapter.accessToken()).toBeNull();
  });

  it('should clear tokens when no refresh token available at timer fire', () => {
    adapter.saveTokens({ accessToken: 'token', refreshToken: 'refresh' });

    // Clear the store so getRefreshToken returns null at timer fire
    delete store['gdo_refresh_token'];

    vi.advanceTimersByTime(780_000);

    expect(adapter.accessToken()).toBeNull();
  });
});
