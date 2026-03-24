import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
  LogOut,
  LucideAngularModule,
  LucideIconProvider,
  LUCIDE_ICONS,
  User,
} from 'lucide-angular';

import { ButtonComponent } from '../../../../ui/components/button/button';
import { ListItemComponent } from '../../../../ui/components/list-item/list-item';
import { SectionHeaderComponent } from '../../../../ui/components/section-header/section-header.component';
import { LogoutUseCase } from '../../../auth/application/logout.use-case';
import { GetProfileUseCase } from '../../application/get-profile.use-case';
import type { Profile } from '../../domain/models/profile.model';

@Component({
  selector: 'app-perfil',
  imports: [LucideAngularModule, ButtonComponent, ListItemComponent, SectionHeaderComponent],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ LogOut, User }),
    },
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerfilComponent implements OnInit {
  private readonly getProfileUseCase = inject(GetProfileUseCase);
  private readonly logoutUseCase = inject(LogoutUseCase);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly profile = signal<Profile | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.getProfileUseCase
      .execute()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile) => {
          this.profile.set(profile);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('Error al cargar el perfil. Inténtalo de nuevo.');
          this.isLoading.set(false);
        },
      });
  }

  getInitials(): string {
    const name = this.profile()?.name ?? '';
    return name
      .split(' ')
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  onEdit(): void {
    void this.router.navigate(['/perfil/editar']);
  }

  onLogout(): void {
    this.logoutUseCase.execute();
  }
}
