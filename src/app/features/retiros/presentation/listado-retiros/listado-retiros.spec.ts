import { TestBed } from '@angular/core/testing';

import { ListadoRetirosComponent } from './listado-retiros';

describe('ListadoRetirosComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoRetirosComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ListadoRetirosComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
