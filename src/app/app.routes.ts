import type { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
  // TODO: Uncomment when the retiros feature is implemented.
  // {
  //   path: 'retiros',
  //   canActivate: [authGuard, roleGuard('organizador')],
  //   loadChildren: () =>
  //     import('./features/retiros/retiros.routes').then((m) => m.RETIROS_ROUTES),
  // },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
