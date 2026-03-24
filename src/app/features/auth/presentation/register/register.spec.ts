import { signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { User } from '../../domain/models/auth.model';
import type { UserRole } from '../../domain/models/auth.model';
import { API_URL } from '../../../../core/config/api.config';
import { RegisterUseCase } from '../../application/register.usecase';
import { TokenStoragePort } from '../../domain/ports/token-storage.port';
import { RegisterComponent } from './register';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;
  let router: Router;

  const mockRegisterUseCase = {
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
    id: 2,
    name: 'New User',
    email: 'new@example.com',
    provider: 'local',
    rol: 'usuario',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockTokenStorage.idRetiro.set(null);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([{ path: 'dashboard', component: RegisterComponent }]),
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: TokenStoragePort, useValue: mockTokenStorage },
        { provide: API_URL, useValue: 'http://localhost:3000' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should render nombre, email, and password inputs', () => {
    const labels = fixture.nativeElement.querySelectorAll('.input-label');
    const labelTexts = Array.from(labels).map((l: unknown) => (l as HTMLElement).textContent?.trim());

    expect(labelTexts).toContain('Nombre');
    expect(labelTexts).toContain('Email');
    expect(labelTexts).toContain('Contraseña');
  });

  it('should have submit button disabled when form is invalid', () => {
    const button = fixture.nativeElement.querySelector('.btn') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should call RegisterUseCase.execute() on valid submit', async () => {
    mockRegisterUseCase.execute.mockReturnValue(of(mockUser));

    component.nombre.set('New User');
    component.email.set('new@example.com');
    component.password.set('password123');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();

    expect(mockRegisterUseCase.execute).toHaveBeenCalledWith({
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
    });
  });

  it('should navigate to /auth/vincular-retiro when idRetiro is null after register', async () => {
    mockTokenStorage.idRetiro.set(null);
    mockRegisterUseCase.execute.mockReturnValue(of(mockUser));

    component.nombre.set('New User');
    component.email.set('new@example.com');
    component.password.set('password123');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/auth/vincular-retiro']);
  });

  it('should navigate to /dashboard when idRetiro has a value after register', async () => {
    mockTokenStorage.idRetiro.set(5);
    mockRegisterUseCase.execute.mockReturnValue(of(mockUser));

    component.nombre.set('New User');
    component.email.set('new@example.com');
    component.password.set('password123');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show "Este email ya está registrado" on 409 error', async () => {
    mockRegisterUseCase.execute.mockReturnValue(throwError(() => ({ status: 409 })));

    component.nombre.set('New User');
    component.email.set('new@example.com');
    component.password.set('password123');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();
    fixture.detectChanges();
    await fixture.whenStable();

    const errorDiv = fixture.nativeElement.querySelector('.auth-error');
    expect(errorDiv).toBeTruthy();
    expect(errorDiv.textContent.trim()).toBe('Este email ya está registrado');
  });

  it('should show generic error on server error', async () => {
    mockRegisterUseCase.execute.mockReturnValue(throwError(() => ({ status: 500 })));

    component.nombre.set('New User');
    component.email.set('new@example.com');
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

  it('should enable submit button when form is valid', async () => {
    component.nombre.set('New User');
    component.email.set('new@example.com');
    component.password.set('password123');
    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('.btn') as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });

  it('should show loading state during submit', async () => {
    mockRegisterUseCase.execute.mockReturnValue(of(mockUser));

    component.nombre.set('New User');
    component.email.set('new@example.com');
    component.password.set('password123');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();

    expect(component.loading()).toBe(true);
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
  });
});
