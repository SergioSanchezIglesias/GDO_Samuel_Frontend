import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-section-header',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="section-header">
      <lucide-icon [name]="icon()" [size]="18" class="section-header__icon" />
      <span class="section-header__title">{{ title() }}</span>
    </div>
  `,
  styles: [`
    .section-header {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
    }

    .section-header__icon {
      color: var(--accent-brown);
      flex-shrink: 0;
    }

    .section-header__title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: 'Outfit', sans-serif;
    }
  `],
})
export class SectionHeaderComponent {
  readonly icon = input.required<string>();
  readonly title = input.required<string>();
}
