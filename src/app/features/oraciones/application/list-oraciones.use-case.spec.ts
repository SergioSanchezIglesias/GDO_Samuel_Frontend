import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PaginatedResponse } from '../../../shared/models/paginated-response.model';
import type { Oracion } from '../domain/models/oracion.model';
import { OracionesPort } from '../domain/ports/oraciones.port';
import { ListOracionesUseCase } from './list-oraciones.use-case';

const mockOracion: Oracion = {
  id: 1,
  usuarioId: 10,
  retiroId: 5,
  laudes: 0,
  visperas: 0,
  completas: 0,
  angelusReginaCoeli: 0,
  misteriosRosario: 0,
  horasSantisimo: 0,
  horasOracion: 0,
  novenas: 0,
  horasTrabajo: 0,
  horasEstudio: 0,
  horasDeporte: 0,
  horasOracionCantando: 0,
  ayunos: 0,
  coronillas: 0,
  voluntariados: 0,
  misas: 0,
};

const mockPaginated: PaginatedResponse<Oracion> = {
  data: [mockOracion],
  page: 1,
  limit: 20,
  total: 1,
};

const mockOracionesPort = {
  create: vi.fn(),
  list: vi.fn(),
  getById: vi.fn(),
  getSumatorio: vi.fn(),
};

describe('ListOracionesUseCase', () => {
  let useCase: ListOracionesUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        ListOracionesUseCase,
        { provide: OracionesPort, useValue: mockOracionesPort },
      ],
    });
    useCase = TestBed.inject(ListOracionesUseCase);
  });

  it('delegates to oracionesPort.list() with usuarioId and retiroId', () => {
    mockOracionesPort.list.mockReturnValue(of(mockPaginated));

    useCase.execute(10, 5).subscribe();

    expect(mockOracionesPort.list).toHaveBeenCalledWith(10, 5, undefined, undefined);
  });

  it('passes page and limit when provided', () => {
    mockOracionesPort.list.mockReturnValue(of(mockPaginated));

    useCase.execute(10, 5, 2, 10).subscribe();

    expect(mockOracionesPort.list).toHaveBeenCalledWith(10, 5, 2, 10);
  });

  it('returns the paginated response from the port', () => {
    mockOracionesPort.list.mockReturnValue(of(mockPaginated));

    let result: PaginatedResponse<Oracion> | undefined;
    useCase.execute(10, 5).subscribe(r => {
      result = r;
    });

    expect(result).toEqual(mockPaginated);
  });
});
