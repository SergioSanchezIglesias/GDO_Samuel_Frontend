import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import { API_URL } from '../../../../core/config/api.config';
import type { PaginatedResponse } from '../../../../shared/models/paginated-response.model';
import type { CreateRetiroDTO, Retiro, UpdateRetiroDTO } from '../../domain/models/retiro.model';
import { RetiroPort } from '../../domain/ports/retiro.port';

@Injectable()
export class RetiroApiAdapter extends RetiroPort {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getAll(page: number, limit: number, ubicacion?: string): Observable<PaginatedResponse<Retiro>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (ubicacion) {
      params = params.set('ubicacion', ubicacion);
    }
    return this.http.get<PaginatedResponse<Retiro>>(`${this.apiUrl}/retiros`, { params });
  }

  getById(id: number): Observable<Retiro> {
    return this.http.get<Retiro>(`${this.apiUrl}/retiros/${id}`);
  }

  create(dto: CreateRetiroDTO): Observable<Retiro> {
    return this.http.post<Retiro>(`${this.apiUrl}/retiros`, dto);
  }

  update(id: number, dto: UpdateRetiroDTO): Observable<Retiro> {
    return this.http.patch<Retiro>(`${this.apiUrl}/retiros/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/retiros/${id}`);
  }
}
