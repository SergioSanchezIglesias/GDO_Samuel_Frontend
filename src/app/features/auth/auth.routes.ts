import type { Routes } from '@angular/router';

import { authGuard } from '../../core/guards/auth.guard';
import { guestGuard } from '../../core/guards/guest.guard';
import { LoginUseCase } from './application/login.usecase';
import { RegisterUseCase } from './application/register.usecase';
import { VincularRetiroUseCase } from './application/vincular-retiro.usecase';
import { AuthPort } from './domain/ports/auth.port';
import { AuthApiAdapter } from './infrastructure/adapters/auth-api.adapter';

export const AUTH_ROUTES: Routes = [
  {
    path: 'callback',
    loadComponent: () =>
      import('./presentation/callback/callback').then((m) => m.CallbackComponent),
  },
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
  {
    path: 'vincular-retiro',
    canActivate: [authGuard],
    providers: [{ provide: AuthPort, useClass: AuthApiAdapter }, VincularRetiroUseCase],
    loadComponent: () =>
      import('./presentation/vincular-retiro/vincular-retiro').then(
        (m) => m.VincularRetiroComponent,
      ),
  },
];
