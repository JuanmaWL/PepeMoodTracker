
import { useState, useCallback, useRef, useEffect } from 'react';
import { MOODS, PEPE_ASSETS } from '../constants';
import { MoodLevel } from '../types';
import SoundManager from '../utils/sounds';
import { requestJudgeVerdict } from '../utils/gemini';

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

export const usePepeJudge = ({ stats, getRangeLabel }: UsePepeJudgeProps) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingText, setLoadingText] = useState("PROCESANDO PECADOS...");
  const [loadingImage, setLoadingImage] = useState(LOADING_POOL[0]);
  const [errorAi, setErrorAi] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

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
        if (!stats || stats.totalDays === 0) {
            throw new Error("No hay datos suficientes para juzgarte.");
        }

        // LÓGICA DE FILTRADO PARA EL TRIBUNAL
        let daysToAnalyze = [...stats.filteredEntries];
        const contextLabel = getRangeLabel();

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

        const text = await requestJudgeVerdict({ judgeMood, contextData });

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
