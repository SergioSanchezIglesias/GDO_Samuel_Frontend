import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { RetiroInfo } from '../domain/models/retiro-info.model';
import { OracionesPort } from '../domain/ports/oraciones.port';

@Injectable()
export class GetRetiroInfoUseCase {
  private readonly oracionesPort = inject(OracionesPort);

  execute(retiroId: number): Observable<RetiroInfo> {
    return this.oracionesPort.getRetiroInfo(retiroId);
  }
}
