import React, { useState, useEffect, useRef } from 'react';
import { X, Save, MessageSquareText, Trash2, Wand2, Download, Loader2, Share2 } from 'lucide-react';
import { MOODS, MEME_TEMPLATES } from '../constants';
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
  "REGISTRAR LORE", "INMORTALIZAR MOMENTO", "ACTUALIZAR STATUS",
  "CHECKEAR VIBES", "GUARDAR PROGRESO", "CONFIRMAR EXISTENCIA",
  "SUBIR AL ARCHIVO", "SINCRONIZAR VIVENCIA", "PUBLICAR LORE", "ESTABLECER CANON"
];

const MoodModal: React.FC<MoodModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData, dateStr }) => {
  const [level, setLevel] = useState<MoodLevel>(MoodLevel.None);
  const [note, setNote] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [buttonText, setButtonText] = useState(SAVE_PHRASES[0]);
  
  // Estados para Meme Generator
  const [isMemeMode, setIsMemeMode] = useState(false);
  const [generatingMeme, setGeneratingMeme] = useState(false);
  const [memeUrl, setMemeUrl] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>(""); // Para mostrar qué está haciendo la AI
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLevel(initialData.level || MoodLevel.None);
      setNote(initialData.note || '');
      setIsConfirmingDelete(false);
      setIsMemeMode(false);
      setMemeUrl(null);
      setLoadingStep("");
      const randomPhrase = SAVE_PHRASES[Math.floor(Math.random() * SAVE_PHRASES.length)];
      setButtonText(randomPhrase);
    }
  }, [isOpen, initialData]);

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

  const formatDateDisplay = (isoDate: string) => {
    const [y, m, d] = isoDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const formatted = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    const lower = formatted.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  // --- MEME GENERATOR LOGIC ---

  const generateMeme = async () => {
    if (!note || level === MoodLevel.None) return;
    
    setGeneratingMeme(true);
    setMemeUrl(null);
    SoundManager.play('magic');

    let generatedTopText = "";
    let generatedBottomText = "";
    let memeTypeKey = "NEUTRAL";

    // Intentamos recuperar la API Key con todas las estrategias posibles
    const apiKey = (import.meta as any).env?.VITE_PEPE_MOOD_KEY || (process as any).env?.NEXT_PUBLIC_PEPE_MOOD_KEY || process.env.API_KEY;

    try {
        if (!apiKey) throw new Error("API Key faltante");

        const ai = new GoogleGenAI({ apiKey: apiKey });

        // PASO 1: Generar texto y prompt visual con el modelo de TEXTO
        setLoadingStep("Pensando ideas...");
        
        const textPrompt = `
            Contexto: Diario de Pepe the Frog. Mood: ${MOODS[level].label}. Nota: "${note}".
            TAREA: Genera un objeto JSON con:
            - topText: Texto superior para meme (muy breve, impactante).
            - bottomText: Texto inferior para meme (punchline sarcástico).
            - imagePrompt: Una descripción visual detallada en INGLÉS para generar una imagen de "Pepe the Frog" (dibujo estilo meme cartoon) haciendo algo relacionado con la nota.
            - moodType: Uno de estos: 'HAPPY', 'SAD', 'ANGRY', 'CLOWN', 'NEUTRAL'.
            
            Responde SOLO EL JSON.
        `;

        const textResult = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: textPrompt,
            config: { responseMimeType: 'application/json' }
        });

        const json = JSON.parse(textResult.text || "{}");
        generatedTopText = (json.topText || "CUANDO").toUpperCase();
        generatedBottomText = (json.bottomText || "TEXTO DE EJEMPLO").toUpperCase();
        memeTypeKey = json.moodType || "NEUTRAL";
        const imagePrompt = json.imagePrompt || "A funny cartoon drawing of Pepe the Frog";

        // PASO 2: Intentar Generar la imagen con IA
        setLoadingStep("Dibujando a Pepe...");
        let base64Image = null;

        try {
            const finalImagePrompt = `${imagePrompt}. High quality meme art, flat color, clean lines, internet culture style, pepe the frog character.`;
            
            const imageResult = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: finalImagePrompt }] },
                config: {
                    imageConfig: { aspectRatio: "1:1" }
                }
            });

            if (imageResult.candidates?.[0]?.content?.parts) {
                for (const part of imageResult.candidates[0].content.parts) {
                    if (part.inlineData && part.inlineData.data) {
                        base64Image = `data:image/png;base64,${part.inlineData.data}`;
                        break;
                    }
                }
            }
        } catch (imgError) {
            console.warn("Fallo generación imagen, usando fallback", imgError);
            // No lanzamos error, dejamos que base64Image sea null para usar el fallback
        }

        // PASO 3: Si no hay imagen de IA (por error o seguridad), usamos plantilla
        // pero mantenemos el texto generado por IA.
        let imageToUse = base64Image;
        if (!imageToUse) {
            setLoadingStep("Usando plantilla clásica...");
            const templates = MEME_TEMPLATES[memeTypeKey as keyof typeof MEME_TEMPLATES] || MEME_TEMPLATES.NEUTRAL;
            imageToUse = templates[Math.floor(Math.random() * templates.length)];
        }

        // PASO 4: Dibujar
        setLoadingStep("Horneando meme...");
        await drawMeme(imageToUse!, generatedTopText, generatedBottomText);

    } catch (e) {
        console.error("Meme error crítico", e);
        // Fallback total si falla incluso la generación de texto
        await drawMeme(MOODS[level].image || MEME_TEMPLATES.NEUTRAL[0], "ERROR 500", "PEPE NECESITA UN DESCANSO");
    } finally {
        setGeneratingMeme(false);
        setLoadingStep("");
    }
  };

  const drawMeme = (imgSrc: string, top: string, bottom: string) => {
    return new Promise<void>((resolve, reject) => {
        const canvas = canvasRef.current;
        if (!canvas) return resolve();
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve();

        const img = new Image();
        img.crossOrigin = "anonymous"; 
        img.src = imgSrc;

        img.onload = () => {
            canvas.width = 500;
            canvas.height = 500;

            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Cover fit
            const ratio = Math.max(canvas.width / img.width, canvas.height / img.height);
            const x = (canvas.width - img.width * ratio) / 2;
            const y = (canvas.height - img.height * ratio) / 2;
            
            ctx.drawImage(img, 0, 0, img.width, img.height, x, y, img.width * ratio, img.height * ratio);

            // Meme Font Settings
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 6;
            ctx.font = "900 48px Impact, sans-serif";
            ctx.textAlign = "center";
            
            const drawText = (text: string, x: number, y: number, maxWidth: number, baseline: CanvasTextBaseline) => {
                ctx.textBaseline = baseline;
                // Simple word wrap logic could go here, but for memes one-liners are standard
                // We'll just scale down if too long
                let fontSize = 48;
                ctx.font = `900 ${fontSize}px Impact, sans-serif`;
                while (ctx.measureText(text).width > maxWidth && fontSize > 20) {
                    fontSize -= 2;
                    ctx.font = `900 ${fontSize}px Impact, sans-serif`;
                }
                
                ctx.strokeText(text, x, y, maxWidth);
                ctx.fillText(text, x, y, maxWidth);
            };

            drawText(top, 250, 15, 480, "top");
            drawText(bottom, 250, 485, 480, "bottom");

            // Watermark
            ctx.font = "bold 12px sans-serif";
            ctx.fillStyle = "rgba(255,255,255,0.6)";
            ctx.textAlign = "right";
            ctx.lineWidth = 2;
            ctx.textBaseline = "bottom";
            ctx.strokeText("PepeMoodYear", 490, 495);
            ctx.fillText("PepeMoodYear", 490, 495);

            setMemeUrl(canvas.toDataURL('image/png'));
            resolve();
        };

        img.onerror = () => {
             // Fallback finalísimo
             ctx.fillStyle = "#1e293b";
             ctx.fillRect(0,0,500,500);
             ctx.fillStyle = "white";
             ctx.textAlign = "center";
             ctx.fillText("Error de imagen", 250, 250);
             setMemeUrl(canvas.toDataURL('image/png'));
             resolve();
        };
    });
  };

  const handleDownloadMeme = () => {
     if (memeUrl) {
         const link = document.createElement('a');
         link.download = `pepe_meme_${dateStr}.png`;
         link.href = memeUrl;
         link.click();
         SoundManager.play('success');
     }
  };

  // --- RENDER ---

  const moodLevels = [
    MoodLevel.Legendary,
    MoodLevel.MoiBiens,
    MoodLevel.Normal,
    MoodLevel.Regular,
    MoodLevel.Fatal
  ];

  const hasExistingData = initialData.level !== MoodLevel.None || (initialData.note && initialData.note.trim() !== "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] ring-1 ring-white/10">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm relative z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight leading-none">
              {formatDateDisplay(dateStr)}
            </h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Status de hoy</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-800 rounded-full transition-all text-slate-500 hover:text-white"
          >
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar bg-gradient-to-b from-slate-900 to-slate-950">
          
          {/* Mood Selection */}
          {!isMemeMode && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-3 mb-4 px-1">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest opacity-80">Selecciona tu vibra</span>
              <div className="h-px flex-1 bg-slate-800"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {moodLevels.map((moodLvl, index) => {
                const config = MOODS[moodLvl as MoodLevel];
                const isSelected = level === moodLvl;
                const isLastFull = index === moodLevels.length - 1;
                
                return (
                  <button
                    key={moodLvl}
                    disabled={isConfirmingDelete}
                    onClick={() => handleMoodSelect(moodLvl as MoodLevel)}
                    className={`group relative overflow-hidden p-4 rounded-[1.5rem] border-2 transition-all duration-300 flex items-center gap-4 text-left
                      ${isLastFull ? 'md:col-span-2' : ''}
                      ${isSelected 
                        ? 'ring-4 ring-white/5 scale-[1.02] shadow-xl z-10' 
                        : 'hover:scale-[1.01] hover:brightness-110 opacity-70 hover:opacity-100'
                      }
                      ${isConfirmingDelete ? 'blur-[1px] grayscale opacity-50 pointer-events-none' : ''}
                    `}
                    style={{ 
                      borderColor: isSelected ? config.color : `${config.color}33`, 
                      backgroundColor: isSelected ? `${config.color}25` : `${config.color}10`, 
                    }}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden shrink-0 border border-white/10 shadow-lg flex items-center justify-center">
                         <img 
                           src={config.image} 
                           alt={config.label} 
                           className={`w-full h-full object-contain p-1.5 transition-all duration-500
                             ${isSelected ? 'scale-110' : 'opacity-90 group-hover:scale-105 group-hover:opacity-100'}
                           `} 
                         />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm md:text-base leading-tight tracking-tight mb-1 truncate" style={{ color: isSelected ? '#fff' : config.color }}>
                        {config.label}
                      </div>
                      <div className={`text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors truncate ${isSelected ? 'text-slate-100' : 'text-slate-500'}`}>
                        {config.subLabel}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-3 h-3 rounded-full shadow-[0_0_12px_currentColor] shrink-0" style={{ backgroundColor: config.color }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          )}

          {/* Note Input */}
          <div className={`animate-in slide-in-from-bottom duration-500 delay-150 ${isConfirmingDelete ? 'opacity-30 pointer-events-none' : ''}`}>
             
             {/* Header de la sección de texto + Botón Meme */}
             <div className="flex justify-between items-center mb-4 px-1">
              <div className="flex items-center gap-2">
                <MessageSquareText size={18} className="text-slate-500" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest opacity-80">Lore del día</span>
              </div>
              
              {!isMemeMode && level !== MoodLevel.None && note.length > 5 && (
                <button 
                  onClick={() => setIsMemeMode(true)}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase text-white hover:brightness-110 transition-all shadow-lg shadow-purple-500/30 animate-in fade-in zoom-in"
                >
                    <Wand2 size={12} /> Memeify
                </button>
              )}
            </div>
            
            {!isMemeMode ? (
                <textarea
                className="w-full h-32 bg-slate-950/60 border border-slate-800 rounded-3xl p-5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 placeholder-slate-700 resize-none font-medium transition-all text-base leading-relaxed shadow-inner"
                placeholder="¿Qué ha pasado hoy? Describe el momento..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                />
            ) : (
                <div className="bg-slate-950 rounded-3xl p-6 border border-purple-500/30 text-center animate-in zoom-in duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-purple-300 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                            <Wand2 size={14} /> AI Meme Factory
                        </h3>
                        <button onClick={() => setIsMemeMode(false)} className="text-slate-500 hover:text-white text-[10px] font-bold uppercase">Cerrar</button>
                    </div>
                    
                    <div className="relative aspect-square w-full max-w-[350px] mx-auto bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                        <canvas ref={canvasRef} className="hidden" /> {/* Hidden canvas for processing */}
                        
                        {generatingMeme ? (
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 size={40} className="text-purple-500 animate-spin" />
                                <span className="text-xs font-bold text-purple-400 animate-pulse">{loadingStep || "Invocando a Pepe..."}</span>
                            </div>
                        ) : memeUrl ? (
                            <img src={memeUrl} alt="Meme generado" className="w-full h-full object-contain animate-in fade-in duration-500" />
                        ) : (
                            <div className="flex flex-col items-center gap-4 p-8">
                                <span className="text-4xl">🐸✨</span>
                                <p className="text-xs text-slate-400 max-w-[200px]">Pepe creará una imagen única sobre tu día.</p>
                                <button 
                                    onClick={generateMeme}
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-purple-600/30"
                                >
                                    Generar Ahora
                                </button>
                            </div>
                        )}
                    </div>

                    {memeUrl && !generatingMeme && (
                        <div className="mt-4 flex gap-2 justify-center">
                             <button 
                                onClick={generateMeme}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                            >
                                Regenerar
                            </button>
                            <button 
                                onClick={handleDownloadMeme}
                                className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-green-600/20"
                            >
                                <Download size={14} /> Descargar
                            </button>
                        </div>
                    )}
                </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md relative z-10">
          
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