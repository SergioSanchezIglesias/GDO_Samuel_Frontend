import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthPort } from '../domain/ports/auth.port';
import { TokenStoragePort } from '../domain/ports/token-storage.port';

@Injectable()
export class LogoutUseCase {
  private readonly authPort = inject(AuthPort);
  private readonly tokenStorage = inject(TokenStoragePort);
  private readonly router = inject(Router);

  execute(): void {
    this.authPort
      .logout()
      .pipe(
        finalize(() => {
          this.tokenStorage.clearTokens();
          void this.router.navigate(['/auth/login']);
        }),
      )
      .subscribe();
  }
}
