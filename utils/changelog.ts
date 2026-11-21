declare const __APP_VERSION__: string | undefined;

export const APP_VERSION: string =
  typeof __APP_VERSION__ !== 'undefined' && __APP_VERSION__ ? __APP_VERSION__ : '1.1.0';

export const TUTORIAL_KEY = 'pepe_tutorial_seen_v1';
export const SEEN_VERSION_KEY = 'pepe_seen_version';

export interface ReleaseNoteItem {
  version: string;
  title: string;
  dateLabel: string;
  highlights: Array<{
    label: string;
    detail: string;
  }>;
}

export const RELEASE_NOTES: ReleaseNoteItem[] = [
  {
    version: '1.1.0',
    title: 'Edición Racha, Cápsula y Wrapped',
    dateLabel: 'Novedades actuales',
    highlights: [
      {
        label: 'Contador de Racha en Cabecera',
        detail: 'Consulta tus días seguidos, tu récord anual y si hoy sigue pendiente de un vistazo.'
      },
      {
        label: 'Cápsula del Tiempo ("Un día como hoy")',
        detail: 'Revive lo que sentías hace 7 días, hace 1 mes o en años anteriores desde el menú flotante.'
      },
      {
        label: 'Pepe Wrapped Compartible',
        detail: 'Genera tu tarjeta resumen del mes o del año con veredicto opcional de Pepe IA lista para descargar en PNG.'
      },
      {
        label: 'Salto Automático a Hoy y Guía Rápida',
        detail: 'Al abrir la app viajas directo al mes en curso y puedes abrir esta guía cuando quieras desde la cabecera.'
      }
    ]
  }
];
