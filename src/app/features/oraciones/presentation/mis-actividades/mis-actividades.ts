import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
  History,
  Plus,
  Sigma,
  LucideAngularModule,
  LucideIconProvider,
  LUCIDE_ICONS,
} from 'lucide-angular';

import { decodeJwtPayload } from '../../../../core/utils/jwt-decode';
import { ListItemComponent } from '../../../../ui/components/list-item/list-item';
import { ScreenHeaderComponent } from '../../../../ui/components/screen-header/screen-header';
import { SectionHeaderComponent } from '../../../../ui/components/section-header/section-header.component';
import { TokenStoragePort } from '../../../auth/domain/ports/token-storage.port';
import { GetRetirosByUsuarioUseCase } from '../../application/get-retiros-by-usuario.use-case';
import { GetSumatorioByUsuarioUseCase } from '../../application/get-sumatorio-by-usuario.use-case';
import type { SumatorioOraciones } from '../../domain/models/oracion.model';
import type { RetiroParticipacion } from '../../domain/models/retiro-participacion.model';
import { ActivityGridComponent } from '../shared/activity-grid/activity-grid';

@Component({
  selector: 'app-mis-actividades',
  imports: [
    ScreenHeaderComponent,
    SectionHeaderComponent,
    ListItemComponent,
    LucideAngularModule,
    ActivityGridComponent,
  ],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ History, Plus, Sigma }),
    },
  ],
  templateUrl: './mis-actividades.html',
  styleUrl: './mis-actividades.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisActividadesComponent implements OnInit {
  private readonly getSumatorioUseCase = inject(GetSumatorioByUsuarioUseCase);
  private readonly getRetirosUseCase = inject(GetRetirosByUsuarioUseCase);
  private readonly tokenStorage = inject(TokenStoragePort);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly retiros = signal<RetiroParticipacion[]>([]);
  readonly sumatorio = signal<SumatorioOraciones | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadActividades();
  }

  getRetiroSubtitle(retiro: RetiroParticipacion): string {
    return `${this.formatDate(retiro.fechaInicio)} - ${this.formatDate(retiro.fechaFin)}`;
  }

  navigateToRegistrar(): void {
    this.router.navigate(['/oraciones/nueva']);
  }

  navigateToDetail(oracionId: number): void {
    this.router.navigate(['/oraciones', oracionId]);
  }

  private getUsuarioIdFromToken(): number | null {
    const token = this.tokenStorage.accessToken();
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    if (!payload?.sub) return null;
    return Number(payload.sub);
  }

  private loadActividades(): void {
    const usuarioId = this.getUsuarioIdFromToken();
    if (usuarioId === null) {
      this.isLoading.set(false);
      this.error.set('No se pudo obtener la información de sesión.');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.getRetirosUseCase
      .execute(usuarioId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (retiros) => {
          this.retiros.set(retiros);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('Error al cargar las actividades. Inténtalo de nuevo.');
          this.isLoading.set(false);
        },
      });

    this.loadSumatorio(usuarioId);
  }

  private loadSumatorio(usuarioId: number): void {
    this.getSumatorioUseCase
      .execute(usuarioId)
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

  private formatDate(iso: string): string {
    const [yyyy, mm, dd] = iso.slice(0, 10).split('-');
    return `${dd}/${mm}/${yyyy}`;
  }
}
