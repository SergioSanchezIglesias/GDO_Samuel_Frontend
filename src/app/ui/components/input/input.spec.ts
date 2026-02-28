import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { InputComponent } from './input';

@Component({
  imports: [InputComponent],
  template: `
    <app-input
      [label]="label()"
      [placeholder]="placeholder()"
      [type]="type()"
      [errorMessage]="errorMessage()"
      [(value)]="value"
    />
  `,
})
class TestHostComponent {
  label = signal('Test Label');
  placeholder = signal('Enter value');
  type = signal<'text' | 'email' | 'password'>('text');
  errorMessage = signal('');
  value = signal('');
}

describe('InputComponent', () => {
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
    const label = fixture.nativeElement.querySelector('.input-label');
    expect(label.textContent.trim()).toBe('Test Label');
  });

  it('should render placeholder', () => {
    const input = fixture.nativeElement.querySelector('.input-field') as HTMLInputElement;
    expect(input.placeholder).toBe('Enter value');
  });

  it('should set input type attribute', async () => {
    host.type.set('password');
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('.input-field') as HTMLInputElement;
    expect(input.type).toBe('password');
  });

  it('should show error message when errorMessage is provided', async () => {
    host.errorMessage.set('This field is required');
    fixture.detectChanges();
    await fixture.whenStable();

    const errorSpan = fixture.nativeElement.querySelector('.input-error');
    expect(errorSpan).toBeTruthy();
    expect(errorSpan.textContent.trim()).toBe('This field is required');
  });

  it('should NOT show error message when errorMessage is empty', () => {
    const errorSpan = fixture.nativeElement.querySelector('.input-error');
    expect(errorSpan).toBeFalsy();
  });

  it('should add error class when errorMessage is provided', async () => {
    host.errorMessage.set('Error!');
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('.input-field') as HTMLElement;
    expect(input.classList.contains('input-field--error')).toBe(true);
  });

  it('should two-way bind value via model()', async () => {
    const input = fixture.nativeElement.querySelector('.input-field') as HTMLInputElement;

    input.value = 'hello';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(host.value()).toBe('hello');
  });
});
