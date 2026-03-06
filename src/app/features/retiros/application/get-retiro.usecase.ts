import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Retiro } from '../domain/models/retiro.model';
import { RetiroPort } from '../domain/ports/retiro.port';

@Injectable()
export class GetRetiroUseCase {
  private readonly retiroPort = inject(RetiroPort);

  execute(id: number): Observable<Retiro> {
    return this.retiroPort.getById(id);
  }
}
