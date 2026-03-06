import { describe, expect, it } from 'vitest';

import { formatDateForDisplay, formatDateForInput } from './date-format';

describe('formatDateForDisplay', () => {
  it('converts 2026-02-15 to "15 de febrero de 2026"', () => {
    expect(formatDateForDisplay('2026-02-15')).toBe('15 de febrero de 2026');
  });

  it('converts 2026-01-01 to "1 de enero de 2026"', () => {
    expect(formatDateForDisplay('2026-01-01')).toBe('1 de enero de 2026');
  });

  it('converts 2026-12-31 to "31 de diciembre de 2026"', () => {
    expect(formatDateForDisplay('2026-12-31')).toBe('31 de diciembre de 2026');
  });

  it('handles ISO datetime string by stripping the time part', () => {
    expect(formatDateForDisplay('2026-02-15T00:00:00.000Z')).toBe('15 de febrero de 2026');
  });

  it('converts all months correctly', () => {
    const cases: [string, string][] = [
      ['2026-01-10', '10 de enero de 2026'],
      ['2026-02-10', '10 de febrero de 2026'],
      ['2026-03-10', '10 de marzo de 2026'],
      ['2026-04-10', '10 de abril de 2026'],
      ['2026-05-10', '10 de mayo de 2026'],
      ['2026-06-10', '10 de junio de 2026'],
      ['2026-07-10', '10 de julio de 2026'],
      ['2026-08-10', '10 de agosto de 2026'],
      ['2026-09-10', '10 de septiembre de 2026'],
      ['2026-10-10', '10 de octubre de 2026'],
      ['2026-11-10', '10 de noviembre de 2026'],
      ['2026-12-10', '10 de diciembre de 2026'],
    ];

    for (const [input, expected] of cases) {
      expect(formatDateForDisplay(input)).toBe(expected);
    }
  });
});

describe('formatDateForInput', () => {
  it('converts ISO datetime to yyyy-mm-dd', () => {
    expect(formatDateForInput('2026-02-15T00:00:00.000Z')).toBe('2026-02-15');
  });

  it('returns yyyy-mm-dd unchanged when already in correct format', () => {
    expect(formatDateForInput('2026-02-15')).toBe('2026-02-15');
  });

  it('strips any time portion', () => {
    expect(formatDateForInput('2026-12-31T23:59:59.999Z')).toBe('2026-12-31');
  });
});
