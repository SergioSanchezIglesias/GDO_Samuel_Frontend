import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  Activity,
  BookOpen,
  Church,
  Heart,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
} from 'lucide-angular';

import { ACTIVITY_SECTIONS } from '../../../domain/constants/activity-sections.constant';
import type { Oracion, SumatorioOraciones } from '../../../domain/models/oracion.model';

@Component({
  selector: 'app-activity-grid',
  imports: [LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ BookOpen, Heart, Church, Activity }),
    },
  ],
  templateUrl: './activity-grid.html',
  styleUrl: './activity-grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityGridComponent {
  readonly data = input.required<Oracion | SumatorioOraciones>();

  readonly sections = computed(() => {
    const d = this.data() as unknown as Record<string, number>;
    return ACTIVITY_SECTIONS.map((section) => ({
      title: section.title,
      icon: section.icon,
      fields: section.fields.map((field) => ({
        key: field.key,
        label: field.label,
        value: d[field.key] ?? 0,
      })),
    }));
  });
}
