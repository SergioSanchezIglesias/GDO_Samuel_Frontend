import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Location } from '@angular/common';
import { ArrowLeft, LucideAngularModule, LucideIconProvider, LUCIDE_ICONS } from 'lucide-angular';

@Component({
  selector: 'app-screen-header',
  imports: [LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ ArrowLeft }),
    },
  ],
  templateUrl: './screen-header.html',
  styleUrl: './screen-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScreenHeaderComponent {
  readonly title = input.required<string>();
  readonly fontSize = input<number>(18);

  private readonly location = inject(Location);

  goBack(): void {
    this.location.back();
  }
}
