import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { API_URL } from '../../../core/config/api.config';
import { TokenStoragePort } from '../../auth/domain/ports/token-storage.port';
import { GetRetiroInfoUseCase } from '../../oraciones/application/get-retiro-info.use-case';
import { GetSumatorioOracionesUseCase } from '../../oraciones/application/get-sumatorio-oraciones.use-case';
import type { SumatorioOraciones } from '../../oraciones/domain/models/oracion.model';
import type { RetiroInfo } from '../../oraciones/domain/models/retiro-info.model';
import { DashboardComponent } from './dashboard';

// ---------------------------------------------------------------------------
// JWT fixtures
// ---------------------------------------------------------------------------

// JWT with payload { sub: "10", idRetiro: 5 }
const fakeJwtPayload = btoa(JSON.stringify({ sub: '10', idRetiro: 5 })).replace(/=/g, '');
const fakeTokenWithRetiro = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${fakeJwtPayload}.fake-sig`;

// JWT with payload { sub: "20" } — no idRetiro field
const fakeJwtPayloadNoRetiro = btoa(JSON.stringify({ sub: '20' })).replace(/=/g, '');
const fakeTokenNoRetiro = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${fakeJwtPayloadNoRetiro}.fake-sig`;

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockSumatorio: SumatorioOraciones = {
  laudes: 5,
  visperas: 2,
  completas: 1,
  angelusReginaCoeli: 0,
  misteriosRosario: 3,
  horasSantisimo: 0,
  horasOracion: 10,
  novenas: 1,
  horasTrabajo: 4,
  horasEstudio: 6,
  horasDeporte: 2,
  horasOracionCantando: 0,
  ayunos: 4,
  coronillas: 0,
  voluntariados: 1,
  misas: 10,
};

const mockRetiroInfo: RetiroInfo = {
  id: 5,
  fechaInicio: '2024-03-15',
  ubicacion: 'Madrid',
};

// ---------------------------------------------------------------------------
// Mock providers (mutable so each suite can override token)
// ---------------------------------------------------------------------------

const mockGetSumatorioUseCase = { execute: vi.fn() };
const mockGetRetiroInfoUseCase = { execute: vi.fn() };

function makeMockTokenStorage(token: string | null) {
  return {
    accessToken: signal<string | null>(token),
    isAuthenticated: signal(true),
    userRole: signal(null),
    saveTokens: () => {},
    getRefreshToken: () => null,
    clearTokens: vi.fn(),
  };
}

// ---------------------------------------------------------------------------
// TestBed builder
// ---------------------------------------------------------------------------

async function buildTestBed(
  token: string | null = fakeTokenWithRetiro,
  sumatorioResult = of(mockSumatorio),
  retiroInfoResult = of(mockRetiroInfo),
) {
  mockGetSumatorioUseCase.execute.mockReturnValue(sumatorioResult);
  mockGetRetiroInfoUseCase.execute.mockReturnValue(retiroInfoResult);

  await TestBed.configureTestingModule({
    imports: [DashboardComponent],
    providers: [
      provideRouter([]),
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: API_URL, useValue: 'http://localhost:3000' },
      { provide: GetSumatorioOracionesUseCase, useValue: mockGetSumatorioUseCase },
      { provide: GetRetiroInfoUseCase, useValue: mockGetRetiroInfoUseCase },
      { provide: TokenStoragePort, useValue: makeMockTokenStorage(token) },
    ],
  }).compileComponents();
}

// ---------------------------------------------------------------------------
// Suite: happy path — user with active retiro
// ---------------------------------------------------------------------------

