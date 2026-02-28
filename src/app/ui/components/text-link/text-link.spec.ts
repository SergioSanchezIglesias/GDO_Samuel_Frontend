import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { TextLinkComponent } from './text-link';

@Component({
  imports: [TextLinkComponent],
  template: `
    <app-text-link
      [prefixText]="prefix"
      [actionText]="action"
      [route]="route"
    />
  `,
})
class TestHostComponent {
  prefix = 'Need an account?';
  action = 'Sign up';
  route = '/auth/register';
}

describe('TextLinkComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should render prefix text', () => {
    const prefix = fixture.nativeElement.querySelector('.text-link__prefix');
    expect(prefix.textContent.trim()).toBe('Need an account?');
  });

  it('should render action text', () => {
    const action = fixture.nativeElement.querySelector('.text-link__action');
    expect(action.textContent.trim()).toBe('Sign up');
  });

  it('should set routerLink on action link', () => {
    const link = fixture.nativeElement.querySelector('.text-link__action') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/auth/register');
  });
});
