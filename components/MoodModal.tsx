import React, { useState, useEffect, useRef } from 'react';
import { X, Save, MessageSquareText, Trash2, Download, Loader2, Image as ImageIcon, Sparkles, RefreshCw, Info } from 'lucide-react';
import { MOODS, PEPE_ASSETS } from '../constants';
import { MoodLevel, DayData } from '../types';
import SoundManager from '../utils/sounds';
import { GoogleGenAI } from "@google/genai";

interface MoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DayData) => void;
  onDelete: (dateStr: string) => void;
  initialData: DayData;
  dateStr: string;
}

// Usar constantes centralizadas de assets locales
const PEPE_BASE_SOURCE = PEPE_ASSETS.BANNER;
const PEPE_FAIL_SOURCE = PEPE_ASSETS.CLOWN_GIF;

const MoodModal: React.FC<MoodModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData, dateStr }) => {
  const [level, setLevel] = useState<MoodLevel>(MoodLevel.None);
  const [note, setNote] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  // Estados para Pepe Magic Image Editor
  const [isMemeMode, setIsMemeMode] = useState(false);
  const [generatingMeme, setGeneratingMeme] = useState(false);
  const [memeUrl, setMemeUrl] = useState<string | null>(null);
  const [magicExcuse, setMagicExcuse] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLevel(initialData.level || MoodLevel.None);
      setNote(initialData.note || '');
      setIsConfirmingDelete(false);
      setIsMemeMode(false);
      setShowInfo(false);
      setMemeUrl(null);
      setMagicExcuse(null);
      setGeneratingMeme(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, dateStr]);

  useEffect(() => {
    if (isMemeMode && !memeUrl && !generatingMeme) {
        generateAutoEdit();
    }
  }, [isMemeMode]);

  if (!isOpen) return null;

  const handleMoodSelect = (lvl: MoodLevel) => {
    // Solo reproducir sonido si cambia la selección
    if (level !== lvl) {
        SoundManager.play('pop');
        setLevel(lvl);
    }
  };

  const handleSave = () => {
    SoundManager.play('success');
    onSave({ level, note });
    onClose();
  };

  const handleConfirmDelete = () => {
    SoundManager.play('trash');
    onDelete(dateStr);
    setIsConfirmingDelete(false);
  };

  const initiateDelete = () => {
    SoundManager.play('click');
    setIsConfirmingDelete(true);
  };

  const handleCloseMemeMode = () => {
    setIsMemeMode(false);
    setGeneratingMeme(false);
    setMemeUrl(null);
    setMagicExcuse(null);
  };
  
  const toggleInfo = () => {
    SoundManager.play('click');
    setShowInfo(!showInfo);
  }

  const formatDateDisplay = (isoDate: string) => {
    const [y, m, d] = isoDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const formatted = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    const lower = formatted.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  const getBase64FromUrl = async (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject("No canvas context");
            ctx.drawImage(img, 0, 0);
            try {
                const dataURL = canvas.toDataURL('image/png');
                resolve(dataURL);
            } catch (error) {
                reject("CORS Error al convertir imagen");
            }
        };
        img.onerror = (e) => reject(e);
    });
  };

  const generateAutoEdit = async () => {
    setGeneratingMeme(true);
    setMemeUrl(null);
    setMagicExcuse(null);
    SoundManager.play('magic');

    const apiKey = (import.meta as any).env?.VITE_PEPE_MOOD_KEY || (process as any).env?.NEXT_PUBLIC_PEPE_MOOD_KEY || process.env.API_KEY;

    try {
        if (!apiKey) throw new Error("API Key faltante");

        const ai = new GoogleGenAI({ apiKey: apiKey });

        let base64Image = "";
        try {
             base64Image = await getBase64FromUrl(PEPE_BASE_SOURCE);
        } catch (e) {
             console.error("Error cargando imagen base, usando fallback local de emergencia");
             base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM8c+ZMPQAJ0AOuZ402wAAAAABJRU5ErkJggg==";
        }

        const cleanBase64 = base64Image.split(',')[1];
        
        const moodLabel = MOODS[level].label;
        const contextPrompt = note.trim() 
            ? `Edita esta imagen de Pepe para que visualmente represente esta historia: "${note}". Mantén el estilo de Pepe.` 
            : `Edita esta imagen de Pepe para que represente un estado de ánimo: ${moodLabel}.`;

        const finalPrompt = `${contextPrompt} IMPORTANTE: Mantén al personaje de la rana Pepe, pero cambia su expresión, ropa o fondo según el contexto. Hazlo divertido y estilo meme.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { 
                        inlineData: { 
                            mimeType: 'image/png', 
                            data: cleanBase64 
                        } 
                    },
                    { text: finalPrompt }
                ]
            }
        });

        let generatedImageBase64 = null;
        if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    generatedImageBase64 = part.inlineData.data;
                    break;
                }
            }
        }

        if (generatedImageBase64) {
            setMemeUrl(`data:image/png;base64,${generatedImageBase64}`);
        } else {
            throw new Error("No se generó imagen");
        }

    } catch (e) {
        console.error("Error editando imagen", e);
        setMemeUrl(PEPE_FAIL_SOURCE); 
        setMagicExcuse("La IA está durmiendo la siesta o te falta API Key. Toma este payaso de consolación.");
    } finally {
        setGeneratingMeme(false);
    }
  };

  const handleDownloadMeme = () => {
     if (memeUrl) {
         const link = document.createElement('a');
         link.download = `pepe_mood_${dateStr}.png`;
         link.href = memeUrl;
         link.click();
         SoundManager.play('success');
     }
  };

  // --- RENDER ---

  // Nueva escala de 6 niveles
  const moodLevels = [
    MoodLevel.Rage,
    MoodLevel.Sadge,
    MoodLevel.Regular,
    MoodLevel.Normal,
    MoodLevel.MoiBiens,
    MoodLevel.Legendary
  ];

  const hasExistingData = initialData.level !== MoodLevel.None || (initialData.note && initialData.note.trim() !== "");
  const activeColor = level !== MoodLevel.None ? MOODS[level].color : 'transparent';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* ANIMACIONES CSS PURAS (Inyectadas localmente para portabilidad) */}
      <style>{`
        /* Efecto Gelatina al seleccionar */
        @keyframes jelly-pop {
            0% { transform: scale(1); }
            30% { transform: scale(1.15, 0.85); }
            40% { transform: scale(0.85, 1.15); }
            50% { transform: scale(1.05, 0.95); }
            65% { transform: scale(0.98, 1.02); }
            75% { transform: scale(1.02, 0.98); }
            100% { transform: scale(1); }
        }

        /* Efecto de Palpitación (Glow Pulse) */
        @keyframes card-pulse-shadow {
            0%, 100% { box-shadow: 0 0 15px var(--pulse-color); }
            50% { box-shadow: 0 0 35px var(--pulse-color); }
        }
        
        /* Plasma/Líquido rotatorio para el fondo */
        @keyframes liquid-rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Flotación orgánica de la imagen */
        @keyframes organic-float {
            0%, 100% { transform: translate3d(0,0,0) translateY(0) rotate(0deg); }
            33% { transform: translate3d(0,0,0) translateY(-6px) rotate(2deg); }
            66% { transform: translate3d(0,0,0) translateY(3px) rotate(-1deg); }
        }
        
        /* Brillo pulsante del borde */
        @keyframes border-glow-pulse {
            0%, 100% { opacity: 0.5; box-shadow: 0 0 10px currentColor; }
            50% { opacity: 1; box-shadow: 0 0 25px currentColor; }
        }

        /* Partículas ascendentes (burbujas) */
        @keyframes bubble-rise {
            0% { transform: translateY(100%) scale(0.5); opacity: 0; }
            20% { opacity: 0.5; }
            80% { opacity: 0.5; }
            100% { transform: translateY(-20%) scale(1.2); opacity: 0; }
        }

        .mood-card-selected {
            /* Combinamos jelly-pop (una vez) con el pulso (infinito) */
            /* Eliminamos el delay de 0.6s en card-pulse-shadow para que el glow salga al instante */
            animation: 
                jelly-pop 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards,
                card-pulse-shadow 3s infinite ease-in-out;
            
            /* Fix para el cuadrado transparente: forzar renderizado de capa */
            backface-visibility: hidden;
            transform: translate3d(0,0,0);
            will-change: transform, box-shadow;
        }

        .liquid-bg {
            background-size: 200% 200%;
            animation: liquid-rotate 10s linear infinite;
        }
      `}</style>

      <div 
        className="absolute inset-0 z-0 transition-colors duration-1000 ease-in-out opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 30%, ${activeColor}, transparent 70%)` }}
      />

      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] ring-1 ring-white/10 relative z-10">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm relative z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight leading-none">
              {formatDateDisplay(dateStr)}
            </h2>
            <div className="flex items-center gap-2 mt-2">
                 <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Status:</span>
                 {level !== MoodLevel.None ? (
                     <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-slate-900" style={{ backgroundColor: MOODS[level].color }}>
                         {MOODS[level].label}
                     </span>
                 ) : (
                     <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Pendiente</span>
                 )}
                 <button 
                    onClick={toggleInfo}
                    className="ml-2 p-1 rounded-full hover:bg-slate-800 text-slate-500 hover:text-indigo-400 transition-colors"
                 >
                    <Info size={14} />
                 </button>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-800 rounded-full transition-all text-slate-500 hover:text-white"
          >
            <X size={28} />
          </button>
        </div>

        {/* Info / Legend Panel */}
        {showInfo && (
            <div className="bg-slate-950/80 border-b border-slate-800 p-4 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    {moodLevels.map((lvl) => (
                        <div key={lvl} className="flex flex-col items-center bg-slate-900 rounded-xl p-2 border border-slate-800/50">
                            <span className="text-[10px] font-bold mb-1" style={{ color: MOODS[lvl].color }}>{MOODS[lvl].label}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Content */}
        <div className="p-4 md:p-8 space-y-8 overflow-y-auto custom-scrollbar bg-gradient-to-b from-slate-900 to-slate-950">
          
          {!isMemeMode && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-3 mb-6 px-1">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest opacity-80">Selecciona tu personaje</span>
              <div className="h-px flex-1 bg-gradient-to-r from-slate-800 to-transparent"></div>
            </div>
            
            {/* GRID ACTUALIZADA: 3 Columnas móvil, 6 Desktop. Esto permite ver los 6 en móvil sin scroll. */}
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 md:gap-5">
              {moodLevels.map((moodLvl) => {
                const config = MOODS[moodLvl as MoodLevel];
                const isSelected = level === moodLvl;
                
                // CORRECCIÓN ALINEACIÓN: Contenedor estático idéntico para todos
                const containerSizeClass = "w-20 h-20 sm:w-24 sm:h-24"; 

                // Lógica de Escala Visual (Zoom) en la imagen
                // Esto permite que Moi Biens/Normal sean visualmente más grandes sin afectar el layout
                let imgScaleClass = isSelected 
                    ? "scale-[1.15]" 
                    : "scale-100 group-hover:scale-110";

                if (moodLvl === MoodLevel.MoiBiens) {
                    // Base 115% -> Selected 130%
                    imgScaleClass = isSelected 
                        ? "scale-[1.3]" 
                        : "scale-[1.15] group-hover:scale-[1.25]";
                } else if (moodLvl === MoodLevel.Normal) {
                    // Base 105% -> Selected 120%
                    imgScaleClass = isSelected 
                        ? "scale-[1.2]" 
                        : "scale-[1.05] group-hover:scale-[1.15]";
                }

                return (
                  <button
                    key={moodLvl}
                    disabled={isConfirmingDelete}
                    onClick={() => handleMoodSelect(moodLvl as MoodLevel)}
                    // Padding reducido (py-3) para maximizar espacio de imagen en móvil
                    className={`
                      group relative rounded-2xl transition-all duration-300 w-full aspect-[4/5] flex flex-col items-center justify-between py-3 md:py-6 overflow-hidden outline-none
                      border border-transparent
                      ${isSelected ? 'mood-card-selected z-10' : 'hover:scale-[1.03] active:scale-95 opacity-70 hover:opacity-100'}
                      ${isConfirmingDelete ? 'blur-[1px] grayscale opacity-30 pointer-events-none' : ''}
                    `}
                    // Propiedades para evitar el glitch del cuadrado transparente
                    style={{ 
                        WebkitBackfaceVisibility: 'hidden', 
                        WebkitTransform: 'translate3d(0, 0, 0)',
                        transformStyle: 'preserve-3d',
                        '--pulse-color': isSelected ? `${config.color}60` : 'transparent'
                    } as React.CSSProperties}
                  >
                    {/* --- CAPA 1: FONDO & PLASMA (Solo visible si seleccionado) --- */}
                    {isSelected ? (
                        <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl">
                            <div className="absolute inset-0 bg-slate-900"></div>
                            {/* Plasma Effect */}
                            <div 
                                className="absolute -inset-[100%] liquid-bg opacity-40 blur-2xl" 
                                style={{ 
                                    background: `conic-gradient(from 0deg, ${config.color} 0deg, transparent 120deg, ${config.color} 240deg, transparent 360deg)` 
                                }}
                            />
                             <div 
                                className="absolute -inset-[100%] liquid-bg opacity-30 blur-xl" 
                                style={{ 
                                    background: `conic-gradient(from 180deg, transparent 0deg, ${config.color} 120deg, transparent 240deg, ${config.color} 360deg)`,
                                    animationDirection: 'reverse',
                                    animationDuration: '15s'
                                }}
                            />
                            
                            {/* Partículas */}
                            {[...Array(5)].map((_, i) => (
                                <div 
                                    key={i}
                                    className="absolute rounded-full bg-white blur-[1px]"
                                    style={{
                                        width: Math.random() * 4 + 2 + 'px',
                                        height: Math.random() * 4 + 2 + 'px',
                                        left: Math.random() * 100 + '%',
                                        bottom: '-10px',
                                        backgroundColor: config.color,
                                        opacity: 0.6,
                                        animation: `bubble-rise ${3 + Math.random() * 4}s infinite ease-in ${Math.random() * 2}s`
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        // Fondo por defecto
                        <div className="absolute inset-0 bg-slate-800/20 border border-slate-700/50 rounded-2xl group-hover:bg-slate-700/40 group-hover:border-slate-600 transition-all"></div>
                    )}

                    {/* --- CAPA 2: BORDE BRILLANTE --- */}
                    {isSelected && (
                        <div 
                            className="absolute inset-0 rounded-2xl pointer-events-none z-20 border-[2px]"
                            style={{ 
                                borderColor: config.color,
                                boxShadow: `inset 0 0 15px ${config.color}40`,
                                animation: 'border-glow-pulse 3s infinite alternate'
                            }}
                        />
                    )}

                    {/* --- CAPA 3: IMAGEN FLOTANTE (ESTRUCTURA RÍGIDA) --- */}
                    {/* El contenedor padre tiene flex-1 y centra el contenido, pero el contenido TIENE TAMAÑO FIJO para no romper la alineación */}
                    <div className="relative z-30 w-full flex items-center justify-center flex-1 pointer-events-none">
                         {isSelected && (
                             <div 
                                className="absolute w-24 h-24 rounded-full blur-[40px] opacity-40 animate-pulse" 
                                style={{ backgroundColor: config.color }} 
                             />
                         )}
                         
                         {/* 
                            WRAPPER RÍGIDO: Define el espacio físico que ocupa la imagen.
                            NO tiene animaciones de transform que cambien su tamaño en el flow.
                         */}
                         <div className={`relative ${containerSizeClass} flex items-center justify-center`}>
                            {/* 
                                WRAPPER DE ANIMACIÓN: Se mueve (flota) pero no afecta el layout gracias a estar dentro del wrapper rígido.
                                IMAGEN: Se escala visualmente pero no empuja el contenido.
                            */}
                            <div 
                                className="w-full h-full flex items-center justify-center"
                                style={{ animation: isSelected ? 'organic-float 6s ease-in-out infinite' : 'none' }}
                            >
                                <img 
                                    src={config.image} 
                                    alt={config.label} 
                                    className={`
                                        max-w-none w-full h-full object-contain transition-all duration-500
                                        ${isSelected ? 'drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]' : 'grayscale-[0.7] group-hover:grayscale-0'}
                                        ${imgScaleClass}
                                    `}
                                    style={{ 
                                        filter: isSelected ? 'drop-shadow(0 0 8px rgba(0,0,0,0.3))' : 'none',
                                    }}
                                />
                            </div>
                         </div>
                    </div>

                    {/* --- CAPA 4: TEXTO (ESTRUCTURA RÍGIDA) --- */}
                    <div className="relative z-30 text-center w-full mt-1 md:mt-2">
                      <div 
                        // Eliminado 'scale-110' para evitar que el texto "baje" visualmente.
                        // En su lugar usamos scale-105 muy sutil y color.
                        className={`font-black text-[10px] md:text-sm uppercase tracking-tight leading-none mb-0.5 md:mb-1 transition-all px-1 ${isSelected ? 'scale-105' : ''}`} 
                        style={{ 
                            color: isSelected ? '#fff' : '#94a3b8',
                            textShadow: isSelected ? `0 0 10px ${config.color}` : 'none'
                        }}
                      >
                        {config.label}
                      </div>
                      <div 
                        className={`text-[8px] md:text-[9px] font-bold uppercase tracking-wider transition-all hidden sm:block
                        ${isSelected ? 'text-slate-200 opacity-90' : 'text-slate-600 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'}`}
                      >
                        {config.subLabel}
                      </div>
                    </div>
                    
                    {/* --- CAPA 5: BOTTOM EMPHASIS LINE --- */}
                    {isSelected && (
                        <div 
                            className="absolute bottom-0 left-0 right-0 h-1.5 z-50 rounded-b-xl"
                            style={{ 
                                backgroundColor: config.color,
                                boxShadow: `0 -4px 12px ${config.color}80`
                            }}
                        />
                    )}

                    {/* Efecto de brillo "Sweep" al hacer hover (solo no seleccionados) */}
                    {!isSelected && (
                        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_0.8s_linear] bg-gradient-to-r from-transparent via-white/5 to-transparent z-40 pointer-events-none"></div>
                    )}

                  </button>
                );
              })}
            </div>
          </div>
          )}

          {/* Note Input */}
          <div className={`animate-in slide-in-from-bottom duration-500 delay-150 ${isConfirmingDelete ? 'opacity-30 pointer-events-none' : ''}`}>
             
             <div className="flex justify-between items-center mb-4 px-1">
              <div className="flex items-center gap-2">
                <MessageSquareText size={18} className="text-slate-500" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest opacity-80">Lore del día (opcional)</span>
              </div>
              
              {!isMemeMode && level !== MoodLevel.None && (
                <button 
                  onClick={() => setIsMemeMode(true)}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-white hover:brightness-110 transition-all shadow-lg shadow-purple-500/30 animate-in fade-in zoom-in hover:scale-105 active:scale-95"
                >
                    <Sparkles size={12} className="text-yellow-200" /> Pepe Magic
                </button>
              )}
            </div>
            
            {!isMemeMode ? (
                <div className="relative group">
                    <textarea
                    className="w-full h-32 md:h-40 bg-slate-950/40 border border-slate-800 rounded-3xl p-6 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent placeholder-slate-700 resize-none font-medium transition-all text-base leading-relaxed shadow-inner group-hover:bg-slate-950/60"
                    placeholder="¿Qué ha pasado hoy? Describe el momento..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    />
                    <div className="absolute bottom-4 right-4 pointer-events-none">
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">{note.length} caracteres</span>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-950 rounded-3xl p-4 md:p-6 border border-purple-500/30 text-center animate-in zoom-in duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-purple-400 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                            <Sparkles size={14} /> Pepe Magic Studio
                        </h3>
                        <button onClick={handleCloseMemeMode} className="text-slate-500 hover:text-white text-[10px] font-bold uppercase">Cerrar</button>
                    </div>
                    
                    <div className="relative aspect-square w-full max-w-[350px] mx-auto bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center mb-4">
                        <canvas ref={canvasRef} className="hidden" />
                        
                        {generatingMeme ? (
                            <div className="flex flex-col items-center gap-3 relative z-10">
                                <Loader2 size={40} className="text-purple-500 animate-spin" />
                                <span className="text-xs font-bold text-purple-400 animate-pulse">Invocando magia oscura...</span>
                                <span className="text-[10px] text-slate-500">Interpretando tu lore</span>
                            </div>
                        ) : memeUrl ? (
                            <img src={memeUrl} alt="Resultado" className="w-full h-full object-contain animate-in fade-in duration-500" />
                        ) : (
                             <div className="flex flex-col items-center justify-center opacity-50">
                                <ImageIcon size={32} className="text-slate-600 mb-2" />
                                <span className="text-[10px]">Cargando canvas...</span>
                             </div>
                        )}
                        
                        {generatingMeme && (
                             <img 
                                src={PEPE_BASE_SOURCE} 
                                className="absolute inset-0 w-full h-full object-contain opacity-20 blur-sm grayscale"
                                alt="base"
                             />
                        )}
                    </div>
                    
                    {magicExcuse && (
                        <div className="mb-4 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <p className="text-[10px] text-red-300 font-bold italic">
                                "{magicExcuse}"
                            </p>
                        </div>
                    )}

                    <div className="space-y-3">
                        {memeUrl && !generatingMeme && (
                            <div className="flex gap-2 justify-center">
                                <button 
                                    onClick={generateAutoEdit}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2"
                                >
                                    <RefreshCw size={12} /> Reintentar
                                </button>
                                <button 
                                    onClick={handleDownloadMeme}
                                    className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-green-600/20"
                                >
                                    <Download size={14} /> Guardar
                                </button>
                            </div>
                        )}
                        {generatingMeme && (
                            <p className="text-[10px] text-slate-500 italic animate-pulse">Pepe está pensando...</p>
                        )}
                    </div>
                </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 md:p-8 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md relative z-10">
          
          {isConfirmingDelete ? (
            <div className="flex flex-col gap-3 animate-in fade-in zoom-in duration-300">
              <div className="text-red-400 font-black text-[10px] uppercase tracking-[0.15em] text-center px-4">
                ¿Borrar este lore para siempre, compañero?
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setIsConfirmingDelete(false)}
                  className="flex-1 px-4 py-4 rounded-2xl bg-slate-800 text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700 shadow-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-4 rounded-2xl bg-red-600 text-white font-black text-xs uppercase tracking-widest hover:bg-red-500 transition-all shadow-xl shadow-red-900/40 flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> Sí, borrar todo
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              {hasExistingData && !isMemeMode && (
                <button
                  onClick={initiateDelete}
                  className="w-full sm:w-auto px-5 py-4 rounded-[1.25rem] bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-400 font-black transition-all flex items-center justify-center gap-3 border border-slate-700"
                >
                  <Trash2 size={24} />
                  <span className="sm:hidden lg:inline text-xs uppercase tracking-widest">Borrar registro</span>
                </button>
              )}
              
              <button
                onClick={handleSave}
                disabled={level === MoodLevel.None}
                className={`flex-1 py-4 rounded-[1.25rem] font-black flex justify-center items-center transition-all shadow-2xl
                  ${level !== MoodLevel.None 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-700 text-white hover:brightness-110 active:scale-[0.98] shadow-green-500/30' 
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                  }
                `}
              >
                <div className="flex items-center gap-2 px-2 text-center">
                  <Save size={24} className="shrink-0" />
                  <span className="leading-tight text-xs md:text-sm tracking-[0.1em] uppercase">GUARDAR DÍA</span>
                </div>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MoodModal;