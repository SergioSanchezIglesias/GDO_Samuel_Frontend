import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { API_URL } from '../../../../core/config/api.config';
import { ButtonComponent } from '../../../../ui/components/button/button';
import { InputComponent } from '../../../../ui/components/input/input';
import { TextLinkComponent } from '../../../../ui/components/text-link/text-link';
import { LoginUseCase } from '../../application/login.usecase';
import { TokenStoragePort } from '../../domain/ports/token-storage.port';
import { AuthLayoutComponent } from '../components/auth-layout/auth-layout';

@Component({
  selector: 'app-login',
  imports: [AuthLayoutComponent, InputComponent, ButtonComponent, TextLinkComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly loginUseCase = inject(LoginUseCase);
  private readonly tokenStorage = inject(TokenStoragePort);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly apiUrl = inject(API_URL);

  readonly email = signal('');
  readonly password = signal('');
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly emailError = computed(() => {
    const v = this.email();
    if (!v) return '';
    return v.includes('@') ? '' : 'Email no válido';
  });

  readonly passwordError = computed(() => {
    const v = this.password();
    if (!v) return '';
    return v.length >= 8 ? '' : 'Mínimo 8 caracteres';
  });

  readonly isFormValid = computed(
    () =>
      this.email() !== '' &&
      this.password() !== '' &&
      !this.emailError() &&
      !this.passwordError(),
  );

  onGoogleLogin(): void {
    window.location.href = `${this.apiUrl}/auth/google`;
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    this.loading.set(true);
    this.errorMessage.set('');

    this.loginUseCase
      .execute({
        email: this.email(),
        password: this.password(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const idRetiro = this.tokenStorage.idRetiro();
          if (idRetiro === null) {
            this.router.navigate(['/auth/vincular-retiro']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          this.loading.set(false);
          if (err.status === 401) {
            this.errorMessage.set('Credenciales inválidas');
          } else {
            this.errorMessage.set('Error del servidor. Inténtalo de nuevo.');
          }
        },
      });
  }
}
