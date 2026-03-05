import { TestBed } from '@angular/core/testing';

import { PerfilComponent } from './perfil';

describe('PerfilComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(PerfilComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
