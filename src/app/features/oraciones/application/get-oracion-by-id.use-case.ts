import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Oracion } from '../domain/models/oracion.model';
import { OracionesPort } from '../domain/ports/oraciones.port';

@Injectable()
export class GetOracionByIdUseCase {
  private readonly oracionesPort = inject(OracionesPort);

  execute(id: number): Observable<Oracion> {
    return this.oracionesPort.getById(id);
  }
}
