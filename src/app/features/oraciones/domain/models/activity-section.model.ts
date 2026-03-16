import type { CreateOracionDTO } from './oracion.model';

export interface ActivityField {
  key: keyof CreateOracionDTO;
  label: string;
}

export interface ActivitySection {
  title: string;
  icon: string;
  fields: ActivityField[];
}
