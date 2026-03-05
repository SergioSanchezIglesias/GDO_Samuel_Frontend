import type { Routes } from '@angular/router';

import { guestGuard } from '../../core/guards/guest.guard';
import { LoginUseCase } from './application/login.usecase';
import { RegisterUseCase } from './application/register.usecase';
import { AuthPort } from './domain/ports/auth.port';
import { AuthApiAdapter } from './infrastructure/adapters/auth-api.adapter';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    canActivate: [guestGuard],
    providers: [
      { provide: AuthPort, useClass: AuthApiAdapter },
      LoginUseCase,
      RegisterUseCase,
    ],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./presentation/login/login').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./presentation/register/register').then((m) => m.RegisterComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
];
