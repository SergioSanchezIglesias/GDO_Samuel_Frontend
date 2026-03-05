import { TestBed } from '@angular/core/testing';

import { EditarRetiroComponent } from './editar-retiro';

describe('EditarRetiroComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [EditarRetiroComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(EditarRetiroComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
