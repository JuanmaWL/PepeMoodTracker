import React, { useMemo, useState } from 'react';
import { X, CloudFog, BrainCircuit } from 'lucide-react';
import { YearData, DayData } from '../types';
import SoundManager from '../utils/sounds';

interface CloudModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: YearData;
}

// Lista de stopwords
const STOPWORDS = new Set([
  'san', // Agregado a petición
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'lo', 'al', 'del',
  'a', 'ante', 'bajo', 'cabe', 'con', 'contra', 'de', 'desde', 'durante',
  'en', 'entre', 'hacia', 'hasta', 'mediante', 'para', 'por', 'segun', 'sin',
  'so', 'sobre', 'tras', 'versus', 'via',
  'yo', 'tu', 'el', 'ella', 'ello', 'nosotros', 'nosotras', 'vosotros', 'vosotras',
  'ellos', 'ellas', 'mi', 'mis', 'tu', 'tus', 'su', 'sus', 'nuestro', 'nuestra',
  'vuestro', 'vuestra', 'me', 'te', 'se', 'nos', 'os', 'le', 'les', 'migo', 'tigo',
  'conmigo', 'contigo', 'consigo',
  'soy', 'eres', 'es', 'somos', 'sois', 'son', 'fui', 'fuiste', 'fue', 'fuimos', 'fueron',
  'era', 'eras', 'eramos', 'eran', 'sido', 'siendo',
  'estoy', 'estas', 'esta', 'estamos', 'estais', 'estan', 'estuve', 'estuviste', 'estuvo',
  'estuvimos', 'estuvieron', 'estaba', 'estabas', 'estabamos', 'estaban', 'estado', 'estando',
  'he', 'has', 'ha', 'hemos', 'habeis', 'han', 'hube', 'hubiste', 'hubo', 'hubimos', 'hubieron',
  'habia', 'habias', 'habiamos', 'habian', 'habido', 'habiendo',
  'tengo', 'tienes', 'tiene', 'tenemos', 'teneis', 'tienen', 'tuve', 'tuviste', 'tuvo',
  'tuvimos', 'tuvieron', 'tenia', 'tenias', 'teniamos', 'tenian', 'tenido', 'teniendo',
  'voy', 'vas', 'va', 'vamos', 'vais', 'van', 'iba', 'ibas', 'ibamos', 'iban', 'ido', 'yendo',
  'hago', 'haces', 'hace', 'hacemos', 'haceis', 'hacen', 'hice', 'hiciste', 'hizo',
  'hicimos', 'hicieron', 'hacia', 'hacias', 'haciamos', 'hacian', 'hecho', 'haciendo',
  'puedo', 'puedes', 'puede', 'podemos', 'podeis', 'pueden', 'podia', 'podias', 'podiamos',
  'queria', 'querias', 'queriamos', 'dije', 'dijo', 'dice', 'dicen', 'saber', 'sabia',
  'y', 'e', 'ni', 'o', 'u', 'pero', 'mas', 'sino', 'aunque', 'porque', 'pues',
  'como', 'cuando', 'donde', 'quien', 'que', 'cual', 'cuanto', 'si', 'no',
  'muy', 'mucho', 'poco', 'bastante', 'tan', 'tanto', 'asi', 'entonces', 'luego',
  'ahora', 'despues', 'mientras', 'siempre', 'nunca', 'jamas', 'tambien', 'tampoco',
  'quizas', 'talvez', 'acaso', 'aqui', 'alli', 'alla', 'ahi', 'cerca', 'lejos',
  'arriba', 'abajo', 'dentro', 'fuera', 'encima', 'debajo', 'delante', 'detras',
  'bien', 'mal', 'mejor', 'peor', 'regular', 'tal', 'tipo', 'cosa', 'cosas', 'algo',
  'nada', 'todo', 'toda', 'todos', 'todas', 'otro', 'otra', 'otros', 'otras',
  'mismo', 'misma', 'mismos', 'mismas', 'ese', 'esa', 'eso', 'esos', 'esas',
  'este', 'esta', 'esto', 'estos', 'estas', 'aquel', 'aquella', 'aquello',
  'dia', 'dias', 'hoy', 'ayer', 'mañana', 'año', 'mes', 'semana', 'vez', 'veces',
  'creo', 'parece', 'siento', 'veo', 'digo', 'bueno', 'malo', 'claro', 'vale',
  'fin', 'principio', 'mitad', 'lado', 'parte', 'gran', 'solo', 'solamente', 'super',
  'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo',
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
]);

