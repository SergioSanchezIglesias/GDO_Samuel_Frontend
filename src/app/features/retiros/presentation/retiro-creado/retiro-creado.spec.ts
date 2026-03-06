import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GetRetiroUseCase } from '../../application/get-retiro.usecase';
import type { Retiro } from '../../domain/models/retiro.model';
import { RetiroCreadoComponent } from './retiro-creado';

describe('RetiroCreadoComponent', () => {
  let fixture: ComponentFixture<RetiroCreadoComponent>;
  let component: RetiroCreadoComponent;
  let router: Router;

  const mockRetiro: Retiro = {
    id: 42,
    fechaInicio: '2026-02-15',
    fechaFin: '2026-02-20',
    ubicacion: 'Ávila',
    codigo: 'ABC123',
  };

  const mockGetRetiroUseCase = { execute: vi.fn() };
  const mockActivatedRoute = {
    snapshot: { paramMap: { get: vi.fn().mockReturnValue('42') } },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockGetRetiroUseCase.execute.mockReturnValue(of(mockRetiro));
    mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('42');

    await TestBed.configureTestingModule({
      imports: [RetiroCreadoComponent],
      providers: [
        provideRouter([{ path: 'retiros/creado/:id', component: RetiroCreadoComponent }]),
        { provide: GetRetiroUseCase, useValue: mockGetRetiroUseCase },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RetiroCreadoComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the retiro on init', () => {
    expect(mockGetRetiroUseCase.execute).toHaveBeenCalledWith(42);
    expect(component.retiro()).toEqual(mockRetiro);
  });

  it('navigates to /retiros when goToList is called', () => {
    component.goToList();
    expect(router.navigate).toHaveBeenCalledWith(['/retiros']);
  });

  it('formats the codigo correctly (splits in half with space)', () => {
    expect(component.formatCode('ABC123')).toBe('ABC 123');
  });
});
