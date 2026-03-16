import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import {
  Activity,
  BookOpen,
  Church,
  Heart,
  LucideAngularModule,
  LucideIconProvider,
  LUCIDE_ICONS,
} from 'lucide-angular';

import { ButtonComponent } from '../../../../ui/components/button/button';
import { ScreenHeaderComponent } from '../../../../ui/components/screen-header/screen-header';
import { SectionHeaderComponent } from '../../../../ui/components/section-header/section-header.component';
import { StepperComponent } from '../../../../ui/components/stepper/stepper.component';
import { CreateOracionUseCase } from '../../application/create-oracion.use-case';
import { ACTIVITY_SECTIONS } from '../../domain/constants/activity-sections.constant';
import type { CreateOracionDTO } from '../../domain/models/oracion.model';

type FieldValues = Record<keyof CreateOracionDTO, number>;

function buildInitialValues(): FieldValues {
  const values: Partial<FieldValues> = {};
  for (const section of ACTIVITY_SECTIONS) {
    for (const field of section.fields) {
      values[field.key] = 0;
    }
  }
  return values as FieldValues;
}

@Component({
  selector: 'app-registrar-actividades',
  imports: [ScreenHeaderComponent, SectionHeaderComponent, StepperComponent, ButtonComponent, LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ BookOpen, Heart, Church, Activity }),
    },
  ],
  templateUrl: './registrar-actividades.html',
  styleUrl: './registrar-actividades.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrarActividadesComponent {
  private readonly createOracionUseCase = inject(CreateOracionUseCase);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal(false);
  readonly fieldValues = signal<FieldValues>(buildInitialValues());

  protected readonly sections = ACTIVITY_SECTIONS;

  getFieldValue(key: keyof CreateOracionDTO): number {
    return this.fieldValues()[key];
  }

  setFieldValue(key: keyof CreateOracionDTO, value: number): void {
    this.fieldValues.update(current => ({ ...current, [key]: value }));
  }

  onSubmit(): void {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.error.set(null);

    const dto: CreateOracionDTO = { ...this.fieldValues() };

    this.createOracionUseCase
      .execute(dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.success.set(true);
          this.router.navigate(['/oraciones']);
        },
        error: () => {
          this.isLoading.set(false);
          this.error.set('Error al registrar las actividades. Inténtalo de nuevo.');
        },
      });
  }
}
