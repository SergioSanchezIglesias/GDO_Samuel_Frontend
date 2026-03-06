import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { KeyRound, Pencil, LucideAngularModule, LucideIconProvider, LUCIDE_ICONS } from 'lucide-angular';

import { ButtonComponent } from '../../../../ui/components/button/button';
import { ConfirmDialogComponent } from '../../../../ui/components/confirm-dialog/confirm-dialog';
import { ScreenHeaderComponent } from '../../../../ui/components/screen-header/screen-header';
import { DeleteRetiroUseCase } from '../../application/delete-retiro.usecase';
import { GetRetiroUseCase } from '../../application/get-retiro.usecase';
import type { Retiro } from '../../domain/models/retiro.model';
import { formatDateForDisplay } from '../../../../core/utils/date-format';

@Component({
  selector: 'app-detalle-retiro',
  imports: [ScreenHeaderComponent, ButtonComponent, ConfirmDialogComponent, LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ KeyRound, Pencil }),
    },
  ],
  templateUrl: './detalle-retiro.html',
  styleUrl: './detalle-retiro.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleRetiroComponent {
  private readonly getRetiroUseCase = inject(GetRetiroUseCase);
  private readonly deleteRetiroUseCase = inject(DeleteRetiroUseCase);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly retiro = signal<Retiro | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly showDeleteDialog = signal(false);
  readonly deleting = signal(false);

  readonly formatDateForDisplay = formatDateForDisplay;

  constructor() {
    effect(() => {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (!id) return;
      this.loadRetiro(id);
    });
  }

  formatCode(codigo: string): string {
    const half = Math.ceil(codigo.length / 2);
    return `${codigo.slice(0, half)} ${codigo.slice(half)}`;
  }

  navigateToEdit(): void {
    const id = this.retiro()?.id;
    if (id) {
      this.router.navigate(['/retiros', id, 'editar']);
    }
  }

  onDeleteConfirmed(): void {
    const id = this.retiro()?.id;
    if (!id) return;

    this.deleting.set(true);
    this.showDeleteDialog.set(false);

    this.deleteRetiroUseCase
      .execute(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.router.navigate(['/retiros']);
        },
        error: () => {
          this.deleting.set(false);
          this.error.set('Error al eliminar el retiro. Inténtalo de nuevo.');
        },
      });
  }

  onDeleteCancelled(): void {
    this.showDeleteDialog.set(false);
  }

  private loadRetiro(id: number): void {
    this.loading.set(true);
    this.error.set('');

    this.getRetiroUseCase
      .execute(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (retiro) => {
          this.retiro.set(retiro);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Error al cargar el retiro.');
          this.loading.set(false);
        },
      });
  }
}
