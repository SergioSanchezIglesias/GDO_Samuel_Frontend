import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { Heart, LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';
import { beforeEach, describe, expect, it } from 'vitest';

import { SectionHeaderComponent } from './section-header.component';

describe('SectionHeaderComponent', () => {
  let fixture: ComponentFixture<SectionHeaderComponent>;
  let component: SectionHeaderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionHeaderComponent],
      providers: [
        {
          provide: LUCIDE_ICONS,
          multi: true,
          useValue: new LucideIconProvider({ Heart }),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionHeaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('icon', 'heart');
    fixture.componentRef.setInput('title', 'Oración');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders the title input', () => {
    const titleEl = fixture.nativeElement.querySelector('.section-header__title') as HTMLElement;
    expect(titleEl.textContent?.trim()).toBe('Oración');
  });

  it('reflects updated title when input changes', async () => {
    fixture.componentRef.setInput('title', 'Liturgia');
    fixture.detectChanges();
    await fixture.whenStable();

    const titleEl = fixture.nativeElement.querySelector('.section-header__title') as HTMLElement;
    expect(titleEl.textContent?.trim()).toBe('Liturgia');
  });

  it('has the correct icon input value', () => {
    expect(component.icon()).toBe('heart');
  });

  it('has the correct title input value', () => {
    expect(component.title()).toBe('Oración');
  });
});