// Palabras cortas permitidas (excepciones)
const WHITELIST_SHORT = new Set(['sol', 'mar', 'luz', 'paz', 'fe', 'ron', 'bar', 'gym', 'gas', 'red', 'gol', 'ojo', 'sed', 'fan']);

// Función de Normalización (Solo minúsculas para mantener acentos)
const normalizeText = (text: string) => {
  return text.toLowerCase();
};

// Algoritmo simple de Stemming para español (Singularización)
const getStem = (word: string) => {
  if (WHITELIST_SHORT.has(word)) return word;
  if (word.length <= 3) return word;

  // Plurales en -ces (feliz -> felices, luz -> luces)
  if (word.endsWith('ces')) {
    return word.slice(0, -3) + 'z';
  }
  
  // Plurales en -es (árbol -> árboles)
  if (word.endsWith('es')) {
    const stem = word.slice(0, -2);
    // Evitar romper palabras cortas
    if (stem.length > 2) return stem;
  }

  // Plurales en -s (gato -> gatos)
  if (word.endsWith('s') && !word.endsWith('ss')) {
    const stem = word.slice(0, -1);
    // Evitar romper palabras que terminan en s pero no son plurales obvios
    // o dejar raíces demasiado cortas
    if (stem.length > 2) return stem;
  }

  return word;
};

