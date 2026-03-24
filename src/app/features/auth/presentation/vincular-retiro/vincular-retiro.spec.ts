import { signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthTokens } from '../../domain/models/auth.model';
import type { UserRole } from '../../domain/models/auth.model';
import { TokenStoragePort } from '../../domain/ports/token-storage.port';
import { VincularRetiroUseCase } from '../../application/vincular-retiro.usecase';
import { VincularRetiroComponent } from './vincular-retiro';

describe('VincularRetiroComponent', () => {
  let fixture: ComponentFixture<VincularRetiroComponent>;
  let component: VincularRetiroComponent;
  let router: Router;

  const mockVincularRetiroUseCase = {
    execute: vi.fn(),
  };

  const mockTokenStorage = {
    accessToken: signal<string | null>(null),
    isAuthenticated: signal(false),
    userRole: signal<UserRole | null>('usuario'),
    idRetiro: signal<number | null>(null),
    saveTokens: vi.fn(),
    getRefreshToken: vi.fn(),
    clearTokens: vi.fn(),
  };

  const mockTokens: AuthTokens = {
    accessToken: 'new-access-token',
    refreshToken: 'new-refresh-token',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockTokenStorage.userRole.set('usuario');

    await TestBed.configureTestingModule({
      imports: [VincularRetiroComponent],
      providers: [
        provideRouter([{ path: 'dashboard', component: VincularRetiroComponent }]),
        { provide: VincularRetiroUseCase, useValue: mockVincularRetiroUseCase },
        { provide: TokenStoragePort, useValue: mockTokenStorage },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VincularRetiroComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should render the código de retiro input and submit button', () => {
    const labels = fixture.nativeElement.querySelectorAll('.input-label');
    const labelTexts = Array.from(labels).map((l: unknown) => (l as HTMLElement).textContent?.trim());

    expect(labelTexts).toContain('Código de retiro');
  });

  it('should have submit button disabled when input is empty', () => {
    const button = fixture.nativeElement.querySelector('.btn') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should show validation error "Debe ser 6 dígitos" for non-6-digit input', async () => {
    component.codigo.set('abc');
    fixture.detectChanges();
    await fixture.whenStable();

    const errors = fixture.nativeElement.querySelectorAll('.input-error');
    const errorTexts = Array.from(errors).map((e: unknown) => (e as HTMLElement).textContent?.trim());

    expect(errorTexts).toContain('Debe ser 6 dígitos');
  });

  it('should enable submit button when codigo is 6 digits', async () => {
    component.codigo.set('123456');
    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('.btn') as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });

  it('should call VincularRetiroUseCase.execute() on valid submit', async () => {
    mockVincularRetiroUseCase.execute.mockReturnValue(of(mockTokens));

    component.codigo.set('123456');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();

    expect(mockVincularRetiroUseCase.execute).toHaveBeenCalledWith('123456');
  });

  it('should navigate to /dashboard on success', async () => {
    mockVincularRetiroUseCase.execute.mockReturnValue(of(mockTokens));

    component.codigo.set('123456');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show "Código inválido" on 401 error', async () => {
    mockVincularRetiroUseCase.execute.mockReturnValue(throwError(() => ({ status: 401 })));

    component.codigo.set('000000');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();
    fixture.detectChanges();
    await fixture.whenStable();

    const errorDiv = fixture.nativeElement.querySelector('.auth-error');
    expect(errorDiv).toBeTruthy();
    expect(errorDiv.textContent.trim()).toBe('Código inválido');
  });

  it('should show generic error on server error', async () => {
    mockVincularRetiroUseCase.execute.mockReturnValue(throwError(() => ({ status: 500 })));

    component.codigo.set('999999');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();
    fixture.detectChanges();
    await fixture.whenStable();

    const errorDiv = fixture.nativeElement.querySelector('.auth-error');
    expect(errorDiv).toBeTruthy();
    expect(errorDiv.textContent.trim()).toBe('Error del servidor. Inténtalo de nuevo.');
  });

  it('should NOT show "Omitir" button for usuario', () => {
    mockTokenStorage.userRole.set('usuario');
    fixture.detectChanges();

    const skipBtn = fixture.nativeElement.querySelector('.skip-link');
    expect(skipBtn).toBeNull();
  });

  it('should show "Omitir" button for organizador', async () => {
    mockTokenStorage.userRole.set('organizador');
    fixture.detectChanges();
    await fixture.whenStable();

    const skipBtn = fixture.nativeElement.querySelector('.skip-link');
    expect(skipBtn).toBeTruthy();
  });

  it('should navigate to /dashboard when Omitir is clicked', async () => {
    mockTokenStorage.userRole.set('organizador');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSkip();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
