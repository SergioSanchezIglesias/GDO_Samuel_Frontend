import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SumatorioOraciones } from '../domain/models/oracion.model';
import { OracionesPort } from '../domain/ports/oraciones.port';
import { GetSumatorioOracionesUseCase } from './get-sumatorio-oraciones.use-case';

const mockSumatorio: SumatorioOraciones = {
  laudes: 5,
  visperas: 3,
  completas: 2,
  angelusReginaCoeli: 7,
  misteriosRosario: 4,
  horasSantisimo: 1,
  horasOracion: 10,
  novenas: 0,
  horasTrabajo: 40,
  horasEstudio: 20,
  horasDeporte: 5,
  horasOracionCantando: 3,
  ayunos: 2,
  coronillas: 1,
  voluntariados: 0,
  misas: 8,
};

const mockOracionesPort = {
  create: vi.fn(),
  list: vi.fn(),
  getById: vi.fn(),
  getSumatorio: vi.fn(),
};

describe('GetSumatorioOracionesUseCase', () => {
  let useCase: GetSumatorioOracionesUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        GetSumatorioOracionesUseCase,
        { provide: OracionesPort, useValue: mockOracionesPort },
      ],
    });
    useCase = TestBed.inject(GetSumatorioOracionesUseCase);
  });

  it('delegates to oracionesPort.getSumatorio() with the given retiroId', () => {
    mockOracionesPort.getSumatorio.mockReturnValue(of(mockSumatorio));

    useCase.execute(5).subscribe();

    expect(mockOracionesPort.getSumatorio).toHaveBeenCalledWith(5);
  });

  it('returns the sumatorio from the port', () => {
    mockOracionesPort.getSumatorio.mockReturnValue(of(mockSumatorio));

    let result: SumatorioOraciones | undefined;
    useCase.execute(5).subscribe(r => {
      result = r;
    });

    expect(result).toEqual(mockSumatorio);
  });
});
