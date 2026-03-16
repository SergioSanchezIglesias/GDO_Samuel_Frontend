import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateOracionUseCase } from '../../application/create-oracion.use-case';
import { ACTIVITY_SECTIONS } from '../../domain/constants/activity-sections.constant';
import { RegistrarActividadesComponent } from './registrar-actividades';

const mockCreateOracionUseCase = {
  execute: vi.fn(),
};

describe('RegistrarActividadesComponent', () => {
  let fixture: ComponentFixture<RegistrarActividadesComponent>;
  let component: RegistrarActividadesComponent;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [RegistrarActividadesComponent],
      providers: [
        provideRouter([]),
        { provide: CreateOracionUseCase, useValue: mockCreateOracionUseCase },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarActividadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders all 4 sections from ACTIVITY_SECTIONS', () => {
    const sectionEls = fixture.nativeElement.querySelectorAll('.section') as NodeListOf<HTMLElement>;
    expect(sectionEls.length).toBe(ACTIVITY_SECTIONS.length);
    expect(sectionEls.length).toBe(4);
  });

  it('renders all 16 field rows across all sections', () => {
    const fieldRows = fixture.nativeElement.querySelectorAll('.field-row') as NodeListOf<HTMLElement>;
    const totalFields = ACTIVITY_SECTIONS.reduce((sum, s) => sum + s.fields.length, 0);
    expect(fieldRows.length).toBe(totalFields);
    expect(fieldRows.length).toBe(16);
  });

  it('isLoading starts as false', () => {
    expect(component.isLoading()).toBe(false);
  });

  it('calls CreateOracionUseCase.execute() on submit', () => {
    mockCreateOracionUseCase.execute.mockReturnValue(
      of({ id: 1, usuarioId: 1, retiroId: 1 }),
    );

    component.onSubmit();

    expect(mockCreateOracionUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it('sets isLoading to true while the observable is pending', () => {
    // Never-resolving observable keeps loading state active
    const neverResolving = { subscribe: () => ({ unsubscribe: () => {} }), pipe: function() { return this; } };
    mockCreateOracionUseCase.execute.mockReturnValue(neverResolving);

    component.onSubmit();

    expect(component.isLoading()).toBe(true);
  });

  it('sets error signal when use case fails', async () => {
    mockCreateOracionUseCase.execute.mockReturnValue(throwError(() => new Error('fail')));

    component.onSubmit();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.error()).toBeTruthy();
    expect(component.isLoading()).toBe(false);
  });

  it('does not call use case when already loading', () => {
    component.isLoading.set(true);

    component.onSubmit();

    expect(mockCreateOracionUseCase.execute).not.toHaveBeenCalled();
  });
});
