import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { ButtonComponent } from '../../../../ui/components/button/button';
import { InputComponent } from '../../../../ui/components/input/input';
import { VincularRetiroUseCase } from '../../application/vincular-retiro.usecase';
import { TokenStoragePort } from '../../domain/ports/token-storage.port';
import { AuthLayoutComponent } from '../components/auth-layout/auth-layout';

@Component({
  selector: 'app-vincular-retiro',
  imports: [AuthLayoutComponent, InputComponent, ButtonComponent],
  templateUrl: './vincular-retiro.html',
  styleUrl: './vincular-retiro.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VincularRetiroComponent {
  protected readonly tokenStorage = inject(TokenStoragePort);
  private readonly vincularRetiroUseCase = inject(VincularRetiroUseCase);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly codigo = signal('');
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly codigoError = computed(() => {
    const v = this.codigo();
    if (!v) return '';
    return /^\d{6}$/.test(v) ? '' : 'Debe ser 6 dígitos';
  });

  readonly isFormValid = computed(() => this.codigo() !== '' && !this.codigoError());

  onSubmit(): void {
    if (!this.isFormValid()) return;

    this.loading.set(true);
    this.errorMessage.set('');

    this.vincularRetiroUseCase
      .execute(this.codigo())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => {
          this.loading.set(false);
          if (err.status === 401) {
            this.errorMessage.set('Código inválido');
          } else {
            this.errorMessage.set('Error del servidor. Inténtalo de nuevo.');
          }
        },
      });
  }

  onSkip(): void {
    this.router.navigate(['/dashboard']);
  }
}
