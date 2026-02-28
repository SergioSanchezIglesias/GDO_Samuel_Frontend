import { HttpClient, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import type { AuthTokens } from '../../features/auth/domain/models/auth.model';
import { TokenStoragePort } from '../../features/auth/domain/ports/token-storage.port';
import { API_URL } from '../config/api.config';

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'] as const;

function isAuthEndpoint(url: string): boolean {
  return AUTH_PATHS.some((path) => url.includes(path));
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStoragePort);
  const http = inject(HttpClient);
  const apiUrl = inject(API_URL);

  if (isAuthEndpoint(req.url)) {
    return next(req);
  }

  const token = tokenStorage.accessToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        tokenStorage.clearTokens();
        return throwError(() => error);
      }

      return http.post<AuthTokens>(`${apiUrl}/auth/refresh`, { refreshToken }).pipe(
        switchMap((tokens) => {
          tokenStorage.saveTokens(tokens);
          const retryReq = req.clone({
            setHeaders: { Authorization: `Bearer ${tokens.accessToken}` },
          });
          return next(retryReq);
        }),
        catchError((refreshError) => {
          tokenStorage.clearTokens();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
