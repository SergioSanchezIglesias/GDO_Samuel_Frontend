import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { SumatorioOraciones } from '../domain/models/oracion.model';
import { OracionesPort } from '../domain/ports/oraciones.port';

@Injectable()
export class GetSumatorioOracionesUseCase {
  private readonly oracionesPort = inject(OracionesPort);

  execute(retiroId: number): Observable<SumatorioOraciones> {
    return this.oracionesPort.getSumatorio(retiroId);
  }
}
