import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DeleteRetiroUseCase } from '../../application/delete-retiro.usecase';
import { GetRetiroUseCase } from '../../application/get-retiro.usecase';
import type { Retiro } from '../../domain/models/retiro.model';
import { DetalleRetiroComponent } from './detalle-retiro';

describe('DetalleRetiroComponent', () => {
  let fixture: ComponentFixture<DetalleRetiroComponent>;
  let component: DetalleRetiroComponent;
  let router: Router;

  const mockRetiro: Retiro = {
    id: 1,
    fechaInicio: '2026-02-15',
    fechaFin: '2026-02-20',
    ubicacion: 'Ávila',
    codigo: 'ABC123',
  };

  const mockGetRetiroUseCase = {
    execute: vi.fn(),
  };

  const mockDeleteRetiroUseCase = {
    execute: vi.fn(),
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: vi.fn().mockReturnValue('1'),
      },
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockGetRetiroUseCase.execute.mockReturnValue(of(mockRetiro));
    mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('1');

    await TestBed.configureTestingModule({
      imports: [DetalleRetiroComponent],
      providers: [
        provideRouter([{ path: 'retiros/:id', component: DetalleRetiroComponent }]),
        { provide: GetRetiroUseCase, useValue: mockGetRetiroUseCase },
        { provide: DeleteRetiroUseCase, useValue: mockDeleteRetiroUseCase },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleRetiroComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('loads and displays the retiro detail on init', () => {
    expect(mockGetRetiroUseCase.execute).toHaveBeenCalledWith(1);
    const codeEl = fixture.nativeElement.querySelector('.code-value') as HTMLElement;
    expect(codeEl).toBeTruthy();
  });

  it('shows confirm dialog when delete button is clicked', async () => {
    // Initially dialog is hidden
    expect(component.showDeleteDialog()).toBe(false);

    // Click the delete button (danger variant button)
    const buttons = fixture.nativeElement.querySelectorAll('.btn') as NodeListOf<HTMLButtonElement>;
    const deleteBtn = Array.from(buttons).find((b) =>
      b.textContent?.includes('Eliminar'),
    ) as HTMLButtonElement;
    deleteBtn.click();

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.showDeleteDialog()).toBe(true);
    const dialog = fixture.nativeElement.querySelector('app-confirm-dialog');
    expect(dialog).toBeTruthy();
  });

  it('calls DeleteRetiroUseCase when onDeleteConfirmed is called', () => {
    mockDeleteRetiroUseCase.execute.mockReturnValue(of(undefined));

    component.retiro.set(mockRetiro);
    component.onDeleteConfirmed();

    expect(mockDeleteRetiroUseCase.execute).toHaveBeenCalledWith(1);
  });

  it('navigates to /retiros after successful delete', async () => {
    mockDeleteRetiroUseCase.execute.mockReturnValue(of(undefined));

    component.retiro.set(mockRetiro);
    component.onDeleteConfirmed();

    expect(router.navigate).toHaveBeenCalledWith(['/retiros']);
  });

  it('hides confirm dialog when onDeleteCancelled is called', async () => {
    component.showDeleteDialog.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    component.onDeleteCancelled();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.showDeleteDialog()).toBe(false);
    const dialog = fixture.nativeElement.querySelector('app-confirm-dialog');
    expect(dialog).toBeNull();
  });

  it('navigates to /retiros/:id/editar when edit button is clicked', () => {
    const editBtn = fixture.nativeElement.querySelector('.edit-btn') as HTMLButtonElement;
    editBtn.click();

    expect(router.navigate).toHaveBeenCalledWith(['/retiros', 1, 'editar']);
  });
});
