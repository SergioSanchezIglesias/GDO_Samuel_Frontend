import { signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { TokenStoragePort } from '../../../features/auth/domain/ports/token-storage.port';
import type { UserRole } from '../../../features/auth/domain/models/auth.model';
import { BottomNavComponent } from './bottom-nav';

class MockTokenStoragePort extends TokenStoragePort {
  readonly accessToken = signal<string | null>(null);
  readonly isAuthenticated = signal(false);
  readonly userRole = signal<UserRole | null>(null);
  saveTokens = () => {};
  getRefreshToken = () => null;
  clearTokens = () => {};
}

describe('BottomNavComponent', () => {
  let fixture: ComponentFixture<BottomNavComponent>;
  let component: BottomNavComponent;
  let mockTokenStorage: MockTokenStoragePort;

  beforeEach(async () => {
    mockTokenStorage = new MockTokenStoragePort();

    await TestBed.configureTestingModule({
      imports: [BottomNavComponent],
      providers: [
        provideRouter([]),
        { provide: TokenStoragePort, useValue: mockTokenStorage },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render nav items without requiredRole when user has no role', () => {
    const links = fixture.nativeElement.querySelectorAll('a');
    // Dashboard, Actividades, Perfil visible — Retiros requires organizador
    expect(links.length).toBe(3);
  });

  it('should render all nav items when user is organizador', async () => {
    mockTokenStorage.userRole.set('organizador');
    fixture.detectChanges();
    await fixture.whenStable();

    const links = fixture.nativeElement.querySelectorAll('a');
    expect(links.length).toBe(4);
  });

  it('should NOT render retiros nav item when user is usuario', async () => {
    mockTokenStorage.userRole.set('usuario');
    fixture.detectChanges();
    await fixture.whenStable();

    const links = fixture.nativeElement.querySelectorAll('a');
    expect(links.length).toBe(3);

    const hrefs = Array.from(links).map((a) => (a as HTMLAnchorElement).getAttribute('href'));
    expect(hrefs).not.toContain('/retiros');
  });

  it('should render icons for each nav item', () => {
    const icons = fixture.nativeElement.querySelectorAll('lucide-icon');
    expect(icons.length).toBeGreaterThan(0);
  });
});
