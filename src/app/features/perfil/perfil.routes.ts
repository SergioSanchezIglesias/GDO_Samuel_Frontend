import type { Routes } from '@angular/router';

export const PERFIL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/perfil/perfil').then((m) => m.PerfilComponent),
  },
];
