import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ACTIVITY_SECTIONS } from '../../../domain/constants/activity-sections.constant';
import { ActivityGridComponent } from './activity-grid';

describe('ActivityGridComponent', () => {
  let fixture: ComponentFixture<ActivityGridComponent>;
  let component: ActivityGridComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityGridComponent);
    component = fixture.componentInstance;
  });

  it('renders all 4 section titles', () => {
    fixture.componentRef.setInput('data', {});
    fixture.detectChanges();

    const titleEls = fixture.nativeElement.querySelectorAll(
      '.activity-grid__section-title',
    ) as NodeListOf<HTMLElement>;

    expect(titleEls.length).toBe(4);
    const expectedTitles = ACTIVITY_SECTIONS.map(s => s.title);
    titleEls.forEach((el, i) => {
      expect(el.textContent?.trim()).toBe(expectedTitles[i]);
    });
  });

  it('renders correct values for fields present in data', () => {
    fixture.componentRef.setInput('data', {
      laudes: 3,
      visperas: 2,
      misas: 7,
    });
    fixture.detectChanges();

    const cardValues = fixture.nativeElement.querySelectorAll(
      '.activity-grid__card-value',
    ) as NodeListOf<HTMLElement>;

    // laudes is the first field of the first section
    expect(cardValues[0].textContent?.trim()).toBe('3');
    // visperas is the second field of the first section
    expect(cardValues[1].textContent?.trim()).toBe('2');
  });

  it('defaults to 0 for keys not present in data', () => {
    // Pass only laudes; everything else should default to 0
    fixture.componentRef.setInput('data', { laudes: 5 });
    fixture.detectChanges();

    const cardValues = fixture.nativeElement.querySelectorAll(
      '.activity-grid__card-value',
    ) as NodeListOf<HTMLElement>;

    // visperas (index 1) is not in data — must show 0
    expect(cardValues[1].textContent?.trim()).toBe('0');
    // completas (index 2) is not in data — must show 0
    expect(cardValues[2].textContent?.trim()).toBe('0');
  });
});
