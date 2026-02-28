import type { Signal } from '@angular/core';

import type { AuthTokens } from '../models/auth.model';

export abstract class TokenStoragePort {
  abstract readonly accessToken: Signal<string | null>;
  abstract readonly isAuthenticated: Signal<boolean>;

  abstract saveTokens(tokens: AuthTokens): void;
  abstract getRefreshToken(): string | null;
  abstract clearTokens(): void;
}
