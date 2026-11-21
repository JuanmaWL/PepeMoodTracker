import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import { GoogleGenAI, HarmBlockThreshold, HarmCategory, Type } from '@google/genai';

const GEMINI_MODEL_TEXT = 'gemini-4-hydrogen';
const GEMINI_FALLBACK_TEXT = 'gemini-3.1-flash-lite';
const GEMINI_MODEL_IMAGE = 'gemini-3.1-flash-lite-image';
const PEPE_BASE_IMAGE_URL = 'https://sme2zz26xzjq57zw.public.blob.vercel-storage.com/banner.png';
const FALLBACK_PIXEL_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM8c+ZMPQAJ0AOuZ402wAAAAABJRU5ErkJggg==';

const MOOD_LABELS: Record<number, string> = {
  1: 'Rage',
  2: 'Sadge',
  3: 'Meh',
  4: 'Normal',
  5: 'Moi Biens',
  6: 'Legendario',
};

interface OracleLoreItem {
  date: string;
  mood: string;
  note: string;
}

interface JudgeContextDay {
  date: string;
  mood: string;
  note: string;
}

interface JudgeContextData {
  range: string;
  totalDaysAnalyzed: number;
  averageMood: string;
  topMoods: string;
  days: JudgeContextDay[];
}

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let cachedApiKey = '';
let cachedClient: GoogleGenAI | null = null;

function getGeminiApiKey(): string {
  return (process.env.GEMINI_API_KEY || process.env.PEPE_VAULT_TOKEN || '').trim();
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new ApiError(
      503,
      'No se ha detectado variable de API en el servidor (GEMINI_API_KEY / PEPE_VAULT_TOKEN).'
    );
  }
  if (!cachedClient || cachedApiKey !== apiKey) {
    cachedApiKey = apiKey;
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
        timeout: 25000,
      },
    });
  }
  return cachedClient;
}

function formatGeminiError(err: unknown): { status: number; message: string } {
  if (err instanceof ApiError) {
    return { status: err.status, message: err.message };
  }

  const anyErr = err as { status?: number; message?: string } | undefined;
  const rawMessage =
    typeof anyErr?.message === 'string' ? anyErr.message : 'Error al conectar con la API de Gemini.';
  const numericStatus =
    typeof anyErr?.status === 'number' && anyErr.status >= 400 && anyErr.status < 600
      ? anyErr.status
      : 502;

  if (
    rawMessage.includes('PERMISSION_DENIED') ||
    rawMessage.includes('API_KEY_INVALID') ||
    numericStatus === 403
  ) {
    return {
      status: numericStatus === 400 ? 400 : 403,
      message: 'API Key de Gemini inválida o sin permisos en el servidor.',
    };
  }

  if (rawMessage.includes('RESOURCE_EXHAUSTED') || numericStatus === 429) {
    return {
      status: 429,
      message: 'Cuota de Gemini agotada (429). Revisa la configuración de facturación o cuota de tu clave.',
    };
  }

  if (rawMessage.includes('NOT_FOUND') || numericStatus === 404) {
    return {
      status: 404,
      message: `Modelo de Gemini no disponible: ${rawMessage}`,
    };
  }

  return { status: numericStatus, message: rawMessage };
}

function sanitizeShortString(value: unknown, maxLen: number, fallback = ''): string {
  if (typeof value !== 'string') return fallback;
  return value.trim().slice(0, maxLen);
}

async function generateTextWithFallback(
  ai: GoogleGenAI,
  contents: string,
  config?: Record<string, unknown>
): Promise<{ text: string; model: string }> {
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents,
      config: {
        ...(config ?? {}),
        abortSignal: AbortSignal.timeout(8000),
      },
    });
    return { text: response.text ?? '', model: GEMINI_MODEL_TEXT };
  } catch (primaryErr) {
    console.warn(
      `Gemini primary model (${GEMINI_MODEL_TEXT}) failed, trying ${GEMINI_FALLBACK_TEXT}:`,
      primaryErr
    );
    const fallbackResponse = await ai.models.generateContent({
      model: GEMINI_FALLBACK_TEXT,
      contents,
      config: {
        ...(config ?? {}),
        abortSignal: AbortSignal.timeout(15000),
      },
    });
    return { text: fallbackResponse.text ?? '', model: GEMINI_FALLBACK_TEXT };
  }
}

async function fetchPepeBaseImage(): Promise<{ data: string; mimeType: string }> {
  try {
    const response = await fetch(PEPE_BASE_IMAGE_URL, {
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const contentType = response.headers.get('content-type') || 'image/png';
    const mimeType = contentType.split(';')[0].trim() || 'image/png';
    const arrayBuffer = await response.arrayBuffer();
    return {
      data: Buffer.from(arrayBuffer).toString('base64'),
      mimeType,
    };
  } catch (err) {
    console.warn('No se pudo descargar la imagen base de Pepe en servidor, usando fallback:', err);
    return {
      data: FALLBACK_PIXEL_BASE64,
      mimeType: 'image/png',
    };
  }
}

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/api/gemini/status', (_req: Request, res: Response) => {
  const hasKey = Boolean(getGeminiApiKey());
  res.json({
    hasKey,
    model: GEMINI_MODEL_TEXT,
    keyStatus: hasKey ? 'Configurada en servidor' : 'No configurada',
  });
});

