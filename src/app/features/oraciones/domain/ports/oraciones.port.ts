import type { Observable } from 'rxjs';

import type { PaginatedResponse } from '../../../../shared/models/paginated-response.model';
import type { CreateOracionDTO, Oracion, SumatorioOraciones } from '../models/oracion.model';
import type { RetiroInfo } from '../models/retiro-info.model';
import type { RetiroParticipacion } from '../models/retiro-participacion.model';

export abstract class OracionesPort {
  abstract create(dto: CreateOracionDTO): Observable<Oracion>;
  abstract list(
    usuarioId: number,
    retiroId: number,
    page?: number,
    limit?: number,
  ): Observable<PaginatedResponse<Oracion>>;
  abstract getById(id: number): Observable<Oracion>;
  abstract getSumatorio(retiroId: number): Observable<SumatorioOraciones>;
  abstract getSumatorioByUsuario(usuarioId: number): Observable<SumatorioOraciones>;
  abstract getRetirosByUsuario(usuarioId: number): Observable<RetiroParticipacion[]>;
  abstract getRetiroInfo(retiroId: number): Observable<RetiroInfo>;
}
