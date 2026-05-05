import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RetiroParticipacion } from '../domain/models/retiro-participacion.model';
import { OracionesPort } from '../domain/ports/oraciones.port';
import { GetRetirosByUsuarioUseCase } from './get-retiros-by-usuario.use-case';

const mockRetiros: RetiroParticipacion[] = [
  {
    oracionId: 42,
    retiroId: 7,
    ubicacion: 'Madrid',
    fechaInicio: '2025-03-12T00:00:00.000Z',
    fechaFin: '2025-03-14T00:00:00.000Z',
  },
];

const mockOracionesPort = {
  create: vi.fn(),
  list: vi.fn(),
  getById: vi.fn(),
  getSumatorio: vi.fn(),
  getSumatorioByUsuario: vi.fn(),
  getRetirosByUsuario: vi.fn(),
  getRetiroInfo: vi.fn(),
};

describe('GetRetirosByUsuarioUseCase', () => {
  let useCase: GetRetirosByUsuarioUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        GetRetirosByUsuarioUseCase,
        { provide: OracionesPort, useValue: mockOracionesPort },
      ],
    });
    useCase = TestBed.inject(GetRetirosByUsuarioUseCase);
  });

  it('delegates to oracionesPort.getRetirosByUsuario() with the given usuarioId', () => {
    mockOracionesPort.getRetirosByUsuario.mockReturnValue(of(mockRetiros));

    useCase.execute(10).subscribe();

    expect(mockOracionesPort.getRetirosByUsuario).toHaveBeenCalledWith(10);
  });

  it('returns the retiros from the port', () => {
    mockOracionesPort.getRetirosByUsuario.mockReturnValue(of(mockRetiros));

    let result: RetiroParticipacion[] | undefined;
    useCase.execute(10).subscribe(r => {
      result = r;
    });

    expect(result).toEqual(mockRetiros);
  });
});
