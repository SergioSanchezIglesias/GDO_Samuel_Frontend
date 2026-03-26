import { inject, Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import type { Observable } from 'rxjs';

import { decodeJwtPayload } from '../../../core/utils/jwt-decode';
import { TokenStoragePort } from '../../auth/domain/ports/token-storage.port';
import type { Profile } from '../domain/models/profile.model';
import { ProfilePort } from '../domain/ports/profile.port';

@Injectable()
export class GetProfileUseCase {
  private readonly profilePort = inject(ProfilePort);
  private readonly tokenStorage = inject(TokenStoragePort);

  execute(): Observable<Profile> {
    const token = this.tokenStorage.accessToken();
    if (!token) {
      return throwError(() => new Error('No access token found'));
    }

    const payload = decodeJwtPayload(token);
    if (!payload) {
      return throwError(() => new Error('Invalid token payload'));
    }

    const userId = Number(payload.sub);
    return this.profilePort.getProfile(userId);
  }
}
