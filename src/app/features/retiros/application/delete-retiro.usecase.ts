import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import { RetiroPort } from '../domain/ports/retiro.port';

@Injectable()
export class DeleteRetiroUseCase {
  private readonly retiroPort = inject(RetiroPort);

  execute(id: number): Observable<void> {
    return this.retiroPort.delete(id);
  }
}
