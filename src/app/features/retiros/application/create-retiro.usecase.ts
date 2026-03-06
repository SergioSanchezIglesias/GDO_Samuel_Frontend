import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { CreateRetiroDTO, Retiro } from '../domain/models/retiro.model';
import { RetiroPort } from '../domain/ports/retiro.port';

@Injectable()
export class CreateRetiroUseCase {
  private readonly retiroPort = inject(RetiroPort);

  execute(dto: CreateRetiroDTO): Observable<Retiro> {
    return this.retiroPort.create(dto);
  }
}
