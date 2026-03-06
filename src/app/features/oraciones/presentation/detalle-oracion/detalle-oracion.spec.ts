import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GetOracionByIdUseCase } from '../../application/get-oracion-by-id.use-case';
import { GetRetiroInfoUseCase } from '../../application/get-retiro-info.use-case';
import type { Oracion } from '../../domain/models/oracion.model';
import type { RetiroInfo } from '../../domain/models/retiro-info.model';
import { DetalleOracionComponent } from './detalle-oracion';

const mockOracion: Oracion = {
  id: 42,
  usuarioId: 10,
  retiroId: 5,
  laudes: 1,
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

const mockRetiroInfo: RetiroInfo = {
  id: 5,
  fechaInicio: '2024-03-15',
  ubicacion: 'Madrid',
};

const mockGetOracionByIdUseCase = { execute: vi.fn() };
const mockGetRetiroInfoUseCase = { execute: vi.fn() };

function buildActivatedRoute(id: string) {
  return {
    snapshot: {
      paramMap: {
        get: (key: string) => (key === 'id' ? id : null),
      },
    },
  };
}

async function buildTestBed(
  id: string,
  oracionResult = of(mockOracion),
  retiroInfoResult = of(mockRetiroInfo),
) {
  mockGetOracionByIdUseCase.execute.mockReturnValue(oracionResult);
  mockGetRetiroInfoUseCase.execute.mockReturnValue(retiroInfoResult);

  await TestBed.configureTestingModule({
    imports: [DetalleOracionComponent],
    providers: [
      { provide: ActivatedRoute, useValue: buildActivatedRoute(id) },
      { provide: GetOracionByIdUseCase, useValue: mockGetOracionByIdUseCase },
      { provide: GetRetiroInfoUseCase, useValue: mockGetRetiroInfoUseCase },
    ],
  }).compileComponents();
}

describe('DetalleOracionComponent', () => {
  let fixture: ComponentFixture<DetalleOracionComponent>;
  let component: DetalleOracionComponent;

  beforeEach(async () => {
    vi.clearAllMocks();
    await buildTestBed('42');

    fixture = TestBed.createComponent(DetalleOracionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('loads oracion by route param :id', () => {
    expect(mockGetOracionByIdUseCase.execute).toHaveBeenCalledWith(42);
    expect(component.oracion()).toEqual(mockOracion);
  });

  it('displays retiro title as "{ubicacion} - dd/MM/yyyy" when retiro info is available', () => {
    // retiroInfo was loaded: Madrid, 2024-03-15
    const title = component.getHeaderTitle();
    expect(title).toBe('Madrid - 15/03/2024');
  });

  it('falls back to "Registro #N" when retiro info fetch fails', async () => {
    vi.clearAllMocks();
    await buildTestBed('42', of(mockOracion), throwError(() => new Error('not found')));

    const fallbackFixture = TestBed.createComponent(DetalleOracionComponent);
    const fallbackComponent = fallbackFixture.componentInstance;
    fallbackFixture.detectChanges();
    await fallbackFixture.whenStable();

    // retiroInfo is null because the fetch failed — must fall back
    expect(fallbackComponent.retiroInfo()).toBeNull();
    expect(fallbackComponent.getHeaderTitle()).toBe('Registro #42');
  });
});
