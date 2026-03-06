import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CreateOracionDTO, Oracion } from '../domain/models/oracion.model';
import { OracionesPort } from '../domain/ports/oraciones.port';
import { CreateOracionUseCase } from './create-oracion.use-case';

const mockOracion: Oracion = {
  id: 1,
  usuarioId: 10,
  retiroId: 5,
  laudes: 1,
  visperas: 1,
  completas: 0,
  angelusReginaCoeli: 0,
  misteriosRosario: 0,
  horasSantisimo: 0,
  horasOracion: 0,
  novenas: 0,
  horasTrabajo: 2,
  horasEstudio: 1,
  horasDeporte: 0,
  horasOracionCantando: 0,
  ayunos: 0,
  coronillas: 0,
  voluntariados: 0,
  misas: 1,
};

const mockDto: CreateOracionDTO = {
  laudes: 1,
  visperas: 1,
  completas: 0,
  angelusReginaCoeli: 0,
  misteriosRosario: 0,
  horasSantisimo: 0,
  horasOracion: 0,
  novenas: 0,
  horasTrabajo: 2,
  horasEstudio: 1,
  horasDeporte: 0,
  horasOracionCantando: 0,
  ayunos: 0,
  coronillas: 0,
  voluntariados: 0,
  misas: 1,
};

const mockOracionesPort = {
  create: vi.fn(),
  list: vi.fn(),
  getById: vi.fn(),
  getSumatorio: vi.fn(),
};

describe('CreateOracionUseCase', () => {
  let useCase: CreateOracionUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        CreateOracionUseCase,
        { provide: OracionesPort, useValue: mockOracionesPort },
      ],
    });
    useCase = TestBed.inject(CreateOracionUseCase);
  });

  it('delegates to oracionesPort.create() with the given DTO', () => {
    mockOracionesPort.create.mockReturnValue(of(mockOracion));

    useCase.execute(mockDto).subscribe();

    expect(mockOracionesPort.create).toHaveBeenCalledWith(mockDto);
  });

  it('returns the created oracion from the port', () => {
    mockOracionesPort.create.mockReturnValue(of(mockOracion));

    let result: Oracion | undefined;
    useCase.execute(mockDto).subscribe(r => {
      result = r;
    });

    expect(result).toEqual(mockOracion);
  });
});
