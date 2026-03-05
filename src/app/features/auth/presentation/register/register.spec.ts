import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { User } from '../../domain/models/auth.model';
import { RegisterUseCase } from '../../application/register.usecase';
import { RegisterComponent } from './register';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;
  let router: Router;

  const mockRegisterUseCase = {
    execute: vi.fn(),
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

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([{ path: 'dashboard', component: RegisterComponent }]),
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
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

  it('should navigate to /dashboard on success', async () => {
    mockRegisterUseCase.execute.mockReturnValue(of(mockUser));

    component.nombre.set('New User');
    component.email.set('new@example.com');
    component.password.set('password123');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
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
});
