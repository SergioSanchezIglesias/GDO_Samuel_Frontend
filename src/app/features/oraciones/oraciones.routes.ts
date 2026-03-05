import type { Routes } from '@angular/router';

export const ORACIONES_ROUTES: Routes = [
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
];
