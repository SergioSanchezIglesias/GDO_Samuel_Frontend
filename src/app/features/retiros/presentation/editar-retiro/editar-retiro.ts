import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  model,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonComponent } from '../../../../ui/components/button/button';
import { InputComponent } from '../../../../ui/components/input/input';
import { ScreenHeaderComponent } from '../../../../ui/components/screen-header/screen-header';
import { GetRetiroUseCase } from '../../application/get-retiro.usecase';
import { UpdateRetiroUseCase } from '../../application/update-retiro.usecase';
import { formatDateForInput } from '../../../../core/utils/date-format';

@Component({
  selector: 'app-editar-retiro',
  imports: [ScreenHeaderComponent, InputComponent, ButtonComponent],
  templateUrl: './editar-retiro.html',
  styleUrl: './editar-retiro.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditarRetiroComponent {
  private readonly getRetiroUseCase = inject(GetRetiroUseCase);
  private readonly updateRetiroUseCase = inject(UpdateRetiroUseCase);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');

  readonly fechaInicio = model('');
  readonly fechaFin = model('');
  readonly ubicacion = model('');

  readonly isFormValid = computed(
    () =>
      this.fechaInicio() !== '' &&
      this.fechaFin() !== '' &&
      this.ubicacion() !== '' &&
      this.fechaFin() >= this.fechaInicio(),
  );

  constructor() {
    effect(() => {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (!id) return;
      this.loadRetiro(id);
    });
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.saving.set(true);
    this.error.set('');

    this.updateRetiroUseCase
      .execute(id, {
        fechaInicio: this.fechaInicio(),
        fechaFin: this.fechaFin(),
        ubicacion: this.ubicacion(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.router.navigate(['/retiros', id]);
        },
        error: () => {
          this.saving.set(false);
          this.error.set('Error al guardar los cambios. Inténtalo de nuevo.');
        },
      });
  }

  private loadRetiro(id: number): void {
    this.loading.set(true);
    this.error.set('');

    this.getRetiroUseCase
      .execute(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (retiro) => {
          this.fechaInicio.set(formatDateForInput(retiro.fechaInicio));
          this.fechaFin.set(formatDateForInput(retiro.fechaFin));
          this.ubicacion.set(retiro.ubicacion);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Error al cargar el retiro.');
          this.loading.set(false);
        },
      });
  }
}
