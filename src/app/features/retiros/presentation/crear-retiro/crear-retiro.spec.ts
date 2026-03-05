import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateRetiroUseCase } from '../../application/create-retiro.usecase';
import type { Retiro } from '../../domain/models/retiro.model';
import { CrearRetiroComponent } from './crear-retiro';

describe('CrearRetiroComponent', () => {
  let fixture: ComponentFixture<CrearRetiroComponent>;
  let component: CrearRetiroComponent;
  let router: Router;

  const mockRetiro: Retiro = {
    id: 42,
    fechaInicio: '2026-02-15',
    fechaFin: '2026-02-20',
    ubicacion: 'Ávila',
    codigo: 'ABC123',
  };

  const mockCreateRetiroUseCase = {
    execute: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [CrearRetiroComponent],
      providers: [
        provideRouter([{ path: 'retiros/creado/:id', component: CrearRetiroComponent }]),
        { provide: CreateRetiroUseCase, useValue: mockCreateRetiroUseCase },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearRetiroComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('submit button is disabled when form is invalid (empty)', () => {
    const button = fixture.nativeElement.querySelector('.btn') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('submit button is disabled when fechaFin is before fechaInicio', async () => {
    component.fechaInicio.set('2026-02-20');
    component.fechaFin.set('2026-02-15');
    component.ubicacion.set('Ávila');
    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('.btn') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('submit button is enabled when all fields are filled and dates are valid', async () => {
    component.fechaInicio.set('2026-02-15');
    component.fechaFin.set('2026-02-20');
    component.ubicacion.set('Ávila');
    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('.btn') as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });

  it('calls CreateRetiroUseCase.execute() with correct DTO on submit', async () => {
    mockCreateRetiroUseCase.execute.mockReturnValue(of(mockRetiro));

    component.fechaInicio.set('2026-02-15');
    component.fechaFin.set('2026-02-20');
    component.ubicacion.set('Ávila');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();

    expect(mockCreateRetiroUseCase.execute).toHaveBeenCalledWith({
      fechaInicio: '2026-02-15',
      fechaFin: '2026-02-20',
      ubicacion: 'Ávila',
    });
  });

  it('navigates to /retiros/creado/:id on success', async () => {
    mockCreateRetiroUseCase.execute.mockReturnValue(of(mockRetiro));

    component.fechaInicio.set('2026-02-15');
    component.fechaFin.set('2026-02-20');
    component.ubicacion.set('Ávila');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/retiros/creado', 42]);
  });

  it('shows error message on failure', async () => {
    mockCreateRetiroUseCase.execute.mockReturnValue(throwError(() => new Error('Server error')));

    component.fechaInicio.set('2026-02-15');
    component.fechaFin.set('2026-02-20');
    component.ubicacion.set('Ávila');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();
    fixture.detectChanges();
    await fixture.whenStable();

    const errorEl = fixture.nativeElement.querySelector('.form-error') as HTMLElement;
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent?.trim()).toBe('Error al crear el retiro. Inténtalo de nuevo.');
  });

  it('does not call use case when form is invalid', () => {
    // form is empty by default
    component.onSubmit();

    expect(mockCreateRetiroUseCase.execute).not.toHaveBeenCalled();
  });
});
