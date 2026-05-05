
import React, { memo, useState, useEffect, useRef, useMemo } from 'react';
import { Gavel, CalendarRange, ChevronDown, ChevronUp, Loader2, Zap, Skull, Heart, Flame, Sparkles, MessageCircleWarning, PartyPopper, Brain, RefreshCw, Undo2, Quote, Music, Trophy } from 'lucide-react';
import { PEPE_ASSETS } from '../../constants';
import { JudgeMood } from '../../hooks/usePepeJudge';
import SoundManager from '../../utils/sounds';

interface JudgeSectionProps {
  loadingAi: boolean;
  aiAnalysis: string;
  errorAi: string;
  loadingText: string;
  loadingImage: string;
  onAskPepe: (mode: JudgeMood) => void;
  onReset: () => void;
  rangeLabel: string;
}

const JUDGE_POOL = [
  PEPE_ASSETS.JUDGE_1, 
  PEPE_ASSETS.JUDGE_2
];

const JudgeSection: React.FC<JudgeSectionProps> = ({
  loadingAi,
  aiAnalysis,
  errorAi,
  loadingText,
  loadingImage,
  onAskPepe,
  onReset,
  rangeLabel
}) => {
  const [judgeMood, setJudgeMood] = useState<JudgeMood>('roast');
  const [isJudgeCollapsed, setIsJudgeCollapsed] = useState(false);
  const [judgeImage, setJudgeImage] = useState(JUDGE_POOL[0]);
  
  // Refs for scrolling
  const judgeRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Background particles memoized
  const backgroundParticles = useMemo(() => {
     return [...Array(10)].map((_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        width: `${Math.random() * 100 + 50}px`,
        height: `${Math.random() * 100 + 50}px`,
        animationDuration: `${Math.random() * 3 + 2}s`,
        animationDelay: `${Math.random() * 2}s`
     }));
  }, []);

  useEffect(() => {
    // Random judge image on mount
    setJudgeImage(JUDGE_POOL[Math.floor(Math.random() * JUDGE_POOL.length)]);
  }, []);

  // Auto-scroll logic when analysis arrives
  useEffect(() => {
    if (aiAnalysis && resultRef.current) {
        setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
  }, [aiAnalysis]);

  const toggleJudgeCollapse = () => {
      SoundManager.play('click');
      setIsJudgeCollapsed(!isJudgeCollapsed);
  };

  const handleAsk = (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (isJudgeCollapsed) setIsJudgeCollapsed(false);
      onAskPepe(judgeMood);
  };

  const handleResetInternal = () => {
      onReset();
      setTimeout(() => {
        judgeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
  };

  // Helper to parse JSON response
  const parseAiResponse = (rawText: string) => {
    if (!rawText) return null;
    
    let diagnosis = "";
    let soundtrackFull = "";
    let achievement = "";

    try {
        const json = JSON.parse(rawText);
        diagnosis = json.diagnosis || "";
        soundtrackFull = json.soundtrack || "";
        achievement = json.achievement || "";
    } catch (e) {
        const cleanStr = (s: string) => s.trim().replace(/^[:\s-]+/, '');
        const diagMatch = rawText.match(/\[?DIAGNÓSTICO\]?:?(.*?)(\[|$)/is);
        const soundMatch = rawText.match(/\[?SOUNDTRACK\]?:?(.*?)(\[|$)/is);
        const achievementMatch = rawText.match(/\[?LOGRO\]?:?(.*?)(\[|$)/is);
        diagnosis = diagMatch ? cleanStr(diagMatch[1]) : "";
        soundtrackFull = soundMatch ? cleanStr(soundMatch[1]) : "";
        achievement = achievementMatch ? cleanStr(achievementMatch[1]) : "";
    }

    const renderSoundtrackContent = (fullText: string) => {
        const separatorRegex = /Por qué:|Why:|Because:/i;
        const splitIndex = fullText.search(separatorRegex);

        let songPart = fullText;
        let reasonPart = "";

        if (splitIndex !== -1) {
            songPart = fullText.substring(0, splitIndex).replace(/[.-]+$/, '').trim();
            reasonPart = fullText.substring(splitIndex).replace(/Por qué:|Why:|Because:/i, '').trim();
        }

        return (
            <div className="group/card relative p-4 rounded-2xl bg-pink-500/5 border border-pink-500/10 hover:bg-pink-500/10 hover:border-pink-500/30 transition-all duration-300 cursor-default flow-root block select-none">
                <div className="float-left mr-4 mb-1 relative">
                    <div className="absolute inset-0 bg-pink-500 rounded-full blur-md opacity-0 group-hover/card:opacity-30 transition-opacity duration-300"></div>
                    <div className="relative p-2 rounded-xl bg-pink-500/10 text-pink-400 group-hover/card:scale-110 group-hover/card:rotate-3 transition-transform duration-300">
                        <Music size={18} />
                    </div>
                </div>
                <div className="text-[10px] font-black text-pink-400/60 uppercase tracking-widest mb-1 group-hover/card:text-pink-400 transition-colors flex items-center gap-2">
                    Now Playing
                </div>
                <p className="text-pink-100 text-sm font-bold leading-tight break-words">
                    {songPart}
                </p>
                {reasonPart && (
                    <div className="text-pink-200/80 text-xs italic leading-relaxed mt-2 border-l-2 border-pink-500/30 pl-2">
                        "{reasonPart}"
                    </div>
                )}
            </div>
        );
    };

    return (
      <div ref={resultRef} className="space-y-4 animate-in fade-in slide-in-from-right duration-700 w-full relative">
        {diagnosis && (
        <div className="group/card relative p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 cursor-default flow-root">
           <div className="float-left mr-4 mb-1 relative">
              <div className="absolute inset-0 bg-indigo-500 rounded-full blur-md opacity-0 group-hover/card:opacity-30 transition-opacity duration-300"></div>
              <div className="relative p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover/card:scale-110 group-hover/card:rotate-3 transition-transform duration-300">
                  <Quote size={18} />
              </div>
           </div>
           <div className="text-[10px] font-black text-indigo-400/60 uppercase tracking-widest mb-1 group-hover/card:text-indigo-400 transition-colors">
              Diagnóstico
           </div>
           <p className="text-indigo-100 text-sm leading-relaxed font-medium italic text-justify md:text-left">
              {diagnosis}
           </p>
        </div>
        )}
        {soundtrackFull && renderSoundtrackContent(soundtrackFull)}
        {achievement && (
          <div className="group/card relative p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all duration-300 cursor-default flow-root">
             <div className="float-left mr-4 mb-1 relative">
                <div className="absolute inset-0 bg-amber-500 rounded-full blur-md opacity-0 group-hover/card:opacity-30 transition-opacity duration-300"></div>
                <div className="relative p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover/card:scale-110 group-hover/card:rotate-3 transition-transform duration-300">
                    <Trophy size={18} />
                </div>
             </div>
             <div className="text-[10px] font-black text-amber-400/60 uppercase tracking-widest mb-1 group-hover/card:text-amber-400 transition-colors">
                Logro Desbloqueado
             </div>
             <p className="text-amber-100 text-sm font-bold leading-snug text-justify md:text-left">
                {achievement}
             </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-slate-700/50">
            <button 
                onClick={handleAsk}
                className="w-full group/card relative flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-[0_4px_20px_-5px_rgba(79,70,229,0.4)] hover:shadow-[0_10px_30px_-5px_rgba(79,70,229,0.5)] transition-all duration-300 active:scale-98 overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/card:opacity-20 transition-opacity duration-300"></div>
                <RefreshCw size={18} className="group-hover/card:rotate-180 transition-transform duration-700" />
                <span className="font-black text-xs uppercase tracking-widest">Apelar Sentencia (Regenerar)</span>
            </button>
            
            <button 
                onClick={handleResetInternal}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200 border border-slate-700 hover:border-slate-500 mt-2 group"
            >
                <Undo2 size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold text-[10px] uppercase tracking-widest">Nuevo Juicio (Volver)</span>
            </button>
        </div>
      </div>
    );
  };

  return (
    <div 
        className="lg:col-span-2 flex flex-col relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-slate-900 group"
        ref={judgeRef}
    >
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 opacity-[0.07] group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                    <img src={PEPE_ASSETS.COUNCIL} className="w-full h-full object-cover grayscale" />
            </div>

            {backgroundParticles.map((p) => (
                <div key={p.id} className="absolute rounded-full bg-indigo-500/10 blur-xl animate-pulse" style={{
                        top: p.top,
                        left: p.left,
                        width: p.width,
                        height: p.height,
                        animationDuration: p.animationDuration,
                        animationDelay: p.animationDelay
                    }}
                />
            ))}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 z-0"></div>
        </div>

        <div className={`relative z-20 flex flex-row justify-between items-center px-4 md:px-6 pt-6 transition-[padding] duration-300 ${isJudgeCollapsed ? 'pb-6' : 'pb-2'}`}>
            <span className="text-indigo-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Gavel size={18} className="text-indigo-400" />
                <span className="md:hidden">Tribunal de Pepe</span>
                <span className="hidden md:inline">Tribunal Supremo de Pepe</span>
            </span>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-white bg-indigo-500/20 px-3 py-1.5 rounded-xl border border-indigo-500/40 shadow-sm animate-in fade-in flex items-center gap-2">
                    <CalendarRange size={12} className="text-indigo-300" />
                    <span className="hidden sm:inline">Juzgando:</span>
                    <span className="text-indigo-300 uppercase tracking-wider">{rangeLabel}</span>
                </span>
                <button 
                    onClick={toggleJudgeCollapse}
                    className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-300 border border-transparent hover:border-indigo-500/30 transition-all"
                >
                    {isJudgeCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>
            </div>
        </div>
    
        <div className={`
            grid transition-[grid-template-rows] duration-500 ease-in-out
            ${isJudgeCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}
        `}>
            <div className="overflow-hidden min-h-0">
                <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center p-4 md:p-6 gap-6 md:gap-8 relative z-10">
                    {/* Judge Avatar */}
                    <div className={`
                        relative transition-all duration-700 shrink-0
                        ${loadingAi 
                            ? 'w-24 h-24 lg:w-40 lg:h-40' 
                            : aiAnalysis 
                                ? 'w-16 h-16 lg:w-28 lg:h-28 order-first lg:order-none' 
                                : 'w-32 h-32 lg:w-48 lg:h-48' 
                        }
                    `}>
                        <div className={`absolute -inset-4 bg-indigo-500/20 rounded-full blur-xl transition-all duration-500 ${loadingAi ? 'animate-pulse scale-110' : 'opacity-50'}`}></div>
                        <div className={`w-full h-full rounded-full overflow-hidden border-4 shadow-2xl relative transition-all duration-500 ${loadingAi ? 'border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.5)] bg-slate-950' : 'border-slate-700 shadow-xl bg-slate-800'} ${!loadingAi && !aiAnalysis ? 'animate-[float_4s_ease-in-out_infinite]' : ''}`}>
                            <img 
                                src={loadingAi ? loadingImage : judgeImage} 
                                alt="Pepe Judge" 
                                className={`w-full h-full transition-all duration-500 ${loadingAi ? 'object-contain p-1 opacity-90 animate-[color-pulse_2s_ease-in-out_infinite]' : 'object-contain p-2 bg-slate-900'}`} 
                            />
                            <style>{`@keyframes color-pulse { 0%, 100% { filter: grayscale(100%); opacity: 0.8; } 50% { filter: grayscale(0%); opacity: 1; } }`}</style>
                            {loadingAi && (
                                <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-10 rounded-full">
                                    <div className="w-full h-[2px] bg-green-400 shadow-[0_0_10px_#4ade80] absolute top-0 animate-[scan_1.5s_ease-in-out_infinite]"></div>
                                    <div className="absolute inset-0 bg-green-500/10 animate-pulse"></div>
                                    <style>{`@keyframes scan { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }`}</style>
                                </div>
                            )}
                        </div>
                        
                        <div className="absolute bottom-0 right-0 z-30">
                            {loadingAi ? (
                                <div className="bg-slate-950 rounded-full p-2 border-2 border-indigo-500 shadow-xl shadow-indigo-500/30">
                                    <Loader2 size={20} className="text-indigo-400 animate-spin" />
                                </div>
                            ) : aiAnalysis ? (
                                <div className="bg-green-600 rounded-full p-1.5 md:p-2 border-2 border-slate-900 shadow-lg animate-in zoom-in">
                                    <Zap size={14} className="text-white fill-white md:w-5 md:h-5" />
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {/* Judge Logic / Content */}
                    <div className="flex-1 w-full flex flex-col items-center lg:items-start text-center lg:text-left transition-all duration-500">
                        {loadingAi ? (
                            <div className="flex flex-col gap-2 items-center lg:items-start w-full animate-pulse">
                                <div className="h-4 w-3/4 bg-indigo-500/20 rounded"></div>
                                <div className="h-4 w-1/2 bg-indigo-500/20 rounded"></div>
                                <div className="h-10 w-full bg-indigo-500/10 rounded-xl mt-4 border border-indigo-500/20 flex items-center justify-center text-indigo-300 text-xs font-mono uppercase tracking-widest px-4">
                                    {loadingText}
                                </div>
                            </div>
                        ) : aiAnalysis ? (
                            parseAiResponse(aiAnalysis)
                        ) : (
                            <div className="flex flex-col gap-4 items-center lg:items-start w-full">
                                <div className="text-center lg:text-left">
                                    <h4 className="text-indigo-200 font-bold text-lg leading-tight">¿Listo para la sentencia?</h4>
                                    <p className="text-indigo-200/50 text-xs leading-relaxed max-w-md">
                                        Pepe analizará tus patrones del periodo <b>{rangeLabel}</b>. Elige la vibra del juez.
                                    </p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 w-full my-6">
                                    {/* ROAST BUTTON */}
                                    <button 
                                        onClick={() => setJudgeMood('roast')}
                                        className={`
                                            group relative overflow-hidden rounded-2xl p-4 md:p-5 border transition-all duration-500 flex flex-col items-center justify-center text-center gap-3
                                            ${judgeMood === 'roast' 
                                                ? 'bg-gradient-to-br from-red-950/80 to-slate-900 border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.3)] scale-[1.02]' 
                                                : 'bg-slate-900/60 border-slate-700/60 opacity-60 hover:opacity-100 hover:border-red-500/40 hover:bg-slate-800'
                                            }
                                        `}
                                    >
                                        {judgeMood === 'roast' && (
                                            <>
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15),transparent)] animate-pulse"></div>
                                                <Flame size={120} className="absolute -bottom-10 -right-10 text-red-600/10 blur-sm pointer-events-none animate-pulse" />
                                            </>
                                        )}
                                        <div className={`
                                            w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 relative z-10
                                            ${judgeMood === 'roast' 
                                                ? 'bg-red-600 text-white shadow-lg shadow-red-600/40 rotate-12' 
                                                : 'bg-slate-800 text-slate-500 group-hover:text-red-400 group-hover:bg-red-500/10'
                                            }
                                        `}>
                                            <Skull size={24} className={judgeMood === 'roast' ? 'animate-[rattle_0.5s_infinite]' : ''} />
                                            <style>{`@keyframes rattle { 0% { transform: rotate(0deg); } 25% { transform: rotate(5deg); } 75% { transform: rotate(-5deg); } 100% { transform: rotate(0deg); } }`}</style>
                                        </div>
                                        <div className="relative z-10 space-y-1">
                                            <span className={`block text-xs md:text-sm font-black uppercase tracking-widest transition-colors ${judgeMood === 'roast' ? 'text-red-100' : 'text-slate-400 group-hover:text-red-300'}`}>
                                                Roast Mode
                                            </span>
                                            <span className="block text-[10px] font-medium opacity-70 leading-tight">
                                                Sarcasmo, realidad dura <br/> y humor negro.
                                            </span>
                                        </div>
                                        {judgeMood === 'roast' && (
                                            <div className="absolute top-3 right-3">
                                                <MessageCircleWarning size={14} className="text-red-500 animate-bounce" />
                                            </div>
                                        )}
                                    </button>

                                    {/* LOVE BUTTON */}
                                    <button 
                                        onClick={() => setJudgeMood('wholesome')}
                                        className={`
                                            group relative overflow-hidden rounded-2xl p-4 md:p-5 border transition-all duration-500 flex flex-col items-center justify-center text-center gap-3
                                            ${judgeMood === 'wholesome' 
                                                ? 'bg-gradient-to-br from-pink-950/80 to-slate-900 border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.3)] scale-[1.02]' 
                                                : 'bg-slate-900/60 border-slate-700/60 opacity-60 hover:opacity-100 hover:border-pink-500/40 hover:bg-slate-800'
                                            }
                                        `}
                                    >
                                        {judgeMood === 'wholesome' && (
                                            <>
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.15),transparent)] animate-pulse"></div>
                                                <Sparkles size={100} className="absolute -top-10 -left-10 text-pink-400/10 blur-sm pointer-events-none animate-[spin_10s_linear_infinite]" />
                                            </>
                                        )}
                                        <div className={`
                                            w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 relative z-10
                                            ${judgeMood === 'wholesome' 
                                                ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/40 -rotate-12' 
                                                : 'bg-slate-800 text-slate-500 group-hover:text-pink-400 group-hover:bg-pink-500/10'
                                            }
                                        `}>
                                            <Heart size={24} className={judgeMood === 'wholesome' ? 'fill-current animate-[heartbeat_1.5s_infinite]' : ''} />
                                            <style>{`@keyframes heartbeat { 0% { transform: scale(1); } 15% { transform: scale(1.15); } 30% { transform: scale(1); } 45% { transform: scale(1.15); } 60% { transform: scale(1); } }`}</style>
                                        </div>
                                        <div className="relative z-10 space-y-1">
                                            <span className={`block text-xs md:text-sm font-black uppercase tracking-widest transition-colors ${judgeMood === 'wholesome' ? 'text-pink-100' : 'text-slate-400 group-hover:text-pink-300'}`}>
                                                Love Mode
                                            </span>
                                            <span className="block text-[10px] font-medium opacity-70 leading-tight">
                                                Motivación, validación <br/> y energía positiva.
                                            </span>
                                        </div>
                                        {judgeMood === 'wholesome' && (
                                            <div className="absolute top-3 right-3">
                                                <PartyPopper size={14} className="text-pink-500 animate-bounce" />
                                            </div>
                                        )}
                                    </button>
                                </div>

                                <button onClick={handleAsk} className="w-full group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-3 shadow-[0_10px_25px_-5px_rgba(79,70,229,0.5)] overflow-hidden mt-2 active:scale-95">
                                    <span className="relative z-10 flex items-center gap-2"><Brain size={18} /> SOLICITAR VEREDICTO</span>
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 skew-y-12 transition-transform duration-500"></div>
                                </button>
                            </div>
                        )}
                        {errorAi && <p className="text-red-400 text-[10px] mt-4 font-bold bg-red-900/20 px-3 py-1 rounded-lg animate-in fade-in">{errorAi}</p>}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default memo(JudgeSection);
