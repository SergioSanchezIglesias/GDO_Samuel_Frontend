const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/**
 * Converts 'yyyy-mm-dd' (or ISO datetime) to 'dd de [month] de yyyy' in Spanish.
 * Examples: '2026-02-15' → '15 de febrero de 2026'
 */
export function formatDateForDisplay(isoDate: string): string {
  const datePart = isoDate.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  const monthName = MONTHS[month - 1] ?? '';
  return `${day} de ${monthName} de ${year}`;
}

/**
 * Converts ISO date string (possibly with time) to 'yyyy-mm-dd' for native date input.
 * Examples: '2026-02-15T00:00:00.000Z' → '2026-02-15'
 */
export function formatDateForInput(isoDate: string): string {
  return isoDate.split('T')[0];
}
