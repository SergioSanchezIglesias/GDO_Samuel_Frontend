import type { Routes } from '@angular/router';

import { CreateRetiroUseCase } from './application/create-retiro.usecase';
import { DeleteRetiroUseCase } from './application/delete-retiro.usecase';
import { GetRetiroUseCase } from './application/get-retiro.usecase';
import { ListRetirosUseCase } from './application/list-retiros.usecase';
import { UpdateRetiroUseCase } from './application/update-retiro.usecase';
import { RetiroPort } from './domain/ports/retiro.port';
import { RetiroApiAdapter } from './infrastructure/adapters/retiro-api.adapter';

export const RETIROS_ROUTES: Routes = [
  {
    path: '',
    providers: [
      { provide: RetiroPort, useClass: RetiroApiAdapter },
      ListRetirosUseCase,
      GetRetiroUseCase,
      CreateRetiroUseCase,
      UpdateRetiroUseCase,
      DeleteRetiroUseCase,
    ],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./presentation/listado-retiros/listado-retiros').then(
            (m) => m.ListadoRetirosComponent,
          ),
      },
      {
        path: 'nuevo',
        loadComponent: () =>
          import('./presentation/crear-retiro/crear-retiro').then(
            (m) => m.CrearRetiroComponent,
          ),
      },
      {
        path: 'creado/:id',
        loadComponent: () =>
          import('./presentation/retiro-creado/retiro-creado').then(
            (m) => m.RetiroCreadoComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./presentation/detalle-retiro/detalle-retiro').then(
            (m) => m.DetalleRetiroComponent,
          ),
      },
      {
        path: ':id/editar',
        loadComponent: () =>
          import('./presentation/editar-retiro/editar-retiro').then(
            (m) => m.EditarRetiroComponent,
          ),
      },
    ],
  },
];
