export interface Retiro {
  id: number;
  fechaInicio: string;
  fechaFin: string;
  ubicacion: string;
  codigo: string;
}

export interface CreateRetiroDTO {
  fechaInicio: string;
  fechaFin: string;
  ubicacion: string;
}

export type UpdateRetiroDTO = Partial<CreateRetiroDTO>;
