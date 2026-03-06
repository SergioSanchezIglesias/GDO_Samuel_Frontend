import type { Routes } from '@angular/router';

import { CreateOracionUseCase } from './application/create-oracion.use-case';
import { GetOracionByIdUseCase } from './application/get-oracion-by-id.use-case';
import { GetSumatorioOracionesUseCase } from './application/get-sumatorio-oraciones.use-case';
import { ListOracionesUseCase } from './application/list-oraciones.use-case';
import { OracionesPort } from './domain/ports/oraciones.port';
import { OracionesApiAdapter } from './infrastructure/oraciones-api.adapter';

export const ORACIONES_ROUTES: Routes = [
  {
    path: '',
    providers: [
      { provide: OracionesPort, useClass: OracionesApiAdapter },
      CreateOracionUseCase,
      ListOracionesUseCase,
      GetOracionByIdUseCase,
      GetSumatorioOracionesUseCase,
    ],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./presentation/mis-actividades/mis-actividades').then(
            (m) => m.MisActividadesComponent,
          ),
      },
      {
        path: 'nueva',
        loadComponent: () =>
          import('./presentation/registrar-actividades/registrar-actividades').then(
            (m) => m.RegistrarActividadesComponent,
          ),
      },
    ],
  },
];
