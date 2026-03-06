import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfirmDialogComponent } from './confirm-dialog';

@Component({
  imports: [ConfirmDialogComponent],
  template: `
    <app-confirm-dialog
      [title]="title()"
      [message]="message()"
      (confirmed)="onConfirmed()"
      (cancelled)="onCancelled()"
    />
  `,
})
class TestHostComponent {
  title = signal('Eliminar retiro');
  message = signal('Esta acción no se puede deshacer.');
  onConfirmed = vi.fn();
  onCancelled = vi.fn();
}

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders the title', () => {
    const titleEl = fixture.nativeElement.querySelector('.confirm-dialog__title') as HTMLElement;
    expect(titleEl.textContent?.trim()).toBe('Eliminar retiro');
  });

  it('renders the message', () => {
    const msgEl = fixture.nativeElement.querySelector('.confirm-dialog__message') as HTMLElement;
    expect(msgEl.textContent?.trim()).toBe('Esta acción no se puede deshacer.');
  });

  it('emits confirmed when the confirm button is clicked', () => {
    // The confirm button is the "danger" variant — second button in the actions
    const buttons = fixture.nativeElement.querySelectorAll('.btn') as NodeListOf<HTMLButtonElement>;
    const confirmBtn = buttons[1];
    confirmBtn.click();

    expect(host.onConfirmed).toHaveBeenCalledOnce();
    expect(host.onCancelled).not.toHaveBeenCalled();
  });

  it('emits cancelled when the cancel button is clicked', () => {
    // The cancel button is the "secondary" variant — first button in the actions
    const buttons = fixture.nativeElement.querySelectorAll('.btn') as NodeListOf<HTMLButtonElement>;
    const cancelBtn = buttons[0];
    cancelBtn.click();

    expect(host.onCancelled).toHaveBeenCalledOnce();
    expect(host.onConfirmed).not.toHaveBeenCalled();
  });

  it('emits cancelled when the overlay backdrop is clicked', () => {
    const overlay = fixture.nativeElement.querySelector('.confirm-dialog-overlay') as HTMLElement;
    overlay.click();

    expect(host.onCancelled).toHaveBeenCalledOnce();
    expect(host.onConfirmed).not.toHaveBeenCalled();
  });
});
