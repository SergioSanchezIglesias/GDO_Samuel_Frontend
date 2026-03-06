import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ChevronRight, LucideAngularModule, LucideIconProvider, LUCIDE_ICONS } from 'lucide-angular';

@Component({
  selector: 'app-list-item',
  imports: [LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ ChevronRight }),
    },
  ],
  templateUrl: './list-item.html',
  styleUrl: './list-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListItemComponent {
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();

  readonly itemClick = output<void>();
}
