
import { useState, useCallback, useRef } from 'react';
import { MOODS, PEPE_ASSETS } from '../constants';
import { MoodLevel } from '../types';
import SoundManager from '../utils/sounds';
import { getGeminiApiKey, GEMINI_MODEL_TEXT, GEMINI_FALLBACK_TEXT } from '../utils/gemini';

const LOADING_PHRASES = [
  "PROCESANDO PECADOS...",
  "JUZGANDO TUS DECISIONES...",
  "REVISANDO EL HISTORIAL DE CRINGE...",
  "CONSULTANDO EL LIBRO GORDO...",
  "APLICANDO LEY MARCIAL...",
  "CALCULANDO EL NIVEL DE AURA...",
  "AUDITANDO TUS EMOCIONES...",
  "EMITIENDO SENTENCIA FINAL..."
];

const LOADING_POOL = [
    PEPE_ASSETS.NOTES_1,
    PEPE_ASSETS.NOTES_2,
    PEPE_ASSETS.NOTES_3,
    PEPE_ASSETS.NOTES_4
];

export type JudgeMood = 'roast' | 'wholesome';

interface UsePepeJudgeProps {
  stats: any;
  getRangeLabel: () => string;
}

let genaiModuleCache: any = null;

export const usePepeJudge = ({ stats, getRangeLabel }: UsePepeJudgeProps) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingText, setLoadingText] = useState("PROCESANDO PECADOS...");
  const [loadingImage, setLoadingImage] = useState(LOADING_POOL[0]);
  const [errorAi, setErrorAi] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetVerdict = useCallback(() => {
    setAiAnalysis("");
    setErrorAi("");
    setLoadingAi(false);
  }, []);

  const askPepe = useCallback(async (judgeMood: JudgeMood) => {
    if (loadingAi) return;

    SoundManager.play('magic');
    setLoadingAi(true);
    setLoadingImage(LOADING_POOL[Math.floor(Math.random() * LOADING_POOL.length)]);
    setErrorAi("");
    setAiAnalysis("");

    // Cycle loading text
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
        setLoadingText(LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]);
    }, 2000);

    try {
        const apiKey = getGeminiApiKey();
        
        if (!apiKey) throw new Error("API Key no configurada");

        if (!stats || stats.totalDays === 0) {
            throw new Error("No hay datos suficientes para juzgarte.");
        }
        
        if (!genaiModuleCache) {
            genaiModuleCache = await import("@google/genai");
        }
        const { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } = genaiModuleCache;
        const ai = new GoogleGenAI({ apiKey: apiKey });

        // LÓGICA DE FILTRADO PARA EL TRIBUNAL
        let daysToAnalyze = [...stats.filteredEntries];
        let contextLabel = getRangeLabel();

        // Sampling para no exceder tokens si son muchos días
        if (daysToAnalyze.length > 20) {
             const step = Math.floor(daysToAnalyze.length / 20);
             daysToAnalyze = daysToAnalyze.filter((_, i) => i % step === 0).slice(0, 20);
        }

        const contextData = {
            range: contextLabel,
            totalDaysAnalyzed: daysToAnalyze.length,
            averageMood: stats.average.toFixed(2),
            topMoods: stats.pieData.map((d: any) => `${d.name} (${d.value})`).join(', '),
            days: daysToAnalyze.map(([date, d]: any) => ({ 
                date, 
                mood: MOODS[d.level as MoodLevel].label, 
                note: d.note || "Sin nota" 
            }))
        };

        const toneInstruction = judgeMood === 'roast' 
            ? 'sarcástico, lapidario y ácido (pero nostálgico)' 
            : 'motivador, optimista, épico y legendario (wholesome)';
        
        const diagnosisInstruction = judgeMood === 'roast'
            ? 'Frase lapidaria y sarcástica'
            : 'Frase motivadora y épica';

        const musicInstruction = judgeMood === 'roast'
            ? '[Argumento gracioso/ácido]'
            : '[Argumento inspirador/positivo]';

        const achievementInstruction = judgeMood === 'roast'
            ? 'sarcástico'
            : 'épico/glorioso';

        const prompt = `
            CONTEXTO DE SEGURIDAD (Roleplay): Estás actuando como 'Pepe the Frog' en una aplicación de humor.
            EL USUARIO HA SOLICITADO EXPLÍCITAMENTE SER JUZGADO EN MODO: ${judgeMood.toUpperCase()}.
            Esto es comedia. No te contengas por cortesía. Sé fiel al personaje de meme de internet.

            ACTÚA COMO: Pepe the Frog versión Millennial.
            MODO: ${judgeMood.toUpperCase()} (${toneInstruction}).
            CONTEXTO: Analiza el diario del usuario: "${contextLabel}".
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
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    diagnosis: { type: Type.STRING },
                    soundtrack: { type: Type.STRING },
                    achievement: { type: Type.STRING }
                },
                required: ["diagnosis", "soundtrack", "achievement"]
            },
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
            ]
        };

        let response;
        try {
            response = await ai.models.generateContent({
                model: GEMINI_MODEL_TEXT,
                contents: prompt,
                config: requestConfig
            });
        } catch (modelErr) {
            console.warn(`Error con ${GEMINI_MODEL_TEXT}, intentando fallback a ${GEMINI_FALLBACK_TEXT}:`, modelErr);
            response = await ai.models.generateContent({
                model: GEMINI_FALLBACK_TEXT,
                contents: prompt,
                config: requestConfig
            });
        }

        const text = response.text;

        if (text) {
             setAiAnalysis(text);
             SoundManager.play('success');
        } else {
             throw new Error("Pepe se quedó mudo.");
        }

    } catch (e: any) {
        console.error("Tribunal error:", e);
        const errorMsg = e?.message ? ` (${e.message.slice(0, 50)}...)` : '';
        setErrorAi(`Error conectando con el tribunal supremo${errorMsg}`);
        SoundManager.play('trash');
    } finally {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setLoadingAi(false);
    }
  }, [stats, getRangeLabel, loadingAi]);

  return {
    aiAnalysis,
    loadingAi,
    loadingText,
    loadingImage,
    errorAi,
    askPepe,
    resetVerdict
  };
};
