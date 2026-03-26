import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { decodeJwtPayload } from '../../../../core/utils/jwt-decode';
import { TokenStoragePort } from '../../domain/ports/token-storage.port';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.html',
  styleUrl: './callback.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallbackComponent {
  private readonly tokenStorage = inject(TokenStoragePort);
  private readonly router = inject(Router);

  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  constructor() {
    const fragment = window.location.hash.substring(1);
    window.history.replaceState(null, '', window.location.pathname);

    if (!fragment) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const params = new URLSearchParams(fragment);
    const error = params.get('error');

    if (error) {
      this.isLoading.set(false);
      this.errorMessage.set(this.getErrorMessage(error));
      setTimeout(() => this.router.navigate(['/auth/login']), 3000);
      return;
    }

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.tokenStorage.saveTokens({ accessToken, refreshToken });

    const payload = decodeJwtPayload(accessToken);
    const destination = payload?.idRetiro ? '/dashboard' : '/auth/vincular-retiro';
    this.router.navigate([destination]);
  }

  private getErrorMessage(error: string): string {
    const messages: Record<string, string> = {
      email_conflict: 'Este email ya está registrado con contraseña',
      google_auth_failed: 'Error al iniciar sesión con Google. Inténtalo de nuevo.',
    };
    return messages[error] ?? 'Error inesperado. Redirigiendo...';
  }
}
