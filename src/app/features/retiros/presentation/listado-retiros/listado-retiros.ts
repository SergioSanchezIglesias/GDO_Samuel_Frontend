import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Search, Plus, LucideAngularModule, LucideIconProvider, LUCIDE_ICONS } from 'lucide-angular';

import { ListItemComponent } from '../../../../ui/components/list-item/list-item';
import { ScreenHeaderComponent } from '../../../../ui/components/screen-header/screen-header';
import { ListRetirosUseCase } from '../../application/list-retiros.usecase';
import type { Retiro } from '../../domain/models/retiro.model';

@Component({
  selector: 'app-listado-retiros',
  imports: [ScreenHeaderComponent, ListItemComponent, LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ Search, Plus }),
    },
  ],
  templateUrl: './listado-retiros.html',
  styleUrl: './listado-retiros.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListadoRetirosComponent {
  private readonly listRetirosUseCase = inject(ListRetirosUseCase);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly retiros = signal<Retiro[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly ubicacionFilter = signal('');

  constructor() {
    effect(() => {
      const filter = this.ubicacionFilter();
      this.loadRetiros(filter);
    });
  }

  getRetiroTitle(retiro: Retiro): string {
    const year = retiro.fechaInicio.split('T')[0].split('-')[0];
    return `Retiro ${retiro.ubicacion} ${year}`;
  }

  getRetiroSubtitle(retiro: Retiro): string {
    const formatShort = (iso: string): string => {
      const datePart = iso.split('T')[0];
      const [, month, day] = datePart.split('-').map(Number);
      const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      return `${day} ${months[month - 1]}`;
    };
    return `${formatShort(retiro.fechaInicio)} — ${formatShort(retiro.fechaFin)} · ${retiro.ubicacion}`;
  }

  navigateToCreate(): void {
    this.router.navigate(['/retiros/nuevo']);
  }

  navigateToDetail(id: number): void {
    this.router.navigate(['/retiros', id]);
  }

  onFilterInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.ubicacionFilter.set(value);
  }

  private loadRetiros(ubicacion: string): void {
    this.loading.set(true);
    this.error.set('');

    this.listRetirosUseCase
      .execute(1, 20, ubicacion || undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.retiros.set(response.data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Error al cargar los retiros. Inténtalo de nuevo.');
          this.loading.set(false);
        },
      });
  }
}
