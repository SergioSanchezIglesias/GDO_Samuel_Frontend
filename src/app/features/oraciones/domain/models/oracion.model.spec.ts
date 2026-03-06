import { describe, expect, it } from 'vitest';

import { ACTIVITY_SECTIONS } from '../constants/activity-sections.constant';
import type { CreateOracionDTO } from './oracion.model';

describe('CreateOracionDTO default shape', () => {
  it('has all 16 required fields', () => {
    const dto: CreateOracionDTO = {
      laudes: 0,
      visperas: 0,
      completas: 0,
      angelusReginaCoeli: 0,
      misteriosRosario: 0,
      horasSantisimo: 0,
      horasOracion: 0,
      novenas: 0,
      horasTrabajo: 0,
      horasEstudio: 0,
      horasDeporte: 0,
      horasOracionCantando: 0,
      ayunos: 0,
      coronillas: 0,
      voluntariados: 0,
      misas: 0,
    };

    const keys = Object.keys(dto);
    expect(keys).toHaveLength(16);
  });
});

describe('ACTIVITY_SECTIONS constant', () => {
  it('has exactly 4 sections', () => {
    expect(ACTIVITY_SECTIONS).toHaveLength(4);
  });

  it('every section has a title, icon, and non-empty fields array', () => {
    for (const section of ACTIVITY_SECTIONS) {
      expect(typeof section.title).toBe('string');
      expect(section.title.length).toBeGreaterThan(0);
      expect(typeof section.icon).toBe('string');
      expect(section.icon.length).toBeGreaterThan(0);
      expect(Array.isArray(section.fields)).toBe(true);
      expect(section.fields.length).toBeGreaterThan(0);
    }
  });

  it('covers all 16 fields of CreateOracionDTO across all sections', () => {
    const allKeys = ACTIVITY_SECTIONS.flatMap(s => s.fields.map(f => f.key));
    expect(allKeys).toHaveLength(16);

    const expectedKeys: Array<keyof CreateOracionDTO> = [
      'laudes',
      'visperas',
      'completas',
      'angelusReginaCoeli',
      'misteriosRosario',
      'horasSantisimo',
      'horasOracion',
      'novenas',
      'horasTrabajo',
      'horasEstudio',
      'horasDeporte',
      'horasOracionCantando',
      'ayunos',
      'coronillas',
      'voluntariados',
      'misas',
    ];

    for (const key of expectedKeys) {
      expect(allKeys).toContain(key);
    }
  });

  it('has the correct section titles in order', () => {
    const titles = ACTIVITY_SECTIONS.map(s => s.title);
    expect(titles[0]).toBe('Liturgia de las Horas');
    expect(titles[1]).toBe('Oración');
    expect(titles[2]).toBe('Sacramentos y actos');
    expect(titles[3]).toBe('Vida cotidiana');
  });
});
