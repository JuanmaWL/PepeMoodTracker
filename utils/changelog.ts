declare const __APP_VERSION__: string | undefined;

export const APP_VERSION: string =
  typeof __APP_VERSION__ !== 'undefined' && __APP_VERSION__ ? __APP_VERSION__ : '1.2.0';

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
    version: '1.2.0',
    title: 'Edición Móvil, Racha Viva, Archivo 2027 y Borrado Seguro',
    dateLabel: 'Novedades actuales',
    highlights: [
      {
        label: 'Menú Móvil Compacto Sin Scroll',
        detail: 'Los 8 accesos del dock inferior ahora caben completos en pantallas estrechas con soporte de área segura en iOS.'
      },
      {
        label: 'Racha Diaria Dinámica en 5 Niveles',
        detail: 'Tu racha evoluciona de Chispa Inicial a Leyenda del Pantano con iconos, colores y avisos de récord o riesgo.'
      },
      {
        label: 'Archivo Multianual 2027 y Crónica 365/366',
        detail: 'Viaja a años pasados en modo editable para revisar o completar días; la Crónica Anual se desbloquea al completar el año entero.'
      },
      {
        label: 'Zona de Peligro con Respaldo Previo',
        detail: 'Nuevo apartado en Configuración para borrar todo de golpe tras ofrecerte descargar una copia completa de seguridad.'
      }
    ]
  },
  {
    version: '1.1.0',
    title: 'Edición Racha, Cápsula y Wrapped',
    dateLabel: 'Versión anterior',
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
