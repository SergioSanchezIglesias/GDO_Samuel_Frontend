import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Oracion } from '../domain/models/oracion.model';
import { OracionesPort } from '../domain/ports/oraciones.port';
import { GetOracionByIdUseCase } from './get-oracion-by-id.use-case';

const mockOracion: Oracion = {
  id: 42,
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

const mockOracionesPort = {
  create: vi.fn(),
  list: vi.fn(),
  getById: vi.fn(),
  getSumatorio: vi.fn(),
};

describe('GetOracionByIdUseCase', () => {
  let useCase: GetOracionByIdUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        GetOracionByIdUseCase,
        { provide: OracionesPort, useValue: mockOracionesPort },
      ],
    });
    useCase = TestBed.inject(GetOracionByIdUseCase);
  });

  it('delegates to oracionesPort.getById() with the given id', () => {
    mockOracionesPort.getById.mockReturnValue(of(mockOracion));

    useCase.execute(42).subscribe();

    expect(mockOracionesPort.getById).toHaveBeenCalledWith(42);
  });

  it('returns the oracion from the port', () => {
    mockOracionesPort.getById.mockReturnValue(of(mockOracion));

    let result: Oracion | undefined;
    useCase.execute(42).subscribe(r => {
      result = r;
    });

    expect(result).toEqual(mockOracion);
  });
});
