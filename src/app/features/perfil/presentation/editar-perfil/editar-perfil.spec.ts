import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GetProfileUseCase } from '../../application/get-profile.use-case';
import { UpdateProfileUseCase } from '../../application/update-profile.use-case';
import type { Profile } from '../../domain/models/profile.model';
import { EditarPerfilComponent } from './editar-perfil';

const mockLocalProfile: Profile = {
  id: 1,
  name: 'Local User',
  email: 'local@example.com',
  provider: 'local',
  rol: 'usuario',
};

const mockGoogleProfile: Profile = {
  id: 2,
  name: 'Google User',
  email: 'google@example.com',
  provider: 'google',
  rol: 'usuario',
};

describe('EditarPerfilComponent', () => {
  let fixture: ComponentFixture<EditarPerfilComponent>;
  let component: EditarPerfilComponent;
  let router: Router;

  const mockGetProfileUseCase = { execute: vi.fn() };
  const mockUpdateProfileUseCase = { execute: vi.fn() };

  async function buildTestBed(profile: Profile = mockLocalProfile) {
    mockGetProfileUseCase.execute.mockReturnValue(of(profile));

    await TestBed.configureTestingModule({
      imports: [EditarPerfilComponent],
      providers: [
        provideRouter([]),
        { provide: GetProfileUseCase, useValue: mockGetProfileUseCase },
        { provide: UpdateProfileUseCase, useValue: mockUpdateProfileUseCase },
      ],
    }).compileComponents();
  }

  // ---------------------------------------------------------------------------
  // Suite: local provider
  // ---------------------------------------------------------------------------

  describe('with local provider', () => {
    beforeEach(async () => {
      vi.clearAllMocks();
      await buildTestBed(mockLocalProfile);

      fixture = TestBed.createComponent(EditarPerfilComponent);
      component = fixture.componentInstance;
      router = TestBed.inject(Router);
      vi.spyOn(router, 'navigate').mockResolvedValue(true);

      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('populates name and email signals from profile on init', () => {
      expect(component.name()).toBe('Local User');
      expect(component.email()).toBe('local@example.com');
    });

    it('sets isLoading to false after profile loads', () => {
      expect(component.isLoading()).toBe(false);
    });

    it('shows the password section for local provider', () => {
      const passwordSection = fixture.nativeElement.querySelector(
        '.section-label',
      ) as HTMLElement | null;
      expect(passwordSection).toBeTruthy();
      expect(passwordSection?.textContent).toContain('contraseña');
    });

    it('calls UpdateProfileUseCase.execute on valid submit', async () => {
      mockUpdateProfileUseCase.execute.mockReturnValue(of(mockLocalProfile));

      component.name.set('Updated Name');
      component.email.set('updated@example.com');
      fixture.detectChanges();
      await fixture.whenStable();

      component.onSubmit();

      expect(mockUpdateProfileUseCase.execute).toHaveBeenCalledWith({
        name: 'Updated Name',
        email: 'updated@example.com',
      });
    });

    it('navigates to /perfil after successful update', async () => {
      mockUpdateProfileUseCase.execute.mockReturnValue(of(mockLocalProfile));

      component.name.set('Updated Name');
      component.email.set('updated@example.com');
      fixture.detectChanges();
      await fixture.whenStable();

      component.onSubmit();

      expect(router.navigate).toHaveBeenCalledWith(['/perfil']);
    });

    it('shows nameError when name is empty on submit', () => {
      component.name.set('');
      component.email.set('valid@email.com');
      fixture.detectChanges();

      component.onSubmit();

      expect(component.nameError()).toBe('El nombre es obligatorio');
      expect(mockUpdateProfileUseCase.execute).not.toHaveBeenCalled();
    });

    it('shows emailError when email is empty on submit', () => {
      component.name.set('Valid Name');
      component.email.set('');
      fixture.detectChanges();

      component.onSubmit();

      expect(component.emailError()).toBe('El email es obligatorio');
      expect(mockUpdateProfileUseCase.execute).not.toHaveBeenCalled();
    });

    it('shows emailError when email format is invalid', () => {
      component.name.set('Valid Name');
      component.email.set('not-an-email');
      fixture.detectChanges();

      component.onSubmit();

      expect(component.emailError()).toBe('El email no es válido');
      expect(mockUpdateProfileUseCase.execute).not.toHaveBeenCalled();
    });

    it('includes password in dto when newPassword is set', () => {
      mockUpdateProfileUseCase.execute.mockReturnValue(of(mockLocalProfile));

      component.name.set('Name');
      component.email.set('email@example.com');
      component.newPassword.set('newSecurePass123');
      fixture.detectChanges();

      component.onSubmit();

      expect(mockUpdateProfileUseCase.execute).toHaveBeenCalledWith({
        name: 'Name',
        email: 'email@example.com',
        password: 'newSecurePass123',
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Suite: google provider
  // ---------------------------------------------------------------------------

  describe('with google provider', () => {
    beforeEach(async () => {
      vi.clearAllMocks();
      await buildTestBed(mockGoogleProfile);

      fixture = TestBed.createComponent(EditarPerfilComponent);
      component = fixture.componentInstance;

      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('hides the password section for google provider', () => {
      const passwordSection = fixture.nativeElement.querySelector('.section-label');
      expect(passwordSection).toBeNull();
    });

    it('does NOT include password in dto even if newPassword is set', () => {
      const mockUpdated = of(mockGoogleProfile);
      mockUpdateProfileUseCase.execute.mockReturnValue(mockUpdated);

      component.name.set('Google User');
      component.email.set('google@example.com');
      component.newPassword.set('shouldBeIgnored');
      fixture.detectChanges();

      component.onSubmit();

      const calledDto = mockUpdateProfileUseCase.execute.mock.calls[0][0] as Record<
        string,
        unknown
      >;
      expect(calledDto['password']).toBeUndefined();
    });
  });
});
