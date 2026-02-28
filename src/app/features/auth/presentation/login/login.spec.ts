import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { User } from '../../domain/models/auth.model';
import { LoginUseCase } from '../../application/login.usecase';
import { LoginComponent } from './login';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let router: Router;

  const mockLoginUseCase = {
    execute: vi.fn(),
  };

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    provider: 'local',
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([{ path: 'dashboard', component: LoginComponent }]),
        { provide: LoginUseCase, useValue: mockLoginUseCase },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should render email, password, and codigo de retiro inputs', () => {
    const labels = fixture.nativeElement.querySelectorAll('.input-label');
    const labelTexts = Array.from(labels).map((l: unknown) => (l as HTMLElement).textContent?.trim());

    expect(labelTexts).toContain('Email');
    expect(labelTexts).toContain('Contraseña');
    expect(labelTexts).toContain('Código de retiro');
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

  it('should show codigo error when not 6 digits', async () => {
    component.codigoRetiro.set('123');
    fixture.detectChanges();
    await fixture.whenStable();

    const errors = fixture.nativeElement.querySelectorAll('.input-error');
    const errorTexts = Array.from(errors).map((e: unknown) => (e as HTMLElement).textContent?.trim());

    expect(errorTexts).toContain('Debe ser 6 dígitos');
  });

  it('should call LoginUseCase.execute() on valid submit', async () => {
    mockLoginUseCase.execute.mockReturnValue(of(mockUser));

    component.email.set('test@example.com');
    component.password.set('password123');
    component.codigoRetiro.set('123456');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();

    expect(mockLoginUseCase.execute).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      codigoRetiro: '123456',
    });
  });

  it('should show "Credenciales inválidas" on 401 error', async () => {
    mockLoginUseCase.execute.mockReturnValue(throwError(() => ({ status: 401 })));

    component.email.set('test@example.com');
    component.password.set('password123');
    component.codigoRetiro.set('123456');
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
    component.codigoRetiro.set('123456');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();
    fixture.detectChanges();
    await fixture.whenStable();

    const errorDiv = fixture.nativeElement.querySelector('.auth-error');
    expect(errorDiv).toBeTruthy();
    expect(errorDiv.textContent.trim()).toBe('Error del servidor. Inténtalo de nuevo.');
  });

  it('should navigate to /dashboard on success', async () => {
    mockLoginUseCase.execute.mockReturnValue(of(mockUser));

    component.email.set('test@example.com');
    component.password.set('password123');
    component.codigoRetiro.set('123456');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show loading state during submit', async () => {
    mockLoginUseCase.execute.mockReturnValue(of(mockUser));

    component.email.set('test@example.com');
    component.password.set('password123');
    component.codigoRetiro.set('123456');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();

    // loading is set to true at the start of onSubmit
    // but since observable completes synchronously, we check the button was disabled
    expect(component.loading()).toBe(true);
  });

  it('should enable submit button when form is valid', async () => {
    component.email.set('test@example.com');
    component.password.set('password123');
    component.codigoRetiro.set('123456');
    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('.btn') as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });
});
