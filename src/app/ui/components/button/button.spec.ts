import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ButtonComponent } from './button';

@Component({
  imports: [ButtonComponent],
  template: `
    <app-button
      [label]="label()"
      [variant]="variant()"
      [disabled]="disabled()"
      [loading]="loading()"
      (clicked)="onClick()"
    />
  `,
})
class TestHostComponent {
  label = signal('Click me');
  variant = signal<'primary' | 'secondary'>('primary');
  disabled = signal(false);
  loading = signal(false);
  onClick = vi.fn();
}

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should render label text', () => {
    const button = fixture.nativeElement.querySelector('.btn') as HTMLButtonElement;
    expect(button.textContent.trim()).toBe('Click me');
  });

  it('should apply primary variant class by default', () => {
    const button = fixture.nativeElement.querySelector('.btn') as HTMLElement;
    expect(button.classList.contains('btn--primary')).toBe(true);
  });

  it('should apply secondary variant class', async () => {
    host.variant.set('secondary');
    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('.btn') as HTMLElement;
    expect(button.classList.contains('btn--secondary')).toBe(true);
    expect(button.classList.contains('btn--primary')).toBe(false);
  });

  it('should disable button when disabled=true', async () => {
    host.disabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('.btn') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should disable button when loading=true', async () => {
    host.loading.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('.btn') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should show spinner when loading', async () => {
    host.loading.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const spinner = fixture.nativeElement.querySelector('.btn__spinner');
    expect(spinner).toBeTruthy();

    const button = fixture.nativeElement.querySelector('.btn') as HTMLButtonElement;
    expect(button.textContent.trim()).not.toBe('Click me');
  });

  it('should emit clicked event on click', () => {
    const button = fixture.nativeElement.querySelector('.btn') as HTMLButtonElement;
    button.click();

    expect(host.onClick).toHaveBeenCalledOnce();
  });

  it('should NOT emit clicked event when disabled', async () => {
    host.disabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('.btn') as HTMLButtonElement;
    button.click();

    expect(host.onClick).not.toHaveBeenCalled();
  });

  it('should apply loading class when loading', async () => {
    host.loading.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('.btn') as HTMLElement;
    expect(button.classList.contains('btn--loading')).toBe(true);
  });
});
