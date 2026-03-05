import type { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { ShellLayoutComponent } from './shared/layout';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    component: ShellLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'oraciones',
        loadChildren: () =>
          import('./features/oraciones/oraciones.routes').then((m) => m.ORACIONES_ROUTES),
      },
      {
        path: 'retiros',
        canActivate: [roleGuard('organizador')],
        loadChildren: () =>
          import('./features/retiros/retiros.routes').then((m) => m.RETIROS_ROUTES),
      },
      {
        path: 'perfil',
        loadChildren: () =>
          import('./features/perfil/perfil.routes').then((m) => m.PERFIL_ROUTES),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
