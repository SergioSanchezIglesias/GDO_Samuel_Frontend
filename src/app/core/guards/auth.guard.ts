import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';

import { TokenStoragePort } from '../../features/auth/domain/ports/token-storage.port';

export const authGuard: CanActivateFn = () => {
  const tokenStorage = inject(TokenStoragePort);
  const router = inject(Router);

  if (tokenStorage.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};
