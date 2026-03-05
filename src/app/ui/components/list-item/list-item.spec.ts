import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ListItemComponent } from './list-item';

@Component({
  imports: [ListItemComponent],
  template: `
    <app-list-item
      [title]="title()"
      [subtitle]="subtitle()"
      (itemClick)="onItemClick()"
    />
  `,
})
class TestHostComponent {
  title = signal('Retiro Ávila 2026');
  subtitle = signal('15 feb — 20 feb · Ávila');
  onItemClick = vi.fn();
}

describe('ListItemComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders the title input', () => {
    const titleEl = fixture.nativeElement.querySelector('.list-item__title') as HTMLElement;
    expect(titleEl.textContent?.trim()).toBe('Retiro Ávila 2026');
  });

  it('renders the subtitle input', () => {
    const subtitleEl = fixture.nativeElement.querySelector('.list-item__subtitle') as HTMLElement;
    expect(subtitleEl.textContent?.trim()).toBe('15 feb — 20 feb · Ávila');
  });

  it('emits itemClick when the item is clicked', () => {
    const item = fixture.nativeElement.querySelector('.list-item') as HTMLElement;
    item.click();

    expect(host.onItemClick).toHaveBeenCalledOnce();
  });

  it('updates title when input changes', async () => {
    host.title.set('Retiro Madrid 2027');
    fixture.detectChanges();
    await fixture.whenStable();

    const titleEl = fixture.nativeElement.querySelector('.list-item__title') as HTMLElement;
    expect(titleEl.textContent?.trim()).toBe('Retiro Madrid 2027');
  });
});
