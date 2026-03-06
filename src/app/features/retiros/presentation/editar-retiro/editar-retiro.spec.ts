import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GetRetiroUseCase } from '../../application/get-retiro.usecase';
import { UpdateRetiroUseCase } from '../../application/update-retiro.usecase';
import type { Retiro } from '../../domain/models/retiro.model';
import { EditarRetiroComponent } from './editar-retiro';

describe('EditarRetiroComponent', () => {
  let fixture: ComponentFixture<EditarRetiroComponent>;
  let component: EditarRetiroComponent;
  let router: Router;

  const mockRetiro: Retiro = {
    id: 1,
    fechaInicio: '2026-02-15',
    fechaFin: '2026-02-20',
    ubicacion: 'Ávila',
    codigo: 'ABC123',
  };

  const mockGetRetiroUseCase = { execute: vi.fn() };
  const mockUpdateRetiroUseCase = { execute: vi.fn() };
  const mockActivatedRoute = {
    snapshot: { paramMap: { get: vi.fn().mockReturnValue('1') } },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockGetRetiroUseCase.execute.mockReturnValue(of(mockRetiro));
    mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('1');

    await TestBed.configureTestingModule({
      imports: [EditarRetiroComponent],
      providers: [
        provideRouter([{ path: 'retiros/:id/editar', component: EditarRetiroComponent }]),
        { provide: GetRetiroUseCase, useValue: mockGetRetiroUseCase },
        { provide: UpdateRetiroUseCase, useValue: mockUpdateRetiroUseCase },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarRetiroComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads retiro data on init', () => {
    expect(mockGetRetiroUseCase.execute).toHaveBeenCalledWith(1);
    expect(component.ubicacion()).toBe('Ávila');
  });

  it('submit button disabled when form is invalid', () => {
    component.fechaInicio.set('');
    component.fechaFin.set('');
    component.ubicacion.set('');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.btn') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('calls UpdateRetiroUseCase on valid submit', async () => {
    mockUpdateRetiroUseCase.execute.mockReturnValue(of(mockRetiro));

    component.fechaInicio.set('2026-02-15');
    component.fechaFin.set('2026-02-20');
    component.ubicacion.set('Madrid');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();

    expect(mockUpdateRetiroUseCase.execute).toHaveBeenCalledWith(1, {
      fechaInicio: '2026-02-15',
      fechaFin: '2026-02-20',
      ubicacion: 'Madrid',
    });
  });

  it('navigates to /retiros/:id on success', async () => {
    mockUpdateRetiroUseCase.execute.mockReturnValue(of(mockRetiro));

    component.fechaInicio.set('2026-02-15');
    component.fechaFin.set('2026-02-20');
    component.ubicacion.set('Madrid');
    fixture.detectChanges();
    await fixture.whenStable();

    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/retiros', 1]);
  });
});
