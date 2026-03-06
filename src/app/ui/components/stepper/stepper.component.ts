import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { Minus, Plus, LucideAngularModule, LucideIconProvider, LUCIDE_ICONS } from 'lucide-angular';

@Component({
  selector: 'app-stepper',
  imports: [LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ Minus, Plus }),
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stepper">
      <button
        class="stepper__btn"
        type="button"
        (click)="decrement()"
        [disabled]="value() <= min()"
        aria-label="Decrementar"
      >
        <lucide-icon name="minus" [size]="16" />
      </button>

      <span class="stepper__value">{{ value() }}</span>

      <button
        class="stepper__btn"
        type="button"
        (click)="increment()"
        aria-label="Incrementar"
      >
        <lucide-icon name="plus" [size]="16" />
      </button>
    </div>
  `,
  styles: [`
    .stepper {
      display: flex;
      flex-direction: row;
      align-items: center;
      width: 130px;
      height: 44px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .stepper__btn {
      flex: 0 0 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      cursor: pointer;
      color: var(--text-primary);
      transition: background 0.15s ease;

      &:hover:not(:disabled) {
        background: var(--bg-page);
      }

      &:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
    }

    .stepper__value {
      flex: 1;
      text-align: center;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      font-family: 'Outfit', sans-serif;
    }
  `],
})
export class StepperComponent {
  readonly value = model<number>(0);
  readonly min = input<number>(0);

  increment(): void {
    this.value.update(v => v + 1);
  }

  decrement(): void {
    this.value.update(v => Math.max(v - 1, this.min()));
  }
}
