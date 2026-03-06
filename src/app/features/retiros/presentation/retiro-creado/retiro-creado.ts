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
import { Check, LucideAngularModule, LucideIconProvider, LUCIDE_ICONS } from 'lucide-angular';

import { ButtonComponent } from '../../../../ui/components/button/button';
import { ScreenHeaderComponent } from '../../../../ui/components/screen-header/screen-header';
import { GetRetiroUseCase } from '../../application/get-retiro.usecase';
import type { Retiro } from '../../domain/models/retiro.model';

@Component({
  selector: 'app-retiro-creado',
  imports: [ScreenHeaderComponent, ButtonComponent, LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ Check }),
    },
  ],
  templateUrl: './retiro-creado.html',
  styleUrl: './retiro-creado.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RetiroCreadoComponent {
  private readonly getRetiroUseCase = inject(GetRetiroUseCase);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly retiro = signal<Retiro | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

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

  goToList(): void {
    this.router.navigate(['/retiros']);
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
