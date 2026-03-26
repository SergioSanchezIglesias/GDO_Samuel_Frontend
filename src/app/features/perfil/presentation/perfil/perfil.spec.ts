import { signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LogoutUseCase } from '../../../auth/application/logout.use-case';
import { GetProfileUseCase } from '../../application/get-profile.use-case';
import type { Profile } from '../../domain/models/profile.model';
import { PerfilComponent } from './perfil';

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

describe('PerfilComponent', () => {
  let fixture: ComponentFixture<PerfilComponent>;
  let component: PerfilComponent;
  let router: Router;

  const mockGetProfileUseCase = { execute: vi.fn() };
  const mockLogoutUseCase = { execute: vi.fn() };

  async function buildTestBed(profile: Profile = mockLocalProfile) {
    mockGetProfileUseCase.execute.mockReturnValue(of(profile));

    await TestBed.configureTestingModule({
      imports: [PerfilComponent],
      providers: [
        provideRouter([]),
        { provide: GetProfileUseCase, useValue: mockGetProfileUseCase },
        { provide: LogoutUseCase, useValue: mockLogoutUseCase },
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

      fixture = TestBed.createComponent(PerfilComponent);
      component = fixture.componentInstance;
      router = TestBed.inject(Router);
      vi.spyOn(router, 'navigate').mockResolvedValue(true);

      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('calls GetProfileUseCase.execute on init', () => {
      expect(mockGetProfileUseCase.execute).toHaveBeenCalled();
    });

    it('renders the user name', () => {
      const nameEl = fixture.nativeElement.querySelector(
        '.avatar-info__name',
      ) as HTMLElement | null;
      expect(nameEl?.textContent?.trim()).toBe('Local User');
    });

    it('renders the user email', () => {
      const emailEl = fixture.nativeElement.querySelector(
        '.avatar-info__email',
      ) as HTMLElement | null;
      expect(emailEl?.textContent?.trim()).toBe('local@example.com');
    });

    it('does NOT show the "Cuenta de Google" badge for local provider', () => {
      const badge = fixture.nativeElement.querySelector('.provider-badge');
      expect(badge).toBeNull();
    });

    it('calls LogoutUseCase.execute when logout button is clicked', async () => {
      const logoutBtn = fixture.nativeElement.querySelector(
        '.logout-btn',
      ) as HTMLButtonElement | null;
      logoutBtn?.click();

      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockLogoutUseCase.execute).toHaveBeenCalled();
    });

    it('navigates to /perfil/editar when "Editar perfil" is clicked', async () => {
      component.onEdit();

      expect(router.navigate).toHaveBeenCalledWith(['/perfil/editar']);
    });

    it('sets isLoading to false after profile loads', () => {
      expect(component.isLoading()).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Suite: google provider
  // ---------------------------------------------------------------------------

  describe('with google provider', () => {
    beforeEach(async () => {
      vi.clearAllMocks();
      await buildTestBed(mockGoogleProfile);

      fixture = TestBed.createComponent(PerfilComponent);
      component = fixture.componentInstance;

      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('shows "Cuenta de Google" badge for google provider', () => {
      const badge = fixture.nativeElement.querySelector('.provider-badge') as HTMLElement | null;
      expect(badge).toBeTruthy();
      expect(badge?.textContent?.trim()).toContain('Cuenta de Google');
    });

    it('does NOT show "Cambiar contraseña" list item for google provider', () => {
      const listItems = fixture.nativeElement.querySelectorAll('app-list-item');
      const titles = Array.from(listItems).map(
        (el: unknown) =>
          (el as HTMLElement).getAttribute('ng-reflect-title') ??
          (el as HTMLElement).textContent ??
          '',
      );
      // There must be no password change item
      const hasPasswordItem = titles.some((t) => t.includes('contraseña'));
      expect(hasPasswordItem).toBe(false);
    });
  });
});
