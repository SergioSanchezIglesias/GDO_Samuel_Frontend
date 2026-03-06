import type { ActivitySection } from '../models/activity-section.model';

export const ACTIVITY_SECTIONS: ActivitySection[] = [
  {
    title: 'Liturgia de las Horas',
    icon: 'book-open',
    fields: [
      { key: 'laudes', label: 'Laudes' },
      { key: 'visperas', label: 'Vísperas' },
      { key: 'completas', label: 'Completas' },
    ],
  },
  {
    title: 'Oración',
    icon: 'heart',
    fields: [
      { key: 'angelusReginaCoeli', label: 'Ángelus / Regina Coeli' },
      { key: 'misteriosRosario', label: 'Misterios del Rosario' },
      { key: 'horasSantisimo', label: 'Horas ante el Santísimo' },
      { key: 'horasOracion', label: 'Horas de Oración' },
      { key: 'novenas', label: 'Novenas' },
      { key: 'coronillas', label: 'Coronillas' },
      { key: 'horasOracionCantando', label: 'Horas orando cantando' },
    ],
  },
  {
    title: 'Sacramentos y actos',
    icon: 'church',
    fields: [
      { key: 'misas', label: 'Misas' },
      { key: 'ayunos', label: 'Ayunos' },
      { key: 'voluntariados', label: 'Voluntariados' },
    ],
  },
  {
    title: 'Vida cotidiana',
    icon: 'activity',
    fields: [
      { key: 'horasTrabajo', label: 'Horas de Trabajo' },
      { key: 'horasEstudio', label: 'Horas de Estudio' },
      { key: 'horasDeporte', label: 'Horas de Deporte' },
    ],
  },
];
