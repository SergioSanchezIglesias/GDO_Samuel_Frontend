import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { PaginatedResponse } from '../../../shared/models/paginated-response.model';
import type { Oracion } from '../domain/models/oracion.model';
import { OracionesPort } from '../domain/ports/oraciones.port';

@Injectable()
export class ListOracionesUseCase {
  private readonly oracionesPort = inject(OracionesPort);

  execute(
    usuarioId: number,
    retiroId: number,
    page?: number,
    limit?: number,
  ): Observable<PaginatedResponse<Oracion>> {
    return this.oracionesPort.list(usuarioId, retiroId, page, limit);
  }
}
