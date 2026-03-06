import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  model,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { ButtonComponent } from '../../../../ui/components/button/button';
import { InputComponent } from '../../../../ui/components/input/input';
import { ScreenHeaderComponent } from '../../../../ui/components/screen-header/screen-header';
import { CreateRetiroUseCase } from '../../application/create-retiro.usecase';

@Component({
  selector: 'app-crear-retiro',
  imports: [ScreenHeaderComponent, InputComponent, ButtonComponent],
  templateUrl: './crear-retiro.html',
  styleUrl: './crear-retiro.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearRetiroComponent {
  private readonly createRetiroUseCase = inject(CreateRetiroUseCase);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly fechaInicio = model('');
  readonly fechaFin = model('');
  readonly ubicacion = model('');
  readonly loading = signal(false);
  readonly error = signal('');

  readonly isFormValid = computed(
    () =>
      this.fechaInicio() !== '' &&
      this.fechaFin() !== '' &&
      this.ubicacion() !== '' &&
      this.fechaFin() >= this.fechaInicio(),
  );

  onSubmit(): void {
    if (!this.isFormValid()) return;

    this.loading.set(true);
    this.error.set('');

    this.createRetiroUseCase
      .execute({
        fechaInicio: this.fechaInicio(),
        fechaFin: this.fechaFin(),
        ubicacion: this.ubicacion(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (retiro) => {
          this.router.navigate(['/retiros/creado', retiro.id]);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Error al crear el retiro. Inténtalo de nuevo.');
        },
      });
  }
}
