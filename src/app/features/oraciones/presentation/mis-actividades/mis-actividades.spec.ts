import { TestBed } from '@angular/core/testing';

import { MisActividadesComponent } from './mis-actividades';

describe('MisActividadesComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [MisActividadesComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(MisActividadesComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
