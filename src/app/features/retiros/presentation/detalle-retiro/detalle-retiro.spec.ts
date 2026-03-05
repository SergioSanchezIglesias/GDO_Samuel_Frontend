import { TestBed } from '@angular/core/testing';

import { DetalleRetiroComponent } from './detalle-retiro';

describe('DetalleRetiroComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleRetiroComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(DetalleRetiroComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
