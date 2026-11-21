import React, { useEffect, useState } from 'react';
import { AlertTriangle, Trash2, Download, CheckCircle2 } from 'lucide-react';
import SoundManager from '../utils/sounds';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onConfirmReset: () => void;
  onCancel: () => void;
  onExportBackup: () => void;
  yearsCount: number;
  entriesCount: number;
}

const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onConfirmReset,
  onCancel,
  onExportBackup,
  yearsCount,
  entriesCount
}) => {
  const [backupDownloaded, setBackupDownloaded] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setBackupDownloaded(false);
    setConfirmChecked(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    onExportBackup();
    setBackupDownloaded(true);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300"
      onClick={onCancel}
    >
      <div
        className="bg-slate-900 border-2 border-red-500/45 w-full max-w-md rounded-[2rem] shadow-[0_0_50px_rgba(239,68,68,0.2)] overflow-hidden p-6 md:p-7 flex flex-col items-center text-center space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 shrink-0">
          <AlertTriangle size={34} />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
            ¿Borrar absolutamente todo?
          </h2>
          <p className="text-slate-300 text-xs md:text-sm font-medium leading-relaxed tabular-nums">
            {entriesCount > 0
              ? `Se eliminarán ${entriesCount} registros de ${yearsCount} ${yearsCount === 1 ? 'año' : 'años'}, tus logros, recordatorios y ajustes locales.`
              : 'Se restablecerán todos los años guardados, logros, recordatorios y ajustes locales.'}
          </p>
        </div>

        <div className="w-full p-4 rounded-2xl bg-slate-950/75 border border-slate-800 space-y-2.5 text-left">
          <p className="text-xs font-black text-slate-200 uppercase tracking-wider">
            1. ¿Quieres hacer copia de seguridad antes?
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Descarga un archivo `.json` con todo tu historial multianual y logros para poder restaurarlo cuando quieras.
          </p>
          <button
            type="button"
            onClick={handleDownloadBackup}
            className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl font-black uppercase tracking-wider text-xs inline-flex items-center justify-center gap-2 transition-colors border ${
              backupDownloaded
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
            }`}
          >
            {backupDownloaded ? (
              <>
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Respaldo descargado</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Descargar respaldo primero</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            SoundManager.play('pop');
            setConfirmChecked((prev) => !prev);
          }}
          className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/70 flex items-center gap-3 text-left transition-colors"
        >
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
              confirmChecked ? 'bg-red-500 border-red-500' : 'border-slate-500'
            }`}
          >
            {confirmChecked && <CheckCircle2 size={13} className="text-white" strokeWidth={3} />}
          </div>
          <span className="text-xs font-bold text-slate-200 select-none">
            Entiendo que esta acción es irreversible y borra todos mis datos
          </span>
        </button>

        <div className="flex flex-col w-full gap-2.5">
          <button
            type="button"
            disabled={!confirmChecked}
            onClick={onConfirmReset}
            className="w-full min-h-[46px] py-3 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border disabled:border-slate-700 disabled:cursor-not-allowed text-white font-black uppercase tracking-[0.15em] text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            <span>Sí, borrar todo definitivamente</span>
          </button>
          <button
            type="button"
            onClick={() => {
              SoundManager.play('click');
              onCancel();
            }}
            className="w-full min-h-[46px] py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-black uppercase tracking-[0.15em] text-xs rounded-2xl transition-all border border-slate-700"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetConfirmModal;
