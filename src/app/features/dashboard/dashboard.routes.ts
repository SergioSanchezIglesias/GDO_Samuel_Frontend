import type { Routes } from '@angular/router';

import { GetRetiroInfoUseCase } from '../oraciones/application/get-retiro-info.use-case';
import { GetSumatorioOracionesUseCase } from '../oraciones/application/get-sumatorio-oraciones.use-case';
import { OracionesPort } from '../oraciones/domain/ports/oraciones.port';
import { OracionesApiAdapter } from '../oraciones/infrastructure/oraciones-api.adapter';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    providers: [
      { provide: OracionesPort, useClass: OracionesApiAdapter },
      GetSumatorioOracionesUseCase,
      GetRetiroInfoUseCase,
    ],
    loadComponent: () =>
      import('./presentation/dashboard').then((m) => m.DashboardComponent),
  },
];
