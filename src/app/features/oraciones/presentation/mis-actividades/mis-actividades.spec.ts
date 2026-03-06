import { signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TokenStoragePort } from '../../../auth/domain/ports/token-storage.port';
import { GetSumatorioOracionesUseCase } from '../../application/get-sumatorio-oraciones.use-case';
import { ListOracionesUseCase } from '../../application/list-oraciones.use-case';
import type { Oracion, SumatorioOraciones } from '../../domain/models/oracion.model';
import { MisActividadesComponent } from './mis-actividades';

// JWT with payload { sub: "10", idRetiro: 5 }
const fakeJwtPayload = btoa(JSON.stringify({ sub: '10', idRetiro: 5 })).replace(/=/g, '');
const fakeToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${fakeJwtPayload}.fake-signature`;

const mockOracion: Oracion = {
  id: 1,
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
  ayunos: 2,
  coronillas: 0,
  voluntariados: 0,
  misas: 3,
};

const mockSumatorio: SumatorioOraciones = {
  laudes: 5,
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
  ayunos: 4,
  coronillas: 0,
  voluntariados: 0,
  misas: 10,
};

const mockListOracionesUseCase = { execute: vi.fn() };
const mockGetSumatorioUseCase = { execute: vi.fn() };
const mockTokenStorage = {
  accessToken: signal<string | null>(fakeToken),
  isAuthenticated: signal(true),
  userRole: signal(null),
  saveTokens: () => {},
  getRefreshToken: () => null,
  clearTokens: () => {},
};

function buildTestBed(listResult = of({ data: [mockOracion], page: 1, limit: 20, total: 1 })) {
  mockListOracionesUseCase.execute.mockReturnValue(listResult);
  mockGetSumatorioUseCase.execute.mockReturnValue(of(mockSumatorio));

  return TestBed.configureTestingModule({
    imports: [MisActividadesComponent],
    providers: [
      provideRouter([]),
      { provide: ListOracionesUseCase, useValue: mockListOracionesUseCase },
      { provide: GetSumatorioOracionesUseCase, useValue: mockGetSumatorioUseCase },
      { provide: TokenStoragePort, useValue: mockTokenStorage },
    ],
  }).compileComponents();
}

describe('MisActividadesComponent', () => {
  let fixture: ComponentFixture<MisActividadesComponent>;
  let component: MisActividadesComponent;

  beforeEach(async () => {
    vi.clearAllMocks();
    await buildTestBed();

    fixture = TestBed.createComponent(MisActividadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('loads oraciones on init via the constructor effect', () => {
    expect(mockListOracionesUseCase.execute).toHaveBeenCalledWith(10, 5, 1, 20);
    expect(component.oraciones()).toEqual([mockOracion]);
  });

  it('loads sumatorio after oraciones load', () => {
    expect(mockGetSumatorioUseCase.execute).toHaveBeenCalledWith(5);
    expect(component.sumatorio()).toEqual(mockSumatorio);
  });

  it('isLoading is false after data is loaded', () => {
    expect(component.isLoading()).toBe(false);
  });

  it('summary card shows total oraciones count', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const statValues = fixture.nativeElement.querySelectorAll(
      '.summary-card__value',
    ) as NodeListOf<HTMLElement>;

    // First stat: totalOraciones (number of records in the list)
    expect(statValues[0].textContent?.trim()).toBe('1');
  });

  it('summary card shows total misas from sumatorio', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const statValues = fixture.nativeElement.querySelectorAll(
      '.summary-card__value',
    ) as NodeListOf<HTMLElement>;

    // Second stat: totalMisas
    expect(statValues[1].textContent?.trim()).toBe('10');
  });

  it('summary card shows total ayunos from sumatorio', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const statValues = fixture.nativeElement.querySelectorAll(
      '.summary-card__value',
    ) as NodeListOf<HTMLElement>;

    // Third stat: totalAyunos
    expect(statValues[2].textContent?.trim()).toBe('4');
  });

  it('renders one list item per oracion', () => {
    const listItems = fixture.nativeElement.querySelectorAll('app-list-item');
    expect(listItems.length).toBe(1);
  });

  it('does not show empty state when oraciones are present', () => {
    const emptyEl = fixture.nativeElement.querySelector('.empty-state') as HTMLElement | null;
    expect(emptyEl).toBeNull();
  });
});

describe('MisActividadesComponent — empty state', () => {
  it('shows empty state when no oraciones exist', async () => {
    vi.clearAllMocks();
    await buildTestBed(of({ data: [], page: 1, limit: 20, total: 0 }));

    const emptyFixture = TestBed.createComponent(MisActividadesComponent);
    emptyFixture.detectChanges();
    await emptyFixture.whenStable();

    const emptyEl = emptyFixture.nativeElement.querySelector('.empty-state') as HTMLElement;
    expect(emptyEl).toBeTruthy();
    expect(emptyEl.textContent?.trim()).toContain('No hay actividades registradas');
  });
});
