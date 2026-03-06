import type { Observable } from 'rxjs';

import type { PaginatedResponse } from '../../../../shared/models/paginated-response.model';
import type { CreateRetiroDTO, Retiro, UpdateRetiroDTO } from '../models/retiro.model';

export abstract class RetiroPort {
  abstract getAll(page: number, limit: number, ubicacion?: string): Observable<PaginatedResponse<Retiro>>;
  abstract getById(id: number): Observable<Retiro>;
  abstract create(dto: CreateRetiroDTO): Observable<Retiro>;
  abstract update(id: number, dto: UpdateRetiroDTO): Observable<Retiro>;
  abstract delete(id: number): Observable<void>;
}
