import { GoogleGenAI } from '@google/genai';

export const GEMINI_MODEL_TEXT = 'gemini-3.6-flash';
export const GEMINI_FALLBACK_TEXT = 'gemini-3-flash-preview';

export function getGeminiApiKey(): string {
  const env = (import.meta as any).env || {};
  const proc = (typeof process !== 'undefined' ? process.env : {}) as any;

  return (
    env.VITE_GEMINI_API_KEY ||
    env.VITE_PEPE_MOOD_KEY ||
    proc.VITE_GEMINI_API_KEY ||
    proc.GEMINI_API_KEY ||
    proc.API_KEY ||
    proc.NEXT_PUBLIC_PEPE_MOOD_KEY ||
    ''
  );
}

export interface GeminiPingResult {
  ok: boolean;
  hasKey: boolean;
  model: string;
  latencyMs: number;
  message: string;
  keyMasked: string;
}

export async function pingGemini(): Promise<GeminiPingResult> {
  const key = getGeminiApiKey();
  const startTime = Date.now();

  if (!key) {
    return {
      ok: false,
      hasKey: false,
      model: GEMINI_MODEL_TEXT,
      latencyMs: 0,
      message: 'No se ha detectado ninguna API Key en las variables de entorno (VITE_GEMINI_API_KEY / GEMINI_API_KEY).',
      keyMasked: 'No configurada'
    };
  }

  const masked = key.length > 8 ? `${key.slice(0, 4)}...${key.slice(-4)}` : '***';

  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: 'Ping test Pepe. Responde solo OK'
    });

    const latency = Date.now() - startTime;
    return {
      ok: true,
      hasKey: true,
      model: GEMINI_MODEL_TEXT,
      latencyMs: latency,
      message: response.text?.trim() || 'OK',
      keyMasked: masked
    };
  } catch (err: any) {
    // Si falla el modelo principal, probar fallback
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const fallbackRes = await ai.models.generateContent({
        model: GEMINI_FALLBACK_TEXT,
        contents: 'Ping test Pepe. Responde solo OK'
      });
      const latency = Date.now() - startTime;
      return {
        ok: true,
        hasKey: true,
        model: GEMINI_FALLBACK_TEXT,
        latencyMs: latency,
        message: fallbackRes.text?.trim() || 'OK (Fallback)',
        keyMasked: masked
      };
    } catch (fallbackErr: any) {
      const latency = Date.now() - startTime;
      return {
        ok: false,
        hasKey: true,
        model: GEMINI_MODEL_TEXT,
        latencyMs: latency,
        message: err?.message || 'Error al conectar con la API de Gemini.',
        keyMasked: masked
      };
    }
  }
}
