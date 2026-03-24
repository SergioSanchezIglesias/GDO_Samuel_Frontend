import { signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { UserRole } from '../../domain/models/auth.model';
import { TokenStoragePort } from '../../domain/ports/token-storage.port';
import { CallbackComponent } from './callback';

// Build a JWT-shaped token with a custom payload for testing
function buildJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe('CallbackComponent', () => {
  const mockTokenStorage = {
    accessToken: signal<string | null>(null),
    isAuthenticated: signal(false),
    userRole: signal<UserRole | null>(null),
    idRetiro: signal<number | null>(null),
    saveTokens: vi.fn(),
    getRefreshToken: vi.fn(),
    clearTokens: vi.fn(),
  };

  function setHash(hash: string): void {
    Object.defineProperty(window, 'location', {
      value: { hash, pathname: '/auth/callback' },
      writable: true,
      configurable: true,
    });
  }

  async function setup(): Promise<{ router: Router; fixture: ComponentFixture<CallbackComponent> }> {
    await TestBed.configureTestingModule({
      imports: [CallbackComponent],
      providers: [
        provideRouter([
          { path: 'dashboard', component: CallbackComponent },
          { path: 'auth/login', component: CallbackComponent },
          { path: 'auth/vincular-retiro', component: CallbackComponent },
        ]),
        { provide: TokenStoragePort, useValue: mockTokenStorage },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    vi.spyOn(window.history, 'replaceState');

    const fixture = TestBed.createComponent(CallbackComponent);

    return { router, fixture };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('success with idRetiro — saves tokens and navigates to /dashboard', async () => {
    const jwt = buildJwt({
      sub: '1',
      email: 'user@test.com',
      rol: 'usuario',
      iat: 0,
      exp: 9999999999,
      idRetiro: 5,
    });
    setHash(`#access_token=${jwt}&refresh_token=RT&expires_in=900`);

    const { router } = await setup();

    expect(window.history.replaceState).toHaveBeenCalledWith(null, '', '/auth/callback');
    expect(mockTokenStorage.saveTokens).toHaveBeenCalledWith({
      accessToken: jwt,
      refreshToken: 'RT',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('success without idRetiro — navigates to /auth/vincular-retiro', async () => {
    const jwt = buildJwt({
      sub: '1',
      email: 'user@test.com',
      rol: 'usuario',
      iat: 0,
      exp: 9999999999,
    });
    setHash(`#access_token=${jwt}&refresh_token=RT`);

    const { router } = await setup();

    expect(mockTokenStorage.saveTokens).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/vincular-retiro']);
  });

  it('error email_conflict — shows correct message and redirects after 3s', async () => {
    setHash('#error=email_conflict');

    const { router, fixture } = await setup();
    const component = fixture.componentInstance;

    // replaceState called
    expect(window.history.replaceState).toHaveBeenCalled();
    // saveTokens NOT called
    expect(mockTokenStorage.saveTokens).not.toHaveBeenCalled();
    // error message set
    expect(component.errorMessage()).toContain('ya está registrado');
    // not yet redirected to login
    expect(router.navigate).not.toHaveBeenCalled();
    // advance 3 seconds
    vi.advanceTimersByTime(3000);
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('error google_auth_failed — shows generic message and redirects after 3s', async () => {
    setHash('#error=google_auth_failed');

    const { router, fixture } = await setup();
    const component = fixture.componentInstance;

    expect(component.errorMessage()).toContain('Error al iniciar sesión con Google');
    expect(mockTokenStorage.saveTokens).not.toHaveBeenCalled();
    vi.advanceTimersByTime(3000);
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('empty fragment — navigates immediately to /auth/login without saving tokens', async () => {
    setHash('');

    const { router } = await setup();

    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    expect(mockTokenStorage.saveTokens).not.toHaveBeenCalled();
  });

  it('fragment cleaned (replaceState) before any token storage or navigation', async () => {
    const jwt = buildJwt({ sub: '1', email: 'u@t.com', rol: 'usuario', iat: 0, exp: 9999999999 });
    setHash(`#access_token=${jwt}&refresh_token=RT`);

    await setup();

    const replaceStateOrder = (window.history.replaceState as ReturnType<typeof vi.spyOn>).mock
      .invocationCallOrder[0];
    const saveTokensOrder = (mockTokenStorage.saveTokens as ReturnType<typeof vi.spyOn>).mock
      .invocationCallOrder[0];

    expect(replaceStateOrder).toBeLessThan(saveTokensOrder);
  });

  it('missing refresh_token — navigates to /auth/login without saving tokens', async () => {
    const jwt = buildJwt({ sub: '1', email: 'u@t.com', rol: 'usuario', iat: 0, exp: 9999999999 });
    setHash(`#access_token=${jwt}`);

    const { router } = await setup();

    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    expect(mockTokenStorage.saveTokens).not.toHaveBeenCalled();
  });
});