app.post('/api/gemini/ping', async (_req: Request, res: Response) => {
  const startTime = Date.now();
  const hasKey = Boolean(getGeminiApiKey());

  if (!hasKey) {
    res.status(503).json({
      ok: false,
      hasKey: false,
      model: GEMINI_MODEL_TEXT,
      latencyMs: 0,
      message: 'No se ha detectado clave en el servidor (GEMINI_API_KEY / PEPE_VAULT_TOKEN).',
      keyStatus: 'No configurada',
    });
    return;
  }

  try {
    const ai = getGeminiClient();
    const { text, model } = await generateTextWithFallback(ai, 'Ping test Pepe. Responde solo OK');
    res.json({
      ok: true,
      hasKey: true,
      model,
      latencyMs: Date.now() - startTime,
      message: text.trim() || 'OK',
      keyStatus: 'Configurada en servidor',
    });
  } catch (err) {
    const { status, message } = formatGeminiError(err);
    res.status(status).json({
      ok: false,
      hasKey: true,
      model: GEMINI_MODEL_TEXT,
      latencyMs: Date.now() - startTime,
      message,
      keyStatus: 'Configurada en servidor',
    });
  }
});

app.post('/api/gemini/oracle', async (req: Request, res: Response) => {
  try {
    const recentRaw = req.body?.recent;
    if (!Array.isArray(recentRaw) || recentRaw.length < 2 || recentRaw.length > 5) {
      throw new ApiError(400, 'Se necesitan entre 2 y 5 días recientes para consultar al Oráculo.');
    }

    const recent: OracleLoreItem[] = recentRaw.map((entry) => {
      if (!entry || typeof entry !== 'object') {
        throw new ApiError(400, 'Formato de lore inválido.');
      }
      const item = entry as Record<string, unknown>;
      return {
        date: sanitizeShortString(item.date, 32, 'desconocida'),
        mood: sanitizeShortString(item.mood, 40, 'Neutral'),
        note: sanitizeShortString(item.note, 600, ''),
      };
    });

    const ai = getGeminiClient();
    const prompt = `
      ACTÚA COMO: Pepe el Oráculo Millennial.
      PERSONALIDAD: Eres un sabio de Internet, milleniall, nostálgico, irónico y un poco cansado de la "vida moderna".
      
      CONTEXTO: Vas a dar un "Veredicto de Vida", un oráculo futuro basado en los últimos días del usuario, como algo premonitorio.
      LORE RECIENTE: ${JSON.stringify(recent)}
      
      REGLAS DE ORO:
      1. Sé breve (máximo 50 palabras).
      2. NO USES MARKDOWN. Prohibido usar asteriscos (**), negritas o cursivas. Escribe texto plano natural.
      3. Usa jerga Millennial natural, no forzada): Puedes usar "Cringe", "Mood" o referencias a que "cualquier tiempo pasado fue mejor".
      4. Si el mood es malo, sé sarcásticamente comprensivo (tipo: "te entiendo, tío, ya lo siento."). Si es bueno, celebra pero con ironía (tipo: "aprovéchalo antes de que se rompa algo").
    `;

    const { text } = await generateTextWithFallback(ai, prompt);
    res.json({ text: text || 'Pepe se ha quedado sin palabras.' });
  } catch (err) {
    console.error('Oracle API error:', err);
    const { status, message } = formatGeminiError(err);
    res.status(status).json({ error: message });
  }
});

