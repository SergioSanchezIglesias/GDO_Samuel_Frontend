import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Retiro, UpdateRetiroDTO } from '../domain/models/retiro.model';
import { RetiroPort } from '../domain/ports/retiro.port';

@Injectable()
export class UpdateRetiroUseCase {
  private readonly retiroPort = inject(RetiroPort);

  execute(id: number, dto: UpdateRetiroDTO): Observable<Retiro> {
    return this.retiroPort.update(id, dto);
  }
}
