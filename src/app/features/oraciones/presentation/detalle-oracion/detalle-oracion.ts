import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { GetOracionByIdUseCase } from '../../application/get-oracion-by-id.use-case';
import { GetRetiroInfoUseCase } from '../../application/get-retiro-info.use-case';
import type { Oracion } from '../../domain/models/oracion.model';
import type { RetiroInfo } from '../../domain/models/retiro-info.model';
import { ScreenHeaderComponent } from '../../../../ui/components/screen-header/screen-header';
import { ActivityGridComponent } from '../shared/activity-grid/activity-grid';

@Component({
  selector: 'app-detalle-oracion',
  imports: [ScreenHeaderComponent, ActivityGridComponent],
  templateUrl: './detalle-oracion.html',
  styleUrl: './detalle-oracion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleOracionComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly getOracionByIdUseCase = inject(GetOracionByIdUseCase);
  private readonly getRetiroInfoUseCase = inject(GetRetiroInfoUseCase);
  private readonly destroyRef = inject(DestroyRef);

  readonly oracion = signal<Oracion | null>(null);
  readonly retiroInfo = signal<RetiroInfo | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (isNaN(id)) {
      this.error.set('Identificador de registro inválido.');
      this.isLoading.set(false);
      return;
    }

    this.getOracionByIdUseCase
      .execute(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (oracion) => {
          this.oracion.set(oracion);
          this.isLoading.set(false);
          this.loadRetiroInfo(oracion.retiroId);
        },
        error: () => {
          this.error.set('Error al cargar el registro. Inténtalo de nuevo.');
          this.isLoading.set(false);
        },
      });
  }

  getHeaderTitle(): string {
    const retiro = this.retiroInfo();
    if (retiro) {
      const date = new Date(retiro.fechaInicio);
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${retiro.ubicacion} - ${dd}/${mm}/${yyyy}`;
    }
    const oracion = this.oracion();
    return oracion ? `Registro #${oracion.id}` : 'Detalle';
  }

  private loadRetiroInfo(retiroId: number): void {
    this.getRetiroInfoUseCase
      .execute(retiroId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (retiro) => {
          this.retiroInfo.set(retiro);
        },
        error: () => {
          // Retiro info is non-critical, fall back to "Registro #N"
        },
      });
  }
}
