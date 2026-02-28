import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { map, tap } from 'rxjs';

import type { LoginRequest, User } from '../domain/models/auth.model';
import { AuthPort } from '../domain/ports/auth.port';
import { TokenStoragePort } from '../domain/ports/token-storage.port';

@Injectable()
export class LoginUseCase {
  private readonly authPort = inject(AuthPort);
  private readonly tokenStorage = inject(TokenStoragePort);

  execute(request: LoginRequest): Observable<User> {
    return this.authPort.login(request).pipe(
      tap((response) =>
        this.tokenStorage.saveTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        }),
      ),
      map((response) => response.user),
    );
  }
}
