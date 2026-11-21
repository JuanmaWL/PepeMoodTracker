export const GEMINI_MODEL_TEXT = 'gemini-4-hydrogen';
export const GEMINI_FALLBACK_TEXT = 'gemini-3.1-flash-lite';

export interface GeminiStatusResult {
  hasKey: boolean;
  model: string;
  keyStatus: string;
}

export interface GeminiPingResult {
  ok: boolean;
  hasKey: boolean;
  model: string;
  latencyMs: number;
  message: string;
  keyStatus: string;
}

export interface OracleLoreItem {
  date: string;
  mood: string;
  note: string;
}

export interface JudgeVerdictRequest {
  judgeMood: 'roast' | 'wholesome';
  contextData: {
    range: string;
    totalDaysAnalyzed: number;
    averageMood: string;
    topMoods: string;
    days: Array<{
      date: string;
      mood: string;
      note: string;
    }>;
  };
}

export interface MemeEditRequest {
  level: number;
  note: string;
}

async function parseJsonSafe(res: Response): Promise<Record<string, any>> {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export async function fetchGeminiStatus(): Promise<GeminiStatusResult> {
  const res = await fetch('/api/gemini/status');
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data.error || 'No se pudo comprobar el estado de Gemini en el servidor.');
  }
  return {
    hasKey: Boolean(data.hasKey),
    model: typeof data.model === 'string' ? data.model : GEMINI_MODEL_TEXT,
    keyStatus: typeof data.keyStatus === 'string' ? data.keyStatus : 'Desconocido',
  };
}

export async function pingGemini(): Promise<GeminiPingResult> {
  const res = await fetch('/api/gemini/ping', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await parseJsonSafe(res);

  if (!res.ok && typeof data.ok !== 'boolean') {
    throw new Error(data.error || data.message || `Error HTTP ${res.status}`);
  }

  return {
    ok: Boolean(data.ok),
    hasKey: Boolean(data.hasKey),
    model: typeof data.model === 'string' ? data.model : GEMINI_MODEL_TEXT,
    latencyMs: typeof data.latencyMs === 'number' ? data.latencyMs : 0,
    message: typeof data.message === 'string' ? data.message : (data.error || 'Error al conectar con Gemini.'),
    keyStatus: typeof data.keyStatus === 'string' ? data.keyStatus : (data.hasKey ? 'Configurada en servidor' : 'No configurada'),
  };
}

export async function requestOracleVerdict(recent: OracleLoreItem[]): Promise<string> {
  const res = await fetch('/api/gemini/oracle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recent }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data.error || `Error HTTP ${res.status}`);
  }
  return typeof data.text === 'string' ? data.text : 'Pepe se ha quedado sin palabras.';
}

export async function requestJudgeVerdict(payload: JudgeVerdictRequest): Promise<string> {
  const res = await fetch('/api/gemini/judge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data.error || `Error HTTP ${res.status}`);
  }
  if (typeof data.analysis !== 'string' || !data.analysis) {
    throw new Error('Pepe se quedó mudo.');
  }
  return data.analysis;
}

export interface WrappedTaglineRequest {
  periodTitle: string;
  totalDays: number;
  averageScore: number;
  dominantMood: string;
  bestStreak: number;
  topWords: string[];
}

export async function requestMemeEdit(payload: MemeEditRequest): Promise<string> {
  const res = await fetch('/api/gemini/meme', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data.error || `Error HTTP ${res.status}`);
  }
  if (typeof data.imageDataUrl !== 'string' || !data.imageDataUrl) {
    throw new Error('No se generó imagen');
  }
  return data.imageDataUrl;
}

export async function requestWrappedTagline(payload: WrappedTaglineRequest): Promise<string> {
  const res = await fetch('/api/gemini/wrapped', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(data.error || `Error HTTP ${res.status}`);
  }
  if (typeof data.tagline !== 'string' || !data.tagline) {
    throw new Error('Pepe no encontró palabras para este periodo.');
  }
  return data.tagline;
}
