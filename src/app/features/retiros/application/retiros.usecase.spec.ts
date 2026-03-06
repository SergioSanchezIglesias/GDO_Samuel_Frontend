import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PaginatedResponse } from '../../../shared/models/paginated-response.model';
import type { CreateRetiroDTO, Retiro, UpdateRetiroDTO } from '../domain/models/retiro.model';
import { RetiroPort } from '../domain/ports/retiro.port';
import { CreateRetiroUseCase } from './create-retiro.usecase';
import { DeleteRetiroUseCase } from './delete-retiro.usecase';
import { GetRetiroUseCase } from './get-retiro.usecase';
import { ListRetirosUseCase } from './list-retiros.usecase';
import { UpdateRetiroUseCase } from './update-retiro.usecase';

const mockRetiro: Retiro = {
  id: 1,
  fechaInicio: '2026-02-15',
  fechaFin: '2026-02-20',
  ubicacion: 'Ávila',
  codigo: 'ABC123',
};

const mockPaginated: PaginatedResponse<Retiro> = {
  data: [mockRetiro],
  page: 1,
  limit: 20,
  total: 1,
};

const mockRetiroPort = {
  getAll: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

function setupTestBed(useCase: unknown): void {
  TestBed.configureTestingModule({
    providers: [
      useCase,
      { provide: RetiroPort, useValue: mockRetiroPort },
    ],
  });
}

describe('ListRetirosUseCase', () => {
  let useCase: ListRetirosUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    setupTestBed(ListRetirosUseCase);
    useCase = TestBed.inject(ListRetirosUseCase);
  });

  it('delegates to retiroPort.getAll() with the given params', () => {
    mockRetiroPort.getAll.mockReturnValue(of(mockPaginated));

    useCase.execute(1, 20, 'Ávila').subscribe();

    expect(mockRetiroPort.getAll).toHaveBeenCalledWith(1, 20, 'Ávila');
  });

  it('returns the observable from the port', () => {
    mockRetiroPort.getAll.mockReturnValue(of(mockPaginated));

    let result: PaginatedResponse<Retiro> | undefined;
    useCase.execute(1, 20).subscribe((r) => {
      result = r;
    });

    expect(result).toEqual(mockPaginated);
  });

  it('forwards undefined ubicacion when not provided', () => {
    mockRetiroPort.getAll.mockReturnValue(of(mockPaginated));

    useCase.execute(1, 20).subscribe();

    expect(mockRetiroPort.getAll).toHaveBeenCalledWith(1, 20, undefined);
  });
});

describe('GetRetiroUseCase', () => {
  let useCase: GetRetiroUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    setupTestBed(GetRetiroUseCase);
    useCase = TestBed.inject(GetRetiroUseCase);
  });

  it('delegates to retiroPort.getById() with the given id', () => {
    mockRetiroPort.getById.mockReturnValue(of(mockRetiro));

    useCase.execute(1).subscribe();

    expect(mockRetiroPort.getById).toHaveBeenCalledWith(1);
  });

  it('returns the observable from the port', () => {
    mockRetiroPort.getById.mockReturnValue(of(mockRetiro));

    let result: Retiro | undefined;
    useCase.execute(1).subscribe((r) => {
      result = r;
    });

    expect(result).toEqual(mockRetiro);
  });
});

describe('CreateRetiroUseCase', () => {
  let useCase: CreateRetiroUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    setupTestBed(CreateRetiroUseCase);
    useCase = TestBed.inject(CreateRetiroUseCase);
  });

  it('delegates to retiroPort.create() with the DTO', () => {
    const dto: CreateRetiroDTO = {
      fechaInicio: '2026-02-15',
      fechaFin: '2026-02-20',
      ubicacion: 'Ávila',
    };
    mockRetiroPort.create.mockReturnValue(of(mockRetiro));

    useCase.execute(dto).subscribe();

    expect(mockRetiroPort.create).toHaveBeenCalledWith(dto);
  });

  it('returns the created retiro from the port', () => {
    const dto: CreateRetiroDTO = {
      fechaInicio: '2026-02-15',
      fechaFin: '2026-02-20',
      ubicacion: 'Ávila',
    };
    mockRetiroPort.create.mockReturnValue(of(mockRetiro));

    let result: Retiro | undefined;
    useCase.execute(dto).subscribe((r) => {
      result = r;
    });

    expect(result).toEqual(mockRetiro);
  });
});

describe('UpdateRetiroUseCase', () => {
  let useCase: UpdateRetiroUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    setupTestBed(UpdateRetiroUseCase);
    useCase = TestBed.inject(UpdateRetiroUseCase);
  });

  it('delegates to retiroPort.update() with id and DTO', () => {
    const dto: UpdateRetiroDTO = { ubicacion: 'Madrid' };
    mockRetiroPort.update.mockReturnValue(of({ ...mockRetiro, ubicacion: 'Madrid' }));

    useCase.execute(1, dto).subscribe();

    expect(mockRetiroPort.update).toHaveBeenCalledWith(1, dto);
  });

  it('returns the updated retiro from the port', () => {
    const updated = { ...mockRetiro, ubicacion: 'Madrid' };
    mockRetiroPort.update.mockReturnValue(of(updated));

    let result: Retiro | undefined;
    useCase.execute(1, { ubicacion: 'Madrid' }).subscribe((r) => {
      result = r;
    });

    expect(result).toEqual(updated);
  });
});

describe('DeleteRetiroUseCase', () => {
  let useCase: DeleteRetiroUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    setupTestBed(DeleteRetiroUseCase);
    useCase = TestBed.inject(DeleteRetiroUseCase);
  });

  it('delegates to retiroPort.delete() with the given id', () => {
    mockRetiroPort.delete.mockReturnValue(of(undefined));

    useCase.execute(1).subscribe();

    expect(mockRetiroPort.delete).toHaveBeenCalledWith(1);
  });

  it('returns the void observable from the port', () => {
    mockRetiroPort.delete.mockReturnValue(of(undefined));

    let called = false;
    useCase.execute(1).subscribe(() => {
      called = true;
    });

    expect(called).toBe(true);
  });
});
