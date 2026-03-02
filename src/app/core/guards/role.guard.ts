import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';

import { TokenStoragePort } from '../../features/auth/domain/ports/token-storage.port';
import type { UserRole } from '../../features/auth/domain/models/auth.model';

export const roleGuard = (requiredRole: UserRole): CanActivateFn =>
  () => {
    const tokenStorage = inject(TokenStoragePort);
    const router = inject(Router);

    if (!tokenStorage.isAuthenticated()) {
      return router.createUrlTree(['/auth/login']);
    }

    if (tokenStorage.userRole() === requiredRole) {
      return true;
    }

    return router.createUrlTree(['/dashboard']);
  };
