import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import { API_URL } from '../../../core/config/api.config';
import type { Profile, UpdateProfileRequest } from '../domain/models/profile.model';
import { ProfilePort } from '../domain/ports/profile.port';

@Injectable()
export class ProfileApiAdapter extends ProfilePort {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getProfile(id: number): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiUrl}/usuarios/${id}`);
  }

  updateProfile(id: number, data: UpdateProfileRequest): Observable<Profile> {
    return this.http.patch<Profile>(`${this.apiUrl}/usuarios/${id}`, data);
  }
}
