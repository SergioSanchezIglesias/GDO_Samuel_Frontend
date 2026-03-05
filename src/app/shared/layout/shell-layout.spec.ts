import { signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { TokenStoragePort } from '../../features/auth/domain/ports/token-storage.port';
import type { UserRole } from '../../features/auth/domain/models/auth.model';
import { ShellLayoutComponent } from './shell-layout';

class MockTokenStoragePort extends TokenStoragePort {
  readonly accessToken = signal<string | null>(null);
  readonly isAuthenticated = signal(false);
  readonly userRole = signal<UserRole | null>(null);
  saveTokens = () => {};
  getRefreshToken = () => null;
  clearTokens = () => {};
}

describe('ShellLayoutComponent', () => {
  let fixture: ComponentFixture<ShellLayoutComponent>;
  let component: ShellLayoutComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShellLayoutComponent],
      providers: [
        provideRouter([]),
        { provide: TokenStoragePort, useValue: new MockTokenStoragePort() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShellLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render top-nav element', () => {
    const topNav = fixture.nativeElement.querySelector('app-top-nav');
    expect(topNav).toBeTruthy();
  });

  it('should render bottom-nav element', () => {
    const bottomNav = fixture.nativeElement.querySelector('app-bottom-nav');
    expect(bottomNav).toBeTruthy();
  });

  it('should render router-outlet inside main', () => {
    const main = fixture.nativeElement.querySelector('main');
    expect(main).toBeTruthy();
    const outlet = main.querySelector('router-outlet');
    expect(outlet).toBeTruthy();
  });
});
