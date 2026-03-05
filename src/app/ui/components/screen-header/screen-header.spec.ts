import { Location } from '@angular/common';
import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ScreenHeaderComponent } from './screen-header';

@Component({
  imports: [ScreenHeaderComponent],
  template: `<app-screen-header [title]="title()" />`,
})
class TestHostComponent {
  title = signal('Test Title');
}

describe('ScreenHeaderComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let mockLocation: { back: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockLocation = { back: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: Location, useValue: mockLocation }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders the title from the input', () => {
    const titleEl = fixture.nativeElement.querySelector('.screen-header__title') as HTMLElement;
    expect(titleEl.textContent?.trim()).toBe('Test Title');
  });

  it('updates the title when input changes', async () => {
    host.title.set('Nuevo título');
    fixture.detectChanges();
    await fixture.whenStable();

    const titleEl = fixture.nativeElement.querySelector('.screen-header__title') as HTMLElement;
    expect(titleEl.textContent?.trim()).toBe('Nuevo título');
  });

  it('calls Location.back() when back button is clicked', () => {
    const backBtn = fixture.nativeElement.querySelector('.screen-header__back') as HTMLButtonElement;
    backBtn.click();

    expect(mockLocation.back).toHaveBeenCalledOnce();
  });
});
