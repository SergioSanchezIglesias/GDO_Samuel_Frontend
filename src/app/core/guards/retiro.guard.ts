import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';

import { TokenStoragePort } from '../../features/auth/domain/ports/token-storage.port';

export const retiroGuard: CanActivateFn = () => {
  const tokenStorage = inject(TokenStoragePort);
  const router = inject(Router);

  if (tokenStorage.idRetiro() !== null) return true;
  if (tokenStorage.userRole() !== 'usuario') return true;
  return router.createUrlTree(['/auth/vincular-retiro']);
};
