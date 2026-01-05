
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, MessageSquareText, Trash2, Download, Loader2, Image as ImageIcon, Sparkles, RefreshCw, ChevronRight, Info, Star } from 'lucide-react';
import { MOODS } from '../constants';
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

const SAVE_PHRASES = [
  "REGISTRAR LORE", "INMORTALIZAR MOMENTO", "ACTUALIZAR STATUS", "GUARDAR DÍA",
  "CHECKEAR VIBES", "GUARDAR PROGRESO", "CONFIRMAR EXISTENCIA",
  "SUBIR AL ARCHIVO", "SINCRONIZAR VIVENCIA", "PUBLICAR LORE", "ESTABLECER CANON"
];

const PEPE_BASE_SOURCE = "https://i.imgur.com/KJSjEue.png"; 
const PEPE_FAIL_SOURCE = "https://media.tenor.com/_hOeFNfH_58AAAAj/pepe-clown-clown-pepe.gif";

const MoodModal: React.FC<MoodModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData, dateStr }) => {
  const [level, setLevel] = useState<MoodLevel>(MoodLevel.None);
  const [note, setNote] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [buttonText, setButtonText] = useState(SAVE_PHRASES[0]);
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
      const randomPhrase = SAVE_PHRASES[Math.floor(Math.random() * SAVE_PHRASES.length)];
      setButtonText(randomPhrase);
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (isMemeMode && !memeUrl && !generatingMeme) {
        generateAutoEdit();
    }
  }, [isMemeMode]);

  if (!isOpen) return null;

  const handleMoodSelect = (lvl: MoodLevel) => {
    SoundManager.play('pop');
    setLevel(lvl);
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
            
            {/* GRID ACTUALIZADA: 2 Columnas móvil, 3 Tablet, 6 Desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              {moodLevels.map((moodLvl) => {
                const config = MOODS[moodLvl as MoodLevel];
                const isSelected = level === moodLvl;
                
                return (
                  <button
                    key={moodLvl}
                    disabled={isConfirmingDelete}
                    onClick={() => handleMoodSelect(moodLvl as MoodLevel)}
                    className={`
                      group relative overflow-visible rounded-2xl transition-all duration-300 w-full flex flex-col items-center justify-between
                      border-2 py-4
                      ${isSelected 
                        ? 'scale-[1.02] z-10 shadow-[0_0_20px_rgba(0,0,0,0.5)]' 
                        : 'hover:scale-[1.01] hover:bg-slate-800/50 border-slate-800 opacity-60 hover:opacity-100'
                      }
                      ${isConfirmingDelete ? 'blur-[1px] grayscale opacity-50 pointer-events-none' : ''}
                    `}
                    style={{ 
                      borderColor: isSelected ? config.color : undefined,
                      backgroundColor: isSelected ? `${config.color}15` : 'transparent',
                      boxShadow: isSelected ? `0 0 20px ${config.color}20` : undefined
                    }}
                  >
                    <div 
                        className={`absolute inset-0 bg-gradient-to-br from-white/5 to-transparent transition-opacity duration-300 rounded-2xl ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} 
                        style={{ background: isSelected ? `linear-gradient(135deg, ${config.color}30 0%, transparent 100%)` : undefined }}
                    />

                    {/* Image Container */}
                    <div className="p-2 shrink-0 relative mb-2">
                        {isSelected && (
                            <>
                                <div className="absolute inset-0 bg-current rounded-full blur-xl opacity-40 animate-pulse"
                                     style={{ color: config.color }}></div>
                            </>
                        )}

                        <div className={`
                            w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden transition-all duration-500 relative
                            ${isSelected 
                                ? 'scale-110 shadow-2xl ring-2 ring-offset-2 ring-offset-slate-900 animate-[pulse_3s_ease-in-out_infinite]' 
                                : 'group-hover:scale-105 grayscale-[0.5] group-hover:grayscale-0'
                            }
                        `}
                        style={{ 
                            boxShadow: isSelected ? `0 0 25px ${config.color}80` : undefined,
                            borderColor: config.color
                        }}
                        >
                            <div className="absolute inset-0 bg-white"></div>
                            <img 
                                src={config.image} 
                                alt={config.label} 
                                className="w-full h-full object-cover relative z-10" 
                            />
                        </div>
                    </div>

                    {/* Text Container */}
                    <div className="flex-1 w-full flex flex-col justify-end items-center text-center relative z-10">
                      <div 
                        className="font-black text-xs sm:text-sm uppercase tracking-tight leading-none mb-1 transition-colors px-1" 
                        style={{ color: isSelected ? config.color : '#94a3b8' }}
                      >
                        {config.label}
                      </div>
                      <div className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                        {config.subLabel}
                      </div>
                    </div>

                    {isSelected && (
                        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: config.color }}></div>
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
                  <span className="leading-tight text-xs md:text-sm tracking-[0.1em] uppercase">{buttonText}</span>
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
