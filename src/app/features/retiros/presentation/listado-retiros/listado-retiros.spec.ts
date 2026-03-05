import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PaginatedResponse } from '../../../../shared/models/paginated-response.model';
import { ListRetirosUseCase } from '../../application/list-retiros.usecase';
import type { Retiro } from '../../domain/models/retiro.model';
import { ListadoRetirosComponent } from './listado-retiros';

describe('ListadoRetirosComponent', () => {
  let fixture: ComponentFixture<ListadoRetirosComponent>;
  let component: ListadoRetirosComponent;
  let router: Router;

  const mockRetiros: Retiro[] = [
    {
      id: 1,
      fechaInicio: '2026-02-15',
      fechaFin: '2026-02-20',
      ubicacion: 'Ávila',
      codigo: 'ABC123',
    },
    {
      id: 2,
      fechaInicio: '2026-06-01',
      fechaFin: '2026-06-07',
      ubicacion: 'Madrid',
      codigo: 'DEF456',
    },
  ];

  const mockResponse: PaginatedResponse<Retiro> = {
    data: mockRetiros,
    page: 1,
    limit: 20,
    total: 2,
  };

  const mockListRetirosUseCase = {
    execute: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockListRetirosUseCase.execute.mockReturnValue(of(mockResponse));

    await TestBed.configureTestingModule({
      imports: [ListadoRetirosComponent],
      providers: [
        provideRouter([{ path: 'retiros', component: ListadoRetirosComponent }]),
        { provide: ListRetirosUseCase, useValue: mockListRetirosUseCase },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListadoRetirosComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders list items when retiros are loaded', () => {
    const items = fixture.nativeElement.querySelectorAll('app-list-item');
    expect(items.length).toBe(2);
  });

  it('shows the correct title for each list item', () => {
    const titles = fixture.nativeElement.querySelectorAll('.list-item__title') as NodeListOf<HTMLElement>;
    expect(titles[0].textContent?.trim()).toBe('Retiro Ávila 2026');
    expect(titles[1].textContent?.trim()).toBe('Retiro Madrid 2026');
  });

  it('shows empty state when no retiros are loaded', async () => {
    mockListRetirosUseCase.execute.mockReturnValue(
      of({ data: [], page: 1, limit: 20, total: 0 }),
    );

    component.ubicacionFilter.set('nowhere');
    fixture.detectChanges();
    await fixture.whenStable();

    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
    expect(emptyState.textContent).toContain('No hay retiros registrados');
  });

  it('navigates to /retiros/nuevo when add button is clicked', () => {
    const addBtn = fixture.nativeElement.querySelector('.add-btn') as HTMLButtonElement;
    addBtn.click();

    expect(router.navigate).toHaveBeenCalledWith(['/retiros/nuevo']);
  });

  it('navigates to /retiros/:id when a list item is clicked', () => {
    const item = fixture.nativeElement.querySelector('.list-item') as HTMLElement;
    item.click();

    expect(router.navigate).toHaveBeenCalledWith(['/retiros', 1]);
  });
});
