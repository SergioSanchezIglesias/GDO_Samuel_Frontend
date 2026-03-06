import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { CreateOracionDTO, Oracion } from '../domain/models/oracion.model';
import { OracionesPort } from '../domain/ports/oraciones.port';

@Injectable()
export class CreateOracionUseCase {
  private readonly oracionesPort = inject(OracionesPort);

  execute(dto: CreateOracionDTO): Observable<Oracion> {
    return this.oracionesPort.create(dto);
  }
}
