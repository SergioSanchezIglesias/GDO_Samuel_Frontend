import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { StepperComponent } from './stepper.component';

describe('StepperComponent', () => {
  let fixture: ComponentFixture<StepperComponent>;
  let component: StepperComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepperComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders the initial value (0 by default)', () => {
    const valueEl = fixture.nativeElement.querySelector('.stepper__value') as HTMLElement;
    expect(valueEl.textContent?.trim()).toBe('0');
  });

  it('increment increases the value by 1', async () => {
    component.increment();
    fixture.detectChanges();
    await fixture.whenStable();

    const valueEl = fixture.nativeElement.querySelector('.stepper__value') as HTMLElement;
    expect(valueEl.textContent?.trim()).toBe('1');
    expect(component.value()).toBe(1);
  });

  it('decrement decreases the value by 1 when above min', async () => {
    component.value.set(3);
    fixture.detectChanges();

    component.decrement();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.value()).toBe(2);
  });

  it('decrement does NOT go below min (default 0)', async () => {
    // value is already at 0 (default), decrement should not go below 0
    component.decrement();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.value()).toBe(0);
    const valueEl = fixture.nativeElement.querySelector('.stepper__value') as HTMLElement;
    expect(valueEl.textContent?.trim()).toBe('0');
  });

  it('decrement does NOT go below a custom min', async () => {
    fixture.componentRef.setInput('min', 5);
    component.value.set(5);
    fixture.detectChanges();

    component.decrement();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.value()).toBe(5);
  });

  it('decrement button is disabled when value equals min', () => {
    // value = 0, min = 0 by default
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    const decrementBtn = buttons[0];
    expect(decrementBtn.disabled).toBe(true);
  });
});
