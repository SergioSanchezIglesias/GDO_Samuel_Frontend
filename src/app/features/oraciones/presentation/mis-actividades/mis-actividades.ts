import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
  History,
  Plus,
  LucideAngularModule,
  LucideIconProvider,
  LUCIDE_ICONS,
} from 'lucide-angular';

import { decodeJwtPayload } from '../../../../core/utils/jwt-decode';
import { ListItemComponent } from '../../../../ui/components/list-item/list-item';
import { ScreenHeaderComponent } from '../../../../ui/components/screen-header/screen-header';
import { SectionHeaderComponent } from '../../../../ui/components/section-header/section-header.component';
import { TokenStoragePort } from '../../../auth/domain/ports/token-storage.port';
import { GetSumatorioOracionesUseCase } from '../../application/get-sumatorio-oraciones.use-case';
import { ListOracionesUseCase } from '../../application/list-oraciones.use-case';
import type { Oracion, SumatorioOraciones } from '../../domain/models/oracion.model';

@Component({
  selector: 'app-mis-actividades',
  imports: [ScreenHeaderComponent, SectionHeaderComponent, ListItemComponent, LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ History, Plus }),
    },
  ],
  templateUrl: './mis-actividades.html',
  styleUrl: './mis-actividades.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisActividadesComponent {
  private readonly listOracionesUseCase = inject(ListOracionesUseCase);
  private readonly getSumatorioUseCase = inject(GetSumatorioOracionesUseCase);
  private readonly tokenStorage = inject(TokenStoragePort);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly oraciones = signal<Oracion[]>([]);
  readonly sumatorio = signal<SumatorioOraciones | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);

  readonly totalOraciones = computed(() => this.oraciones().length);
  readonly totalMisas = computed(() => this.sumatorio()?.misas ?? 0);
  readonly totalAyunos = computed(() => this.sumatorio()?.ayunos ?? 0);

  constructor() {
    effect(() => {
      this.loadActividades();
    });
  }

  getOracionTitle(oracion: Oracion): string {
    return `Registro #${oracion.id}`;
  }

  getOracionSubtitle(oracion: Oracion): string {
    return `Misas: ${oracion.misas} · Ayunos: ${oracion.ayunos} · Laudes: ${oracion.laudes}`;
  }

  navigateToRegistrar(): void {
    this.router.navigate(['/oraciones/nueva']);
  }

  private getIdsFromToken(): { usuarioId: number; retiroId: number } | null {
    const token = this.tokenStorage.accessToken();
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    if (!payload?.idRetiro) return null;
    return {
      usuarioId: Number(payload.sub),
      retiroId: payload.idRetiro,
    };
  }

  private loadActividades(): void {
    const ids = this.getIdsFromToken();
    if (!ids) {
      this.isLoading.set(false);
      this.error.set('No se pudo obtener la información de sesión.');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.listOracionesUseCase
      .execute(ids.usuarioId, ids.retiroId, this.currentPage(), 20)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.oraciones.set(response.data);
          this.totalPages.set(Math.ceil(response.total / 20) || 1);
          this.isLoading.set(false);
          this.loadSumatorio(ids.retiroId);
        },
        error: () => {
          this.error.set('Error al cargar las actividades. Inténtalo de nuevo.');
          this.isLoading.set(false);
        },
      });
  }

  private loadSumatorio(retiroId: number): void {
    this.getSumatorioUseCase
      .execute(retiroId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (sumatorio) => {
          this.sumatorio.set(sumatorio);
        },
        error: () => {
          // Sumatorio is non-critical, fail silently
        },
      });
  }
}
