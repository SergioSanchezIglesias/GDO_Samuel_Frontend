import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RetiroInfo } from '../domain/models/retiro-info.model';
import { OracionesPort } from '../domain/ports/oraciones.port';
import { GetRetiroInfoUseCase } from './get-retiro-info.use-case';

const mockRetiroInfo: RetiroInfo = {
  id: 5,
  fechaInicio: '2024-03-15',
  ubicacion: 'Madrid',
};

const mockOracionesPort = {
  create: vi.fn(),
  list: vi.fn(),
  getById: vi.fn(),
  getSumatorio: vi.fn(),
  getRetiroInfo: vi.fn(),
};

describe('GetRetiroInfoUseCase', () => {
  let useCase: GetRetiroInfoUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        GetRetiroInfoUseCase,
        { provide: OracionesPort, useValue: mockOracionesPort },
      ],
    });
    useCase = TestBed.inject(GetRetiroInfoUseCase);
  });

  it('delegates to oracionesPort.getRetiroInfo() with the given retiroId', () => {
    mockOracionesPort.getRetiroInfo.mockReturnValue(of(mockRetiroInfo));

    useCase.execute(5).subscribe();

    expect(mockOracionesPort.getRetiroInfo).toHaveBeenCalledWith(5);
  });

  it('returns the retiro info from the port', () => {
    mockOracionesPort.getRetiroInfo.mockReturnValue(of(mockRetiroInfo));

    let result: RetiroInfo | undefined;
    useCase.execute(5).subscribe(r => {
      result = r;
    });

    expect(result).toEqual(mockRetiroInfo);
  });
});
