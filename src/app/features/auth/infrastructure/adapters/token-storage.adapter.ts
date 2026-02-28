import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';

import { API_URL } from '../../../../core/config/api.config';
import type { AuthTokens } from '../../domain/models/auth.model';
import { TokenStoragePort } from '../../domain/ports/token-storage.port';

const REFRESH_TOKEN_KEY = 'gdo_refresh_token';
const PROACTIVE_REFRESH_MS = 780_000; // ~13 minutes

@Injectable({ providedIn: 'root' })
export class TokenStorageAdapter extends TokenStoragePort {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  private readonly _accessToken = signal<string | null>(null);
  private refreshTimerId: ReturnType<typeof setTimeout> | null = null;

  readonly accessToken = this._accessToken.asReadonly();
  readonly isAuthenticated = computed(() => this._accessToken() !== null);

  saveTokens(tokens: AuthTokens): void {
    this._accessToken.set(tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    this.scheduleProactiveRefresh();
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    this.cancelProactiveRefresh();
    this._accessToken.set(null);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  private scheduleProactiveRefresh(): void {
    this.cancelProactiveRefresh();

    this.refreshTimerId = setTimeout(() => {
      const refreshToken = this.getRefreshToken();

      if (!refreshToken) {
        this.clearTokens();
        return;
      }

      this.http
        .post<AuthTokens>(`${this.apiUrl}/auth/refresh`, { refreshToken })
        .subscribe({
          next: (tokens) => this.saveTokens(tokens),
          error: () => this.clearTokens(),
        });
    }, PROACTIVE_REFRESH_MS);
  }

  private cancelProactiveRefresh(): void {
    if (this.refreshTimerId !== null) {
      clearTimeout(this.refreshTimerId);
      this.refreshTimerId = null;
    }
  }
}
