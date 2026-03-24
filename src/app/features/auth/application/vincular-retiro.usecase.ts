import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs';

import type { AuthTokens } from '../domain/models/auth.model';
import { AuthPort } from '../domain/ports/auth.port';
import { TokenStoragePort } from '../domain/ports/token-storage.port';

@Injectable()
export class VincularRetiroUseCase {
  private readonly authPort = inject(AuthPort);
  private readonly tokenStorage = inject(TokenStoragePort);

  execute(codigo: string): Observable<AuthTokens> {
    return this.authPort.vincularRetiro(codigo).pipe(
      tap((tokens) => this.tokenStorage.saveTokens(tokens)),
    );
  }
}
