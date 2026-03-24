import type { Routes } from '@angular/router';

import { LogoutUseCase } from '../auth/application/logout.use-case';
import { AuthPort } from '../auth/domain/ports/auth.port';
import { AuthApiAdapter } from '../auth/infrastructure/adapters/auth-api.adapter';
import { GetProfileUseCase } from './application/get-profile.use-case';
import { UpdateProfileUseCase } from './application/update-profile.use-case';
import { ProfilePort } from './domain/ports/profile.port';
import { ProfileApiAdapter } from './infrastructure/profile-api.adapter';

export const PERFIL_ROUTES: Routes = [
  {
    path: '',
    providers: [
      { provide: ProfilePort, useClass: ProfileApiAdapter },
      { provide: AuthPort, useClass: AuthApiAdapter },
      GetProfileUseCase,
      UpdateProfileUseCase,
      LogoutUseCase,
    ],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./presentation/perfil/perfil').then((m) => m.PerfilComponent),
      },
      {
        path: 'editar',
        loadComponent: () =>
          import('./presentation/editar-perfil/editar-perfil').then(
            (m) => m.EditarPerfilComponent,
          ),
      },
    ],
  },
];
