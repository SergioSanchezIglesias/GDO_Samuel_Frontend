import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { of, tap } from 'rxjs';
import type { Observable } from 'rxjs';

import { API_URL } from '../../../core/config/api.config';
import { decodeJwtPayload } from '../../../core/utils/jwt-decode';
import type { PaginatedResponse } from '../../../shared/models/paginated-response.model';
import { TokenStoragePort } from '../../auth/domain/ports/token-storage.port';
import type { CreateOracionDTO, Oracion, SumatorioOraciones } from '../domain/models/oracion.model';
import type { RetiroInfo } from '../domain/models/retiro-info.model';
import { OracionesPort } from '../domain/ports/oraciones.port';

@Injectable()
export class OracionesApiAdapter extends OracionesPort {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  private readonly tokenStorage = inject(TokenStoragePort);
  private readonly retiroInfoCache = new Map<number, RetiroInfo>();

  create(dto: CreateOracionDTO): Observable<Oracion> {
    const usuarioId = this.getUsuarioIdFromToken();
    const retiroId = this.getRetiroIdFromToken();
    return this.http.post<Oracion>(`${this.apiUrl}/oraciones`, { ...dto, usuarioId, retiroId });
  }

  list(
    usuarioId: number,
    retiroId: number,
    page = 1,
    limit = 20,
  ): Observable<PaginatedResponse<Oracion>> {
    const params = new HttpParams()
      .set('usuarioId', usuarioId)
      .set('retiroId', retiroId)
      .set('page', page)
      .set('limit', limit);
    return this.http.get<PaginatedResponse<Oracion>>(`${this.apiUrl}/oraciones`, { params });
  }

  getById(id: number): Observable<Oracion> {
    return this.http.get<Oracion>(`${this.apiUrl}/oraciones/${id}`);
  }

  getSumatorio(retiroId: number): Observable<SumatorioOraciones> {
    return this.http.get<SumatorioOraciones>(`${this.apiUrl}/oraciones/sumatorio/${retiroId}`);
  }

  getRetiroInfo(retiroId: number): Observable<RetiroInfo> {
    const cached = this.retiroInfoCache.get(retiroId);
    if (cached) {
      return of(cached);
    }
    return this.http
      .get<RetiroInfo>(`${this.apiUrl}/retiros/${retiroId}/info`)
      .pipe(tap((info) => this.retiroInfoCache.set(retiroId, info)));
  }

  getUsuarioIdFromToken(): number | null {
    const token = this.tokenStorage.accessToken();
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    if (!payload) return null;
    return Number(payload.sub);
  }

  getRetiroIdFromToken(): number | null {
    const token = this.tokenStorage.accessToken();
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    if (!payload?.idRetiro) return null;
    return payload.idRetiro;
  }
}
