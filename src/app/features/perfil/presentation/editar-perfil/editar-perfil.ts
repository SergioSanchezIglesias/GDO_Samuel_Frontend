import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { ButtonComponent } from '../../../../ui/components/button/button';
import { InputComponent } from '../../../../ui/components/input/input';
import { ScreenHeaderComponent } from '../../../../ui/components/screen-header/screen-header';
import { GetProfileUseCase } from '../../application/get-profile.use-case';
import { UpdateProfileUseCase } from '../../application/update-profile.use-case';
import type { Profile, UpdateProfileRequest } from '../../domain/models/profile.model';

@Component({
  selector: 'app-editar-perfil',
  imports: [ScreenHeaderComponent, InputComponent, ButtonComponent],
  templateUrl: './editar-perfil.html',
  styleUrl: './editar-perfil.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditarPerfilComponent implements OnInit {
  private readonly getProfileUseCase = inject(GetProfileUseCase);
  private readonly updateProfileUseCase = inject(UpdateProfileUseCase);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly profile = signal<Profile | null>(null);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);

  // Form fields
  readonly name = signal('');
  readonly email = signal('');
  readonly currentPassword = signal('');
  readonly newPassword = signal('');

  // Validation errors
  readonly nameError = signal('');
  readonly emailError = signal('');

  readonly isGoogleUser = computed(() => this.profile()?.provider === 'google');

  ngOnInit(): void {
    this.getProfileUseCase
      .execute()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile) => {
          this.profile.set(profile);
          this.name.set(profile.name);
          this.email.set(profile.email);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('Error al cargar el perfil.');
          this.isLoading.set(false);
        },
      });
  }

  onSubmit(): void {
    if (!this.validate()) return;

    const dto: UpdateProfileRequest = {
      name: this.name(),
      email: this.email(),
    };

    if (!this.isGoogleUser() && this.newPassword()) {
      dto.password = this.newPassword();
    }

    this.isSaving.set(true);
    this.error.set(null);

    this.updateProfileUseCase
      .execute(dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          void this.router.navigate(['/perfil']);
        },
        error: () => {
          this.error.set('Error al guardar los cambios. Inténtalo de nuevo.');
          this.isSaving.set(false);
        },
      });
  }

  private validate(): boolean {
    let valid = true;

    if (!this.name().trim()) {
      this.nameError.set('El nombre es obligatorio');
      valid = false;
    } else {
      this.nameError.set('');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email().trim()) {
      this.emailError.set('El email es obligatorio');
      valid = false;
    } else if (!emailRegex.test(this.email())) {
      this.emailError.set('El email no es válido');
      valid = false;
    } else {
      this.emailError.set('');
    }

    return valid;
  }
}
