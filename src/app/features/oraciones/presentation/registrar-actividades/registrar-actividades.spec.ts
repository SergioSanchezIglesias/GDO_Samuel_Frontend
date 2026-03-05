import { TestBed } from '@angular/core/testing';

import { RegistrarActividadesComponent } from './registrar-actividades';

describe('RegistrarActividadesComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarActividadesComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(RegistrarActividadesComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
