import { signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { User } from '../../domain/models/auth.model';
import type { UserRole } from '../../domain/models/auth.model';
import { API_URL } from '../../../../core/config/api.config';
import { LoginUseCase } from '../../application/login.usecase';
import { TokenStoragePort } from '../../domain/ports/token-storage.port';
import { LoginComponent } from './login';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let router: Router;

  const mockLoginUseCase = {
    execute: vi.fn(),
  };

  const mockTokenStorage = {
    accessToken: signal<string | null>(null),
    isAuthenticated: signal(false),
    userRole: signal<UserRole | null>(null),
    idRetiro: signal<number | null>(null),
    saveTokens: vi.fn(),
    getRefreshToken: vi.fn(),
    clearTokens: vi.fn(),
  };

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    provider: 'local',
    rol: 'usuario',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockTokenStorage.idRetiro.set(null);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([{ path: 'dashboard', component: LoginComponent }]),
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: TokenStoragePort, useValue: mockTokenStorage },
        { provide: API_URL, useValue: 'http://localhost:3000' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should render email and password inputs only', () => {
    const labels = fixture.nativeElement.querySelectorAll('.input-label');
    const labelTexts = Array.from(labels).map((l: unknown) => (l as HTMLElement).textContent?.trim());

    expect(labelTexts).toContain('Email');
    expect(labelTexts).toContain('Contraseña');
    expect(labelTexts).not.toContain('Código de retiro');
  });

  it('should have submit button disabled when form is invalid', () => {
    const button = fixture.nativeElement.querySelector('.btn') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should show email error for invalid email', async () => {
    component.email.set('invalid');
    fixture.detectChanges();
    await fixture.whenStable();

    const errors = fixture.nativeElement.querySelectorAll('.input-error');
    const errorTexts = Array.from(errors).map((e: unknown) => (e as HTMLElement).textContent?.trim());

    expect(errorTexts).toContain('Email no válido');
  });

  it('should show password error when < 8 chars', async () => {
    component.password.set('short');
    fixture.detectChanges();
    await fixture.whenStable();

    const errors = fixture.nativeElement.querySelectorAll('.input-error');
    const errorTexts = Array.from(errors).map((e: unknown) => (e as HTMLElement).textContent?.trim());

    expect(errorTexts).toContain('Mínimo 8 caracteres');
  });

  it('should call LoginUseCase.execute() on valid submit', async () => {
    mockLoginUseCase.execute.mockReturnValue(of(mockUser));

    component.email.set('test@example.com');
    component.password.set('password123');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();

    expect(mockLoginUseCase.execute).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should navigate to /auth/vincular-retiro when idRetiro is null after login', async () => {
    mockTokenStorage.idRetiro.set(null);
    mockLoginUseCase.execute.mockReturnValue(of(mockUser));

    component.email.set('test@example.com');
    component.password.set('password123');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/auth/vincular-retiro']);
  });

  it('should navigate to /dashboard when idRetiro has a value after login', async () => {
    mockTokenStorage.idRetiro.set(5);
    mockLoginUseCase.execute.mockReturnValue(of(mockUser));

    component.email.set('test@example.com');
    component.password.set('password123');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show "Credenciales inválidas" on 401 error', async () => {
    mockLoginUseCase.execute.mockReturnValue(throwError(() => ({ status: 401 })));

    component.email.set('test@example.com');
    component.password.set('password123');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();
    fixture.detectChanges();
    await fixture.whenStable();

    const errorDiv = fixture.nativeElement.querySelector('.auth-error');
    expect(errorDiv).toBeTruthy();
    expect(errorDiv.textContent.trim()).toBe('Credenciales inválidas');
  });

  it('should show generic error on server error', async () => {
    mockLoginUseCase.execute.mockReturnValue(throwError(() => ({ status: 500 })));

    component.email.set('test@example.com');
    component.password.set('password123');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();
    fixture.detectChanges();
    await fixture.whenStable();

    const errorDiv = fixture.nativeElement.querySelector('.auth-error');
    expect(errorDiv).toBeTruthy();
    expect(errorDiv.textContent.trim()).toBe('Error del servidor. Inténtalo de nuevo.');
  });

  it('should show loading state during submit', async () => {
    mockLoginUseCase.execute.mockReturnValue(of(mockUser));

    component.email.set('test@example.com');
    component.password.set('password123');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();

    expect(component.loading()).toBe(true);
  });

  it('should enable submit button when form is valid', async () => {
    component.email.set('test@example.com');
    component.password.set('password123');
    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('.btn') as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });

  it('should render divider and Google button', () => {
    const divider = fixture.nativeElement.querySelector('.auth-divider');
    const googleBtn = fixture.nativeElement.querySelector('.google-btn');

    expect(divider).toBeTruthy();
    expect(divider.textContent.trim()).toBe('o');
    expect(googleBtn).toBeTruthy();
    expect(googleBtn.textContent.trim()).toBe('Continuar con Google');
  });

  it('should redirect to google oauth on Google button click', () => {
    const originalLocation = window.location;
    const mockAssign = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, href: '' },
      writable: true,
      configurable: true,
    });

    component.onGoogleLogin();

    expect(window.location.href).toBe('http://localhost:3000/auth/google');

    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
    mockAssign; // referenced to avoid lint warning
  });
});
