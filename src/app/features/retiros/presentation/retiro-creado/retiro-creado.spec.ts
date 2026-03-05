import { TestBed } from '@angular/core/testing';

import { RetiroCreadoComponent } from './retiro-creado';

describe('RetiroCreadoComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [RetiroCreadoComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(RetiroCreadoComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
