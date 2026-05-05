import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SumatorioOraciones } from '../domain/models/oracion.model';
import { OracionesPort } from '../domain/ports/oraciones.port';
import { GetSumatorioByUsuarioUseCase } from './get-sumatorio-by-usuario.use-case';

const mockSumatorio: SumatorioOraciones = {
  laudes: 12,
  visperas: 8,
  completas: 4,
  angelusReginaCoeli: 6,
  misteriosRosario: 3,
  horasSantisimo: 2,
  horasOracion: 25,
  novenas: 1,
  horasTrabajo: 80,
  horasEstudio: 30,
  horasDeporte: 12,
  horasOracionCantando: 5,
  ayunos: 6,
  coronillas: 4,
  voluntariados: 2,
  misas: 20,
};

const mockOracionesPort = {
  create: vi.fn(),
  list: vi.fn(),
  getById: vi.fn(),
  getSumatorio: vi.fn(),
  getSumatorioByUsuario: vi.fn(),
  getRetiroInfo: vi.fn(),
};

describe('GetSumatorioByUsuarioUseCase', () => {
  let useCase: GetSumatorioByUsuarioUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        GetSumatorioByUsuarioUseCase,
        { provide: OracionesPort, useValue: mockOracionesPort },
      ],
    });
    useCase = TestBed.inject(GetSumatorioByUsuarioUseCase);
  });

  it('delegates to oracionesPort.getSumatorioByUsuario() with the given usuarioId', () => {
    mockOracionesPort.getSumatorioByUsuario.mockReturnValue(of(mockSumatorio));

    useCase.execute(10).subscribe();

    expect(mockOracionesPort.getSumatorioByUsuario).toHaveBeenCalledWith(10);
  });

  it('returns the sumatorio from the port', () => {
    mockOracionesPort.getSumatorioByUsuario.mockReturnValue(of(mockSumatorio));

    let result: SumatorioOraciones | undefined;
    useCase.execute(10).subscribe(r => {
      result = r;
    });

    expect(result).toEqual(mockSumatorio);
  });
});
