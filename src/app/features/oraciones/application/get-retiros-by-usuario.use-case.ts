import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { RetiroParticipacion } from '../domain/models/retiro-participacion.model';
import { OracionesPort } from '../domain/ports/oraciones.port';

@Injectable()
export class GetRetirosByUsuarioUseCase {
  private readonly oracionesPort = inject(OracionesPort);

  execute(usuarioId: number): Observable<RetiroParticipacion[]> {
    return this.oracionesPort.getRetirosByUsuario(usuarioId);
  }
}
