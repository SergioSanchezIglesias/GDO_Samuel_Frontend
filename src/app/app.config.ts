import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { catchError, firstValueFrom, of, tap } from 'rxjs';

import type { AuthTokens } from './features/auth/domain/models/auth.model';
import { TokenStoragePort } from './features/auth/domain/ports/token-storage.port';
import { TokenStorageAdapter } from './features/auth/infrastructure/adapters/token-storage.adapter';
import { API_URL } from './core/config/api.config';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: TokenStoragePort, useExisting: TokenStorageAdapter },
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const tokenStorage = inject(TokenStoragePort);
        const http = inject(HttpClient);
        const apiUrl = inject(API_URL);

        return () => {
          const refreshToken = tokenStorage.getRefreshToken();

          if (!refreshToken) {
            return;
          }

          return firstValueFrom(
            http.post<AuthTokens>(`${apiUrl}/auth/refresh`, { refreshToken }).pipe(
              tap((tokens) => tokenStorage.saveTokens(tokens)),
              catchError(() => {
                tokenStorage.clearTokens();
                return of(undefined);
              }),
            ),
          );
        };
      },
      multi: true,
    },
  ],
};