describe('DashboardComponent — happy path', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;

  beforeEach(async () => {
    vi.clearAllMocks();
    await buildTestBed();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('calls GetSumatorioOracionesUseCase.execute with the retiroId from JWT', () => {
    expect(mockGetSumatorioUseCase.execute).toHaveBeenCalledWith(5);
  });

  it('calls GetRetiroInfoUseCase.execute with the retiroId from JWT', () => {
    expect(mockGetRetiroInfoUseCase.execute).toHaveBeenCalledWith(5);
  });

  it('sets sumatorio signal after successful load', () => {
    expect(component.sumatorio()).toEqual(mockSumatorio);
  });

  it('sets retiroInfo signal after successful load', () => {
    expect(component.retiroInfo()).toEqual(mockRetiroInfo);
  });

  it('sets isLoading to false after both use cases resolve', () => {
    expect(component.isLoading()).toBe(false);
  });

  it('error signal is null on successful load', () => {
    expect(component.error()).toBeNull();
  });

  it('renders the retiro info card with ubicacion when sumatorio is loaded', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const retiroCard = fixture.nativeElement.querySelector('.retiro-card') as HTMLElement | null;
    expect(retiroCard).toBeTruthy();
    expect(retiroCard?.textContent).toContain('Madrid');
  });

  it('renders the activity grid (app-activity-grid) when sumatorio is loaded', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const grid = fixture.nativeElement.querySelector('app-activity-grid') as HTMLElement | null;
    expect(grid).toBeTruthy();
  });

  it('does not show loading skeleton after load completes', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const skeleton = fixture.nativeElement.querySelector('.loading-state') as HTMLElement | null;
    expect(skeleton).toBeNull();
  });

  it('does not show empty state when retiroId is present', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const emptyState = fixture.nativeElement.querySelector('.empty-state') as HTMLElement | null;
    expect(emptyState).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Suite: loading state
// ---------------------------------------------------------------------------

describe('DashboardComponent — loading state', () => {
  it('isLoading is true while forkJoin is in flight', async () => {
    vi.clearAllMocks();

    // Use a Subject that never completes so forkJoin stays pending
    const { Subject } = await import('rxjs');
    const pending$ = new Subject<SumatorioOraciones>();
    mockGetSumatorioUseCase.execute.mockReturnValue(pending$.asObservable());
    mockGetRetiroInfoUseCase.execute.mockReturnValue(pending$.asObservable());

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://localhost:3000' },
        { provide: GetSumatorioOracionesUseCase, useValue: mockGetSumatorioUseCase },
        { provide: GetRetiroInfoUseCase, useValue: mockGetRetiroInfoUseCase },
        { provide: TokenStoragePort, useValue: makeMockTokenStorage(fakeTokenWithRetiro) },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DashboardComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isLoading()).toBe(true);

    const skeleton = fixture.nativeElement.querySelector('.loading-state') as HTMLElement | null;
    expect(skeleton).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Suite: empty state — user without active retiro
// ---------------------------------------------------------------------------

describe('DashboardComponent — empty state (no retiroId in JWT)', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;

  beforeEach(async () => {
    vi.clearAllMocks();
    await buildTestBed(fakeTokenNoRetiro);

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('does NOT call GetSumatorioOracionesUseCase when retiroId is absent', () => {
    expect(mockGetSumatorioUseCase.execute).not.toHaveBeenCalled();
  });

  it('does NOT call GetRetiroInfoUseCase when retiroId is absent', () => {
    expect(mockGetRetiroInfoUseCase.execute).not.toHaveBeenCalled();
  });

  it('sets isLoading to false immediately when retiroId is absent', () => {
    expect(component.isLoading()).toBe(false);
  });

  it('shows empty state element with "Sin retiro activo" text', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const emptyState = fixture.nativeElement.querySelector('.empty-state') as HTMLElement | null;
    expect(emptyState).toBeTruthy();
    expect(emptyState?.textContent).toContain('Sin retiro activo');
  });

  it('does not render the activity grid when retiroId is absent', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const grid = fixture.nativeElement.querySelector('app-activity-grid') as HTMLElement | null;
    expect(grid).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Suite: empty state — null token
// ---------------------------------------------------------------------------

describe('DashboardComponent — empty state (null token)', () => {
  it('shows empty state and makes no API calls when access token is null', async () => {
    vi.clearAllMocks();
    await buildTestBed(null);

    const fixture = TestBed.createComponent(DashboardComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isLoading()).toBe(false);
    expect(mockGetSumatorioUseCase.execute).not.toHaveBeenCalled();
    expect(mockGetRetiroInfoUseCase.execute).not.toHaveBeenCalled();

    const emptyState = fixture.nativeElement.querySelector('.empty-state') as HTMLElement | null;
    expect(emptyState).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Suite: error state — API failure
// ---------------------------------------------------------------------------

describe('DashboardComponent — error state', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;

  beforeEach(async () => {
    vi.clearAllMocks();
    await buildTestBed(
      fakeTokenWithRetiro,
      throwError(() => new Error('Network error')),
      throwError(() => new Error('Network error')),
    );

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('sets error signal when use cases fail', () => {
    expect(component.error()).toBeTruthy();
  });

  it('sets isLoading to false when use cases fail', () => {
    expect(component.isLoading()).toBe(false);
  });

  it('renders error message element when use cases fail', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const errorEl = fixture.nativeElement.querySelector('.error-message') as HTMLElement | null;
    expect(errorEl).toBeTruthy();
  });

  it('does not render the activity grid on error', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const grid = fixture.nativeElement.querySelector('app-activity-grid') as HTMLElement | null;
    expect(grid).toBeNull();
  });

  it('sumatorio signal remains null on error', () => {
    expect(component.sumatorio()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Suite: navigation
// ---------------------------------------------------------------------------

describe('DashboardComponent — navigation', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;
  let router: Router;

  beforeEach(async () => {
    vi.clearAllMocks();
    await buildTestBed();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('navigates to /oraciones/nueva when navigateToRegistrar is called', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.navigateToRegistrar();

    expect(navigateSpy).toHaveBeenCalledWith(['/oraciones/nueva']);
  });
});

// ---------------------------------------------------------------------------
// Suite: logout
// ---------------------------------------------------------------------------

describe('DashboardComponent — logout', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;
  let router: Router;
  let httpMock: HttpTestingController;
  let mockTokenStorageWithSpy: ReturnType<typeof makeMockTokenStorage>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockGetSumatorioUseCase.execute.mockReturnValue(of(mockSumatorio));
    mockGetRetiroInfoUseCase.execute.mockReturnValue(of(mockRetiroInfo));
    mockTokenStorageWithSpy = makeMockTokenStorage(fakeTokenWithRetiro);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://localhost:3000' },
        { provide: GetSumatorioOracionesUseCase, useValue: mockGetSumatorioUseCase },
        { provide: GetRetiroInfoUseCase, useValue: mockGetRetiroInfoUseCase },
        { provide: TokenStoragePort, useValue: mockTokenStorageWithSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('calls clearTokens and navigates to /auth/login on successful logout', async () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.onLogout();

    const req = httpMock.expectOne('http://localhost:3000/auth/logout');
    req.flush(null);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(mockTokenStorageWithSpy.clearTokens).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);

    httpMock.verify();
  });

  it('still clears tokens and navigates to /auth/login when logout HTTP call fails', async () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.onLogout();

    const req = httpMock.expectOne('http://localhost:3000/auth/logout');
    req.error(new ProgressEvent('error'));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(mockTokenStorageWithSpy.clearTokens).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);

    httpMock.verify();
  });
});

// ---------------------------------------------------------------------------
// Suite: formatDate helper
// ---------------------------------------------------------------------------

describe('DashboardComponent — formatDate', () => {
  let component: DashboardComponent;

  beforeEach(async () => {
    vi.clearAllMocks();
    await buildTestBed();

    const fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('formats ISO date string as dd/MM/yyyy', () => {
    expect(component['formatDate']('2024-03-15')).toBe('15/03/2024');
  });

  it('handles single-digit day and month with zero-padding', () => {
    expect(component['formatDate']('2024-01-05')).toBe('05/01/2024');
  });
});
