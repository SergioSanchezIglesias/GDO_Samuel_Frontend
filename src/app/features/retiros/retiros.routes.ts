import type { Routes } from '@angular/router';

export const RETIROS_ROUTES: Routes = [
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
];
