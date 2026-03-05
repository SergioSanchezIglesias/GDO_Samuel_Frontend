import { TestBed } from '@angular/core/testing';

import { CrearRetiroComponent } from './crear-retiro';

describe('CrearRetiroComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [CrearRetiroComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(CrearRetiroComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
