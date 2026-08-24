import React, { useState, useEffect } from 'react';
import { Lightbulb, CheckCircle2, XCircle, Loader2, RefreshCw, Key, Cpu, Zap } from 'lucide-react';
import { pingGemini, GeminiPingResult, getGeminiApiKey, GEMINI_MODEL_TEXT } from '../utils/gemini';

export const GeminiStatusBulb: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<GeminiPingResult | null>(null);

  // Check on first mount silently
  useEffect(() => {
    const key = getGeminiApiKey();
    if (!key) {
      setStatus('error');
      setResult({
        ok: false,
        hasKey: false,
        model: GEMINI_MODEL_TEXT,
        latencyMs: 0,
        message: 'No se ha detectado variable de entorno GEMINI_API_KEY / VITE_GEMINI_API_KEY.',
        keyMasked: 'No detectada'
      });
    } else {
      // Key is present, start with idle-configured
      setStatus('idle');
    }
  }, []);

  const runTest = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setStatus('checking');
    try {
      const res = await pingGemini();
      setResult(res);
      setStatus(res.ok ? 'success' : 'error');
    } catch (err: any) {
      setStatus('error');
      setResult({
        ok: false,
        hasKey: !!getGeminiApiKey(),
        model: GEMINI_MODEL_TEXT,
        latencyMs: 0,
        message: err?.message || 'Error inesperado al probar conexión.',
        keyMasked: 'Error'
      });
    }
  };

  const getBulbColor = () => {
    switch (status) {
      case 'checking':
        return 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse';
      case 'success':
        return 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.9)]';
      case 'error':
        return 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]';
      case 'idle':
      default:
        return 'text-slate-500 hover:text-green-400 transition-colors';
    }
  };

  return (
    <div className="relative inline-block text-left" id="gemini-status-bulb-container">
      {/* Small subtle bulb button */}
      <button
        id="gemini-bulb-toggle"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!result && status === 'idle') {
            runTest();
          }
        }}
        title="Estado de API Key de Gemini (Clic para comprobar)"
        className={`p-1.5 rounded-full hover:bg-slate-800/60 transition-all active:scale-90 flex items-center justify-center ${getBulbColor()}`}
      >
        {status === 'checking' ? (
          <Loader2 size={15} className="animate-spin text-amber-400" />
        ) : (
          <Lightbulb size={15} className="transition-transform duration-300 hover:scale-110" />
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            id="gemini-status-popover"
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-4 z-50 text-slate-200 text-xs animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-emerald-400" />
                <span className="font-bold uppercase tracking-wider text-[11px] text-slate-100">
                  Estado de Gemini AI
                </span>
              </div>
              <button
                id="gemini-bulb-refresh"
                onClick={runTest}
                disabled={status === 'checking'}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[10px] font-medium"
              >
                <RefreshCw size={11} className={status === 'checking' ? 'animate-spin' : ''} />
                Test
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Status Row */}
              <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Cpu size={12} /> Conexión
                </span>
                <span className="flex items-center gap-1.5 font-bold">
                  {status === 'checking' && (
                    <span className="text-amber-400 flex items-center gap-1">
                      <Loader2 size={11} className="animate-spin" /> Verificando...
                    </span>
                  )}
                  {status === 'success' && (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={13} /> Activa & Operativa
                    </span>
                  )}
                  {status === 'error' && (
                    <span className="text-rose-400 flex items-center gap-1">
                      <XCircle size={13} /> Error de Conexión
                    </span>
                  )}
                  {status === 'idle' && (
                    <span className="text-slate-300">Pendiente de test</span>
                  )}
                </span>
              </div>

              {/* API Key Row */}
              <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Key size={12} /> API Key
                </span>
                <span className="font-mono font-semibold text-slate-200">
                  {result?.keyMasked || (getGeminiApiKey() ? `${getGeminiApiKey().slice(0, 4)}...${getGeminiApiKey().slice(-4)}` : 'No encontrada')}
                </span>
              </div>

              {/* Model & Latency */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                  <div className="text-slate-500 text-[10px]">Modelo</div>
                  <div className="font-semibold text-slate-200 text-[11px] truncate">
                    {result?.model || GEMINI_MODEL_TEXT}
                  </div>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                  <div className="text-slate-500 text-[10px]">Latencia</div>
                  <div className="font-semibold text-emerald-400 text-[11px]">
                    {result?.latencyMs ? `${result.latencyMs} ms` : '-'}
                  </div>
                </div>
              </div>

              {/* Detail message if any */}
              {result?.message && (
                <div className={`p-2.5 rounded-xl text-[10px] leading-relaxed border ${
                  result.ok 
                    ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300' 
                    : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                }`}>
                  <span className="font-bold block mb-0.5">Respuesta:</span>
                  <p className="break-words">{result.message}</p>
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 text-center flex items-center justify-between">
              <span>PepeMoodYear AI Guard</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white px-2 py-0.5 rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default GeminiStatusBulb;
