import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  Plus,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
} from 'lucide-angular';
import { decodeJwtPayload } from '../../../core/utils/jwt-decode';
import { TokenStoragePort } from '../../auth/domain/ports/token-storage.port';
import { GetRetiroInfoUseCase } from '../../oraciones/application/get-retiro-info.use-case';
import { GetSumatorioOracionesUseCase } from '../../oraciones/application/get-sumatorio-oraciones.use-case';
import type { SumatorioOraciones } from '../../oraciones/domain/models/oracion.model';
import type { RetiroInfo } from '../../oraciones/domain/models/retiro-info.model';
import { ActivityGridComponent } from '../../oraciones/presentation/shared/activity-grid/activity-grid';

@Component({
  selector: 'app-dashboard',
  imports: [LucideAngularModule, ActivityGridComponent],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ Plus }),
    },
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly tokenStorage = inject(TokenStoragePort);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly getSumatorioUseCase = inject(GetSumatorioOracionesUseCase);
  private readonly getRetiroInfoUseCase = inject(GetRetiroInfoUseCase);

  readonly sumatorio = signal<SumatorioOraciones | null>(null);
  readonly retiroInfo = signal<RetiroInfo | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.loadDashboard();
  }

  protected getRetiroIdFromToken(): number | null {
    const token = this.tokenStorage.accessToken();
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    return payload?.idRetiro ?? null;
  }

  protected formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  private loadDashboard(): void {
    const retiroId = this.getRetiroIdFromToken();

    if (retiroId === null) {
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      sumatorio: this.getSumatorioUseCase.execute(retiroId),
      retiroInfo: this.getRetiroInfoUseCase.execute(retiroId),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ sumatorio, retiroInfo }) => {
          this.sumatorio.set(sumatorio);
          this.retiroInfo.set(retiroInfo);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('Error al cargar el dashboard. Inténtalo de nuevo.');
          this.isLoading.set(false);
        },
      });
  }

  reload(): void {
    this.loadDashboard();
  }

  navigateToRegistrar(): void {
    void this.router.navigate(['/oraciones/nueva']);
  }
}
