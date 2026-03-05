import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { PaginatedResponse } from '../../../shared/models/paginated-response.model';
import type { Retiro } from '../domain/models/retiro.model';
import { RetiroPort } from '../domain/ports/retiro.port';

@Injectable()
export class ListRetirosUseCase {
  private readonly retiroPort = inject(RetiroPort);

  execute(page: number, limit: number, ubicacion?: string): Observable<PaginatedResponse<Retiro>> {
    return this.retiroPort.getAll(page, limit, ubicacion);
  }
}