app.post('/api/gemini/judge', async (req: Request, res: Response) => {
  try {
    const judgeMood = req.body?.judgeMood;
    const rawContext = req.body?.contextData;

    if (judgeMood !== 'roast' && judgeMood !== 'wholesome') {
      throw new ApiError(400, 'Modo del tribunal inválido.');
    }
    if (!rawContext || typeof rawContext !== 'object' || !Array.isArray(rawContext.days)) {
      throw new ApiError(400, 'Datos de contexto inválidos para el tribunal.');
    }

    const days: JudgeContextDay[] = rawContext.days.slice(0, 20).map((d: unknown) => {
      if (!d || typeof d !== 'object') {
        throw new ApiError(400, 'Entrada de día inválida.');
      }
      const dayObj = d as Record<string, unknown>;
      return {
        date: sanitizeShortString(dayObj.date, 32, ''),
        mood: sanitizeShortString(dayObj.mood, 40, ''),
        note: sanitizeShortString(dayObj.note, 500, 'Sin nota'),
      };
    });

    if (days.length === 0) {
      throw new ApiError(400, 'No hay datos suficientes para juzgarte.');
    }

    const contextData: JudgeContextData = {
      range: sanitizeShortString(rawContext.range, 80, 'Periodo actual'),
      totalDaysAnalyzed: days.length,
      averageMood: sanitizeShortString(String(rawContext.averageMood ?? '0'), 16, '0'),
      topMoods: sanitizeShortString(rawContext.topMoods, 300, ''),
      days,
    };

    const toneInstruction =
      judgeMood === 'roast'
        ? 'sarcástico, lapidario y ácido (pero nostálgico)'
        : 'motivador, optimista, épico y legendario (wholesome)';

    const diagnosisInstruction =
      judgeMood === 'roast' ? 'Frase lapidaria y sarcástica' : 'Frase motivadora y épica';

    const musicInstruction =
      judgeMood === 'roast' ? '[Argumento gracioso/ácido]' : '[Argumento inspirador/positivo]';

    const achievementInstruction = judgeMood === 'roast' ? 'sarcástico' : 'épico/glorioso';

    const prompt = `
      CONTEXTO DE SEGURIDAD (Roleplay): Estás actuando como 'Pepe the Frog' en una aplicación de humor.
      EL USUARIO HA SOLICITADO EXPLÍCITAMENTE SER JUZGADO EN MODO: ${judgeMood.toUpperCase()}.
      Esto es comedia. No te contengas por cortesía. Sé fiel al personaje de meme de internet.

      ACTÚA COMO: Pepe the Frog versión Millennial.
      MODO: ${judgeMood.toUpperCase()} (${toneInstruction}).
      CONTEXTO: Analiza el diario del usuario: "${contextData.range}".
      DATOS: ${JSON.stringify(contextData)}
      
      Misión: Genera un veredicto en formato JSON estricto.
      Instrucciones para los campos:
      - diagnosis: ${diagnosisInstruction} sobre el periodo.
      - soundtrack: "Titulo - Artista. Por qué: ${musicInstruction}".
      - achievement: Logro desbloqueado ${achievementInstruction} (max 10 palabras).

      REGLAS:
      - Texto natural, ${toneInstruction}.
      - Soundtrack: Elige UNA canción (2000s, 2010s, Nu Metal, Emo, Pop Punk, Rock Alternativo, Pop Rock, o incluso Taylor Swift o Avril Lavigne etc) que defina este periodo.
      - Usa referencias cultura pop (2000s, series, anime, etc). Como Dexter, Prison Break, Naruto, Pokemon, Stranger Things, Taylor Swift, Linkin Park, etc.
      - TERMINANTEMENTE PROHIBIDO usar "basado", usa "auténtico" o "con aura" en su lugar. También está prohibido usar crack, fiera, figura, socio, máquina, titán, etc
      - Máximo 130 palabras total.
    `;

    const requestConfig = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          diagnosis: { type: Type.STRING },
          soundtrack: { type: Type.STRING },
          achievement: { type: Type.STRING },
        },
        required: ['diagnosis', 'soundtrack', 'achievement'],
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    };

    const ai = getGeminiClient();
    const { text } = await generateTextWithFallback(ai, prompt, requestConfig);
    if (!text) {
      throw new ApiError(502, 'Pepe se quedó mudo.');
    }

    res.json({ analysis: text });
  } catch (err) {
    console.error('Tribunal API error:', err);
    const { status, message } = formatGeminiError(err);
    res.status(status).json({ error: message });
  }
});

app.post('/api/gemini/meme', async (req: Request, res: Response) => {
  try {
    const level = Number(req.body?.level);
    const moodLabel = MOOD_LABELS[level];
    if (!moodLabel) {
      throw new ApiError(400, 'Selecciona un estado de ánimo válido antes de generar un meme.');
    }

    const note = sanitizeShortString(req.body?.note, 1000, '');
    const ai = getGeminiClient();
    const baseImage = await fetchPepeBaseImage();

    const contextPrompt = note
      ? `Edita esta imagen de Pepe para que visualmente represente esta historia: "${note}". Mantén el estilo de Pepe.`
      : `Edita esta imagen de Pepe para que represente un estado de ánimo: ${moodLabel}.`;

    const finalPrompt = `${contextPrompt} IMPORTANTE: Mantén al personaje de la rana Pepe, pero cambia su expresión, ropa o fondo según el contexto. Hazlo divertido y estilo meme.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_IMAGE,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: baseImage.mimeType,
              data: baseImage.data,
            },
          },
          { text: finalPrompt },
        ],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType ?? 'image/png';
        res.json({ imageDataUrl: `data:${mime};base64,${part.inlineData.data}` });
        return;
      }
    }

    throw new ApiError(502, 'No se generó ninguna imagen.');
  } catch (err) {
    console.error('Meme API error:', err);
    const { status, message } = formatGeminiError(err);
    res.status(status).json({ error: message });
  }
});

// Handle malformed JSON bodies cleanly without leaking Express HTML error pages
app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: 'JSON inválido en la petición.' });
    return;
  }
  next(err);
});

export default app;