const CloudModal: React.FC<CloudModalProps> = ({ isOpen, onClose, data }) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const words = useMemo(() => {
    if (!data) return [];
    
    // 1. Extraer todas las notas
    const allNotes = (Object.values(data) as DayData[])
      .map(d => d.note || '')
      .join(' . '); 

    // 2. Normalizar (manteniendo acentos ahora)
    const cleanText = normalizeText(allNotes);

    // 3. Tokenización (Permitiendo letras, números, ñ Y ACENTOS)
    // El replace permite a-z, 0-9, ñ, á, é, í, ó, ú, ü y espacios.
    const tokens = cleanText.replace(/[^a-z0-9ñáéíóúü\s]/g, " ").split(/\s+/);

    const counts: Record<string, number> = {};

    tokens.forEach(token => {
        if (!token) return;
        
        // Filtrado básico
        if (token.length < 3 && !WHITELIST_SHORT.has(token)) return;
        if (STOPWORDS.has(token)) return;
        if (/^\d+$/.test(token)) return; // Ignorar solo números

        // Stemming (Unificar singular/plural)
        // "años" -> "año"
        const stem = getStem(token);

        // Volver a chequear stopwords con el stem (por si "dias" -> "dia")
        if (STOPWORDS.has(stem)) return;

        counts[stem] = (counts[stem] || 0) + 1;
    });

    // 4. Ordenamiento y corte
    let result = Object.entries(counts)
      .map(([text, value]) => ({ text, value }))
      .filter(item => item.value >= 1)
      .sort((a, b) => b.value - a.value);

    // Limitamos la cantidad de palabras para que no explote la nube
    const totalEntries = Object.keys(data).length;
    const maxItemsToShow = totalEntries < 10 ? 15 : 40;

    return result.slice(0, maxItemsToShow);
  }, [data]);

  const maxCount = words.length > 0 ? words[0].value : 1;
  const minCount = words.length > 0 ? words[words.length - 1].value : 0;

  if (!isOpen) return null;

  const handleWordClick = (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    if (selectedWord === word) {
        setSelectedWord(null);
    } else {
        SoundManager.play('pop');
        setSelectedWord(word);
    }
  };

  const handleBackgroundClick = () => {
    if (selectedWord) setSelectedWord(null);
  };

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-in fade-in"
        onClick={handleBackgroundClick}
    >
      <div 
        className="bg-slate-800 border border-slate-700 w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[80vh] max-h-[800px]"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-500/10 rounded-xl text-pink-400 animate-pulse">
                <BrainCircuit size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none">Pepe Mindset</h2>
                <p className="text-[10px] text-pink-400/80 font-bold uppercase tracking-widest mt-1">Los conceptos que dominan tu año</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div 
            className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-900/50"
            onClick={handleBackgroundClick}
        >
          {words.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60 text-center px-6">
              <CloudFog size={64} className="mb-4 text-slate-700" />
              <p className="italic text-lg text-slate-400 mb-2">"Tu mente está en blanco, compañero."</p>
              <p className="text-xs uppercase tracking-widest">Escribe más notas en el diario para generar tu mapa mental.</p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 content-center min-h-full py-10">
              {words.map((w, i) => {
                // Algoritmo de Tamaño:
                // Normalizamos el valor entre 0 y 1
                let normalized = 0;
                if (maxCount !== minCount) {
                  normalized = (w.value - minCount) / (maxCount - minCount);
                } else {
                  normalized = 1; // Si todas tienen el mismo valor
                }

                // Usamos una función cuadrática para exagerar las diferencias
                // Las palabras top serán mucho más grandes.
                // Rango de tamaño: 0.8rem a 4.5rem
                const minSize = 0.8;
                const maxSize = 4.5;
                const size = minSize + (Math.pow(normalized, 1.5) * (maxSize - minSize));
                
                // Opacidad también basada en relevancia
                const opacity = 0.5 + (normalized * 0.5);

                // Colores variados
                const colors = [
                   'text-green-400', 'text-emerald-300', 'text-teal-200', 
                   'text-indigo-400', 'text-violet-300', 'text-purple-200',
                   'text-pink-400', 'text-rose-300', 'text-yellow-400', 'text-orange-300'
                ];
                const colorIndex = w.text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
                const colorClass = colors[colorIndex];

                const isSelected = selectedWord === w.text;
                const isTop = i < 3;

                return (
                  <button 
                    key={w.text}
                    onClick={(e) => handleWordClick(e, w.text)}
                    className={`
                      ${colorClass} font-black uppercase tracking-tight transition-all duration-500 cursor-pointer relative group outline-none select-none appearance-none leading-none
                      ${isTop ? 'z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]' : 'z-0'}
                      ${isSelected ? 'scale-110 z-20 brightness-125' : 'hover:scale-110'}
                    `}
                    style={{ 
                      fontSize: `${size}rem`,
                      opacity: isSelected ? 1 : opacity,
                      transform: isSelected ? 'rotate(0deg)' : `rotate(${(i % 2 === 0 ? 1 : -1) * (Math.random() * 4)}deg)`,
                      margin: `${Math.max(0.2, normalized)}rem` // Más margen para palabras grandes
                    }}
                  >
                    {w.text}
                    
                    {/* Tooltip Interactivo */}
                    <span className={`
                        absolute -top-10 left-1/2 -translate-x-1/2 
                        bg-slate-900/95 text-white text-[12px] px-3 py-1.5 rounded-xl 
                        whitespace-nowrap pointer-events-none border border-slate-700/50 shadow-xl backdrop-blur-sm
                        transition-all duration-200 origin-bottom z-50
                        ${isSelected 
                            ? 'opacity-100 scale-100 translate-y-0' 
                            : 'opacity-0 scale-75 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0'
                        }
                    `}>
                        <span className="font-bold text-yellow-400 mr-1">{w.value}</span>
                        {w.value === 1 ? 'vez' : 'veces'}
                        {/* Triangulito del tooltip */}
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-900/95"></span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-between items-center px-8">
             <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                     <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Top Conceptos</span>
                 </div>
             </div>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                {words.length} Nodos Mentales
             </p>
        </div>

      </div>
    </div>
  );
};

export default CloudModal;