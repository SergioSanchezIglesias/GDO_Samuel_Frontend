import type { Observable } from 'rxjs';

import type { Profile, UpdateProfileRequest } from '../models/profile.model';

export abstract class ProfilePort {
  abstract getProfile(id: number): Observable<Profile>;
  abstract updateProfile(id: number, data: UpdateProfileRequest): Observable<Profile>;
}
