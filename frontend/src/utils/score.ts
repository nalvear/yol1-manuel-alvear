/**
 * Interpretación visual del score (0–100). El enunciado no define tramos: se
 * asume que un score mayor implica menor riesgo.
 */
export type ScoreBand = 'high' | 'medium' | 'low';

export const SCORE_BANDS: Record<ScoreBand, { label: string; range: string; description: string }> = {
  high: { label: 'Riesgo alto', range: '0–39', description: 'Requiere evaluación adicional.' },
  medium: { label: 'Riesgo medio', range: '40–69', description: 'Perfil con señales mixtas.' },
  low: { label: 'Riesgo bajo', range: '70–100', description: 'Perfil financiero favorable.' },
};

export const scoreBand = (score: number): ScoreBand => {
  if (score < 40) return 'high';
  if (score < 70) return 'medium';
  return 'low';
};

const dateFormatter = new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'long',
  timeStyle: 'medium',
});

const timeFormatter = new Intl.DateTimeFormat('es-CL', { timeStyle: 'short' });

export const formatDateTime = (iso: string) => dateFormatter.format(new Date(iso));
export const formatTime = (iso: string) => timeFormatter.format(new Date(iso));
