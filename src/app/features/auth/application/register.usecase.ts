import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { map, tap } from 'rxjs';

import type { RegisterRequest, User } from '../domain/models/auth.model';
import { AuthPort } from '../domain/ports/auth.port';
import { TokenStoragePort } from '../domain/ports/token-storage.port';

@Injectable()
export class RegisterUseCase {
  private readonly authPort = inject(AuthPort);
  private readonly tokenStorage = inject(TokenStoragePort);

  execute(request: RegisterRequest): Observable<User> {
    return this.authPort.register(request).pipe(
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
