import React from 'react';
import {
  Sliders,
  X,
  BookOpen,
  HelpCircle,
  BatteryCharging,
  Bell,
  BellOff,
  Clock,
  Info,
  BoxSelect,
  Save,
  FileJson
} from 'lucide-react';
import SoundManager from '../utils/sounds';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTutorial: () => void;
  ecoMode: boolean;
  onToggleEcoMode: () => void;
  pixelMode: boolean;
  onTogglePixelMode: () => void;
  particleCount: number;
  onChangeParticleCount: (count: number) => void;
  notificationsEnabled: boolean;
  nextScheduledInfo: string;
  notificationFeedback: string | null;
  onToggleNotifications: () => void;
  onPreviewNotification: () => void;
  onTestDelayedNotification: () => void;
  onExport: () => void;
  onImportClick: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenTutorial,
  ecoMode,
  onToggleEcoMode,
  pixelMode,
  onTogglePixelMode,
  particleCount,
  onChangeParticleCount,
  notificationsEnabled,
  nextScheduledInfo,
  notificationFeedback,
  onToggleNotifications,
  onPreviewNotification,
  onTestDelayedNotification,
  onExport,
  onImportClick
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-4 border-b border-slate-800/60 shrink-0 flex items-center justify-between bg-slate-900 rounded-t-[2rem]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-800 rounded-xl text-slate-300">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight leading-none">Configuración</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Ajustes & Datos</p>
            </div>
          </div>
          <button
            onClick={() => {
              SoundManager.play('click');
              onClose();
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all text-slate-400 hover:text-white rounded-xl"
            aria-label="Cerrar configuración"
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6 flex-1 scrollbar-thin">
          <button
            onClick={() => {
              SoundManager.play('click');
              onClose();
              onOpenTutorial();
            }}
            className="w-full flex items-center justify-between p-3 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl border border-indigo-500/30 group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
                <BookOpen size={18} />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Ver Tutorial / Guía</div>
                <div className="text-[9px] text-indigo-400/70 font-medium">Instrucciones y trucos</div>
              </div>
            </div>
            <HelpCircle size={18} className="text-indigo-400 opacity-50 group-hover:opacity-100" />
          </button>

          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${ecoMode ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                <BatteryCharging size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">Modo Ahorro</div>
                <div className="text-[9px] text-slate-500 font-medium">Desactiva partículas y blur</div>
              </div>
            </div>
            <button
              onClick={onToggleEcoMode}
              aria-label="Alternar Modo Ahorro"
              className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${ecoMode ? 'bg-green-500' : 'bg-slate-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${ecoMode ? 'translate-x-4' : ''}`}></div>
            </button>
          </div>

          <div className="flex flex-col p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-all duration-300 ${notificationsEnabled ? 'bg-amber-500 text-slate-900 animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
                  {notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                </div>
                <div>
                  <div className="text-xs font-black text-slate-200 uppercase tracking-wider select-none">Recordatorio Diario</div>
                  <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mt-0.5 opacity-80">Aviso local (23:30)</div>
                </div>
              </div>

              <button
                onClick={onToggleNotifications}
                aria-label="Alternar Recordatorio Diario"
                className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 relative shrink-0 ${notificationsEnabled ? 'bg-amber-500' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 bg-slate-900 rounded-full transition-transform duration-300 ${notificationsEnabled ? 'translate-x-5' : ''}`}></div>
              </button>
            </div>

            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              {notificationsEnabled && (
                <div className="flex items-center gap-2.5 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-[10px] text-slate-300">
                  <Clock size={12} className="text-amber-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-slate-500 font-bold uppercase text-[8px] tracking-wider block">Siguiente Alarma</span>
                    <span className="font-mono text-amber-300 font-black">{nextScheduledInfo}</span>
                  </div>
                </div>
              )}

              {notificationFeedback && (
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[10px] text-amber-200 font-semibold leading-relaxed">
                  {notificationFeedback}
                </div>
              )}

              <div className="flex items-start gap-2 text-[9px] text-slate-400 leading-normal pl-1">
                <Info size={11} className="text-slate-500 shrink-0 mt-0.5" />
                <p className="font-bold uppercase tracking-wide text-slate-400/90">
                  {notificationsEnabled
                    ? 'Agenda automática offline. Te recordará si a las 23:30 no has puntuado.'
                    : "Nota: Las notificaciones requieren permiso del navegador (usa 'Abrir en pestaña nueva' para activar)."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onPreviewNotification}
                  className="py-2.5 bg-slate-100/10 hover:bg-slate-100/20 active:scale-95 transition-all text-slate-200 font-black uppercase text-[9px] tracking-widest rounded-xl border border-white/10 flex flex-col items-center justify-center gap-1"
                >
                  <span>Ver Diseño</span>
                  <span className="text-[7px] opacity-60">(Ahora)</span>
                </button>

                <button
                  onClick={onTestDelayedNotification}
                  className="py-2.5 bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 transition-all text-amber-500 font-black uppercase text-[9px] tracking-widest rounded-xl border border-amber-500/30 flex flex-col items-center justify-center gap-1"
                >
                  <span>Test Delay</span>
                  <span className="text-[7px] opacity-60">(En 5 seg)</span>
                </button>
              </div>
            </div>
          </div>

          {!ecoMode && (
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${pixelMode ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  <BoxSelect size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">Partículas Pixel Art</div>
                  <div className="text-[9px] text-slate-500 font-medium">Vibra 8-bits retro</div>
                </div>
              </div>
              <button
                onClick={onTogglePixelMode}
                aria-label="Alternar Partículas Pixel Art"
                className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${pixelMode ? 'bg-purple-500' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${pixelMode ? 'translate-x-4' : ''}`}></div>
              </button>
            </div>
          )}

          {!ecoMode && (
            <div className="space-y-3 opacity-100 transition-opacity">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Intensidad del Pantano</label>
                <span className="text-xs font-mono text-green-400 bg-green-400/10 px-2 py-0.5 rounded">{particleCount}</span>
              </div>

              <div className="relative h-6 flex items-center">
                <input
                  type="range"
                  min="0"
                  max="800"
                  step="10"
                  value={particleCount}
                  onChange={(e) => onChangeParticleCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-all"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-700 mt-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">Gestión de Datos</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onExport}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 p-4 shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-500/40 active:scale-95"
              >
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <Save size={24} className="text-emerald-100 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Exportar</span>
                </div>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
              </button>

              <button
                onClick={onImportClick}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-4 shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-95"
              >
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <FileJson size={24} className="text-blue-100 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Importar</span>
                </div>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-900/95 border-t border-slate-800/60 shrink-0 rounded-b-[2rem] z-10">
          <button
            onClick={() => {
              SoundManager.play('click');
              onClose();
            }}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 active:scale-98 text-white font-black uppercase tracking-wider text-[11px] rounded-xl transition-all border border-slate-700"
          >
            Listo (Cerrar)
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
