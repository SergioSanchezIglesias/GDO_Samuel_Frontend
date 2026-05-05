import { signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TokenStoragePort } from '../../../auth/domain/ports/token-storage.port';
import { GetRetirosByUsuarioUseCase } from '../../application/get-retiros-by-usuario.use-case';
import { GetSumatorioByUsuarioUseCase } from '../../application/get-sumatorio-by-usuario.use-case';
import type { SumatorioOraciones } from '../../domain/models/oracion.model';
import type { RetiroParticipacion } from '../../domain/models/retiro-participacion.model';
import { MisActividadesComponent } from './mis-actividades';

// JWT with payload { sub: "10", idRetiro: 5 }
const fakeJwtPayload = btoa(JSON.stringify({ sub: '10', idRetiro: 5 })).replace(/=/g, '');
const fakeToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${fakeJwtPayload}.fake-signature`;

const mockRetiros: RetiroParticipacion[] = [
  {
    oracionId: 42,
    retiroId: 7,
    ubicacion: 'Madrid',
    fechaInicio: '2025-03-12T00:00:00.000Z',
    fechaFin: '2025-03-14T00:00:00.000Z',
  },
  {
    oracionId: 28,
    retiroId: 3,
    ubicacion: 'Ávila',
    fechaInicio: '2024-12-06T00:00:00.000Z',
    fechaFin: '2024-12-08T00:00:00.000Z',
  },
];

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

const mockGetRetirosUseCase = { execute: vi.fn() };
const mockGetSumatorioUseCase = { execute: vi.fn() };
const mockTokenStorage = {
  accessToken: signal<string | null>(fakeToken),
  isAuthenticated: signal(true),
  userRole: signal(null),
  idRetiro: signal<number | null>(null),
  saveTokens: () => {},
  getRefreshToken: () => null,
  clearTokens: () => {},
};

function buildTestBed(retirosResult = of(mockRetiros)) {
  mockGetRetirosUseCase.execute.mockReturnValue(retirosResult);
  mockGetSumatorioUseCase.execute.mockReturnValue(of(mockSumatorio));

  return TestBed.configureTestingModule({
    imports: [MisActividadesComponent],
    providers: [
      provideRouter([]),
      { provide: GetRetirosByUsuarioUseCase, useValue: mockGetRetirosUseCase },
      { provide: GetSumatorioByUsuarioUseCase, useValue: mockGetSumatorioUseCase },
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

  it('loads retiros via getRetirosByUsuario use case with usuarioId from token', () => {
    expect(mockGetRetirosUseCase.execute).toHaveBeenCalledWith(10);
    expect(component.retiros()).toEqual(mockRetiros);
  });

  it('loads sumatorio by usuario in parallel with retiros', () => {
    expect(mockGetSumatorioUseCase.execute).toHaveBeenCalledWith(10);
    expect(component.sumatorio()).toEqual(mockSumatorio);
  });

  it('isLoading is false after data is loaded', () => {
    expect(component.isLoading()).toBe(false);
  });

  it('renders one list item per retiro', () => {
    const listItems = fixture.nativeElement.querySelectorAll('app-list-item');
    expect(listItems.length).toBe(mockRetiros.length);
  });

  it('does not show empty state when retiros are present', () => {
    const emptyEl = fixture.nativeElement.querySelector('.empty-state') as HTMLElement | null;
    expect(emptyEl).toBeNull();
  });
});

describe('MisActividadesComponent — empty state', () => {
  it('shows empty state when no retiros exist', async () => {
    vi.clearAllMocks();
    await buildTestBed(of([]));

    const emptyFixture = TestBed.createComponent(MisActividadesComponent);
    emptyFixture.detectChanges();
    await emptyFixture.whenStable();

    const emptyEl = emptyFixture.nativeElement.querySelector('.empty-state') as HTMLElement;
    expect(emptyEl).toBeTruthy();
    expect(emptyEl.textContent?.trim()).toContain('No hay actividades registradas');
  });
});

describe('MisActividadesComponent — error state', () => {
  it('hides the historial section header when retiros fetch fails', async () => {
    vi.clearAllMocks();
    await buildTestBed(throwError(() => new Error('boom')));

    const errorFixture = TestBed.createComponent(MisActividadesComponent);
    errorFixture.detectChanges();
    await errorFixture.whenStable();

    const sectionHeaders = errorFixture.nativeElement.querySelectorAll('app-section-header');
    const historyHeader = Array.from(sectionHeaders as NodeListOf<HTMLElement>).find(
      (el) => el.getAttribute('icon') === 'history',
    );
    expect(historyHeader).toBeUndefined();

    const errorEl = errorFixture.nativeElement.querySelector('.error-message') as HTMLElement;
    expect(errorEl).toBeTruthy();
  });
});

describe('MisActividadesComponent — getRetiroSubtitle', () => {
  let component: MisActividadesComponent;

  beforeEach(async () => {
    vi.clearAllMocks();
    await buildTestBed();

    const fixture = TestBed.createComponent(MisActividadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('formats fechaInicio - fechaFin as dd/mm/yyyy - dd/mm/yyyy', () => {
    const subtitle = component.getRetiroSubtitle(mockRetiros[0]);
    expect(subtitle).toBe('12/03/2025 - 14/03/2025');
  });
});

describe('MisActividadesComponent — navigation', () => {
  let component: MisActividadesComponent;
  let router: Router;

  beforeEach(async () => {
    vi.clearAllMocks();
    await buildTestBed();

    const fixture = TestBed.createComponent(MisActividadesComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('navigates to /oraciones/:oracionId when navigateToDetail is called', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.navigateToDetail(42);

    expect(navigateSpy).toHaveBeenCalledWith(['/oraciones', 42]);
  });
});
