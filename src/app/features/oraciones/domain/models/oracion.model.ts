export interface Oracion {
  id: number;
  usuarioId: number;
  retiroId: number;
  laudes: number;
  visperas: number;
  completas: number;
  angelusReginaCoeli: number;
  misteriosRosario: number;
  horasSantisimo: number;
  horasOracion: number;
  novenas: number;
  horasTrabajo: number;
  horasEstudio: number;
  horasDeporte: number;
  horasOracionCantando: number;
  ayunos: number;
  coronillas: number;
  voluntariados: number;
  misas: number;
}

export interface CreateOracionDTO {
  laudes: number;
  visperas: number;
  completas: number;
  angelusReginaCoeli: number;
  misteriosRosario: number;
  horasSantisimo: number;
  horasOracion: number;
  novenas: number;
  horasTrabajo: number;
  horasEstudio: number;
  horasDeporte: number;
  horasOracionCantando: number;
  ayunos: number;
  coronillas: number;
  voluntariados: number;
  misas: number;
}

export interface SumatorioOraciones {
  laudes: number;
  visperas: number;
  completas: number;
  angelusReginaCoeli: number;
  misteriosRosario: number;
  horasSantisimo: number;
  horasOracion: number;
  novenas: number;
  horasTrabajo: number;
  horasEstudio: number;
  horasDeporte: number;
  horasOracionCantando: number;
  ayunos: number;
  coronillas: number;
  voluntariados: number;
  misas: number;
}
