import React, { useEffect, useMemo, useState } from 'react';
import {
  Sparkles,
  X,
  Download,
  Share2,
  Check,
  Loader2,
  Award,
  Flame,
  Lock,
  Calendar as CalendarIcon
} from 'lucide-react';
import { UnlockedAchievement, YearData } from '../types';
import {
  WrappedScope,
  buildWrappedShareText,
  computeWrappedSummary,
  renderWrappedCanvas
} from '../utils/wrapped';
import { requestWrappedTagline } from '../utils/gemini';
import { getYearCompletionStats, readYearDataFromStorage } from '../utils/years';
import SoundManager from '../utils/sounds';

interface PepeWrappedModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: YearData;
  unlockedAchievements: UnlockedAchievement[];
  currentYear: number;
  realCurrentYear: number;
  availableYears: number[];
  initialYear?: number;
  initialScope?: WrappedScope;
  onTravelToYear?: (year: number) => void;
}

const WrappedHeroAvatar: React.FC<{ src: string; alt: string; accentColor: string }> = ({
  src,
  alt,
  accentColor,
}) => {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className="w-20 h-20 rounded-full p-2 bg-slate-950 border-2 flex items-center justify-center shrink-0 overflow-hidden shadow-lg"
      style={{ borderColor: accentColor }}
    >
      {!src || failed ? (
        <span className="text-3xl" aria-hidden="true">🐸</span>
      ) : (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="w-full h-full object-contain"
        />
      )}
    </div>
  );
};

const PepeWrappedModal: React.FC<PepeWrappedModalProps> = ({
  isOpen,
  onClose,
  data,
  unlockedAchievements,
  currentYear,
  realCurrentYear,
  availableYears,
  initialYear,
  initialScope = 'month',
  onTravelToYear,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(initialYear ?? currentYear);
  const [scope, setScope] = useState<WrappedScope>(initialScope);
  const [customTaglines, setCustomTaglines] = useState<Record<string, string>>({});
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedYear(initialYear ?? currentYear);
    setScope(initialScope);
    setAiError(null);
  }, [isOpen, initialYear, currentYear, initialScope]);

  const activeDataForYear = useMemo(() => {
    if (selectedYear === currentYear) return data;
    return readYearDataFromStorage(selectedYear);
  }, [selectedYear, currentYear, data]);

  const yearCompletion = useMemo(
    () => getYearCompletionStats(activeDataForYear, selectedYear),
    [activeDataForYear, selectedYear]
  );

  const isPastYear = selectedYear < realCurrentYear;
  const isAnnualChronicleLocked = scope === 'year' && isPastYear && !yearCompletion.isComplete;

  const summary = useMemo(
    () =>
      computeWrappedSummary(
        activeDataForYear,
        unlockedAchievements,
        selectedYear,
        scope
      ),
    [activeDataForYear, unlockedAchievements, selectedYear, scope]
  );

  if (!isOpen) return null;

  const taglineKey = `${selectedYear}-${scope}`;
  const activeTagline = customTaglines[taglineKey] || summary.defaultTagline;
  const accentColor = summary.dominantMood.color || '#2ECC71';

  const handleClose = () => {
    SoundManager.play('click');
    onClose();
  };

  const handleScopeChange = (nextScope: WrappedScope) => {
    if (nextScope === scope) return;
    SoundManager.play('pop');
    setAiError(null);
    setScope(nextScope);
  };

  const handleYearSelect = (yr: number) => {
    if (yr === selectedYear) return;
    SoundManager.play('pop');
    setAiError(null);
    setSelectedYear(yr);
    if (yr < realCurrentYear) {
      setScope('year');
    }
  };

  const handleAskPepeAI = async () => {
    if (isGeneratingAI || summary.totalDays === 0 || isAnnualChronicleLocked) return;
    SoundManager.play('click');
    setIsGeneratingAI(true);
    setAiError(null);

    try {
      const tagline = await requestWrappedTagline({
        periodTitle: summary.periodTitle,
        totalDays: summary.totalDays,
        averageScore: summary.averageScore,
        dominantMood: summary.dominantMood.label,
        bestStreak: summary.bestStreak,
        topWords: summary.topWords,
      });
      setCustomTaglines((prev) => ({ ...prev, [taglineKey]: tagline }));
      SoundManager.play('success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo consultar a Pepe IA.';
      setAiError(msg);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleDownloadPng = async () => {
    if (isDownloading || isAnnualChronicleLocked) return;
    SoundManager.play('click');
    setIsDownloading(true);

    try {
      const canvas = await renderWrappedCanvas(summary, activeTagline);
      const filename = `pepe-wrapped-${scope}-${selectedYear}.png`;

      await new Promise<void>((resolve) => {
        canvas.toBlob((blob) => {
          const link = document.createElement('a');
          if (blob) {
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = filename;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          } else {
            link.href = canvas.toDataURL('image/png');
            link.download = filename;
            link.click();
          }
          resolve();
        }, 'image/png');
      });
      SoundManager.play('success');
    } catch {
      // Ignore canvas export interruption
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareOrCopy = async () => {
    if (isAnnualChronicleLocked) return;
    SoundManager.play('click');
    const text = buildWrappedShareText(summary, activeTagline);

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: summary.periodTitle,
          text,
        });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedNotice(true);
      SoundManager.play('success');
      setTimeout(() => setCopiedNotice(false), 2500);
    } catch {
      // Clipboard blocked or unavailable
    }
  };

  const handleJumpToCompletePastYear = () => {
    SoundManager.play('click');
    onClose();
    onTravelToYear?.(selectedYear);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300"
      onClick={handleClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 md:p-6 pb-4 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/15 border border-purple-500/30 rounded-xl text-purple-300">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight leading-none">
                Pepe Wrapped
              </h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1 tabular-nums">
                Crónica {selectedYear} · Tarjeta compartible
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
            aria-label="Cerrar Pepe Wrapped"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-5 md:p-6 space-y-4 flex-1 custom-scrollbar">
          {availableYears.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Elegir año de Wrapped">
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => handleYearSelect(yr)}
                  className={`min-h-[44px] px-3.5 rounded-xl text-xs font-black tabular-nums transition-colors whitespace-nowrap ${
                    yr === selectedYear
                      ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40'
                      : 'bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          )}

          <div
            className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/70 border border-slate-800 rounded-2xl"
            role="tablist"
            aria-label="Periodo de Pepe Wrapped"
          >
            <button
              type="button"
              role="tab"
              aria-selected={scope === 'month'}
              onClick={() => handleScopeChange('month')}
              className={`min-h-[44px] rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                scope === 'month'
                  ? 'bg-slate-800 text-white border border-white/10 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mes actual
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={scope === 'year'}
              onClick={() => handleScopeChange('year')}
              className={`min-h-[44px] rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap inline-flex items-center justify-center gap-1.5 ${
                scope === 'year'
                  ? 'bg-slate-800 text-white border border-white/10 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isPastYear && !yearCompletion.isComplete && <Lock size={13} className="text-slate-400" />}
              <span>Año completo</span>
            </button>
          </div>

          {isAnnualChronicleLocked ? (
            <div className="rounded-3xl p-6 bg-slate-950/80 border border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 mx-auto">
                <Lock size={28} />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-lg font-black text-white">
                  Resumen Anual {selectedYear} bloqueado
                </h4>
                <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto tabular-nums">
                  Para desbloquear la Crónica Anual de {selectedYear} debes completar los{' '}
                  <strong className="text-slate-200">{yearCompletion.totalDaysInYear} días</strong> del año.
                </p>
              </div>

              <div className="max-w-xs mx-auto space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300 tabular-nums">
                  <span>Progreso {selectedYear}</span>
                  <span>
                    {yearCompletion.loggedDays}/{yearCompletion.totalDaysInYear} días ({yearCompletion.percent}%)
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${yearCompletion.percent}%` }}
                  />
                </div>
                <p className="text-[11px] font-semibold text-slate-500 tabular-nums">
                  Te faltan {yearCompletion.remainingDays} días por registrar.
                </p>
              </div>

              {onTravelToYear && (
                <button
                  type="button"
                  onClick={handleJumpToCompletePastYear}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 transition-colors"
                >
                  <CalendarIcon size={15} />
                  <span>Viajar a {selectedYear} para completarlo</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {scope === 'year' && !yearCompletion.isComplete && (
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 tabular-nums">
                    <span>Completitud Crónica {selectedYear}</span>
                    <span>
                      {yearCompletion.loggedDays}/{yearCompletion.totalDaysInYear} días ({yearCompletion.percent}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all"
                      style={{ width: `${yearCompletion.percent}%` }}
                    />
                  </div>
                </div>
              )}

              <div
                className="rounded-3xl p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-700/80 shadow-xl space-y-5 relative overflow-hidden"
                style={{ boxShadow: `0 20px 50px -20px ${accentColor}40` }}
              >
                <div className="flex items-center gap-4">
                  <WrappedHeroAvatar
                    src={summary.dominantMood.image}
                    alt={summary.dominantMood.label || 'Pepe'}
                    accentColor={accentColor}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      {summary.subtitle}
                    </p>
                    <h4 className="text-xl font-black text-white tracking-tight truncate mt-0.5">
                      {summary.periodTitle}
                    </h4>
                    <p className="text-xs font-bold mt-1 flex items-center gap-1.5 text-slate-200 tabular-nums">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: accentColor }}
                        aria-hidden="true"
                      />
                      <span>
                        {summary.totalDays > 0
                          ? `Vibe dominante: ${summary.dominantMood.label} (${summary.dominantPercent}%)`
                          : 'Sin registros aún en este periodo'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 tabular-nums">
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Días
                    </p>
                    <p className="text-xl font-black text-white mt-0.5">{summary.totalDays}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 inline-flex items-center gap-1">
                      <Flame size={11} className="text-amber-400" />
                      Racha
                    </p>
                    <p className="text-xl font-black text-white mt-0.5">{summary.bestStreak}d</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Media
                    </p>
                    <p className="text-xl font-black text-white mt-0.5">{summary.averageScore}/6</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5 tabular-nums">
                    <span>Espectro emocional</span>
                    <span>Cobertura {summary.coveragePercent}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden flex">
                    {summary.totalDays > 0 ? (
                      summary.distribution.map((slice) =>
                        slice.count > 0 ? (
                          <div
                            key={slice.level}
                            style={{
                              width: `${(slice.count / summary.totalDays) * 100}%`,
                              backgroundColor: slice.color,
                            }}
                            title={`${slice.label}: ${slice.count} días (${slice.percent}%)`}
                          />
                        ) : null
                      )
                    ) : (
                      <div className="w-full h-full bg-slate-800" />
                    )}
                  </div>

                  {summary.totalDays > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold text-slate-300 tabular-nums">
                      {summary.distribution
                        .filter((slice) => slice.count > 0)
                        .map((slice) => (
                          <span key={slice.level} className="inline-flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: slice.color }}
                              aria-hidden="true"
                            />
                            <span>
                              {slice.label} {slice.percent}%
                            </span>
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <p>
                    <span className="text-slate-400 font-bold">Temas del lore: </span>
                    <span className="font-semibold text-slate-200">
                      {summary.topWords.length > 0
                        ? summary.topWords.join(' · ')
                        : 'Escribe notas diarias para descubrir tus temas'}
                    </span>
                  </p>

                  {summary.topAchievementTitle && (
                    <p className="inline-flex items-center gap-1.5 text-amber-300 font-bold">
                      <Award size={14} className="shrink-0" />
                      <span>Logro destacado: {summary.topAchievementTitle}</span>
                    </p>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <p className="text-xs md:text-sm font-bold text-slate-100 leading-relaxed italic">
                    &ldquo;{activeTagline}&rdquo;
                  </p>
                  {aiError && (
                    <p className="text-[11px] text-rose-400 font-semibold">{aiError}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleAskPepeAI}
                  disabled={isGeneratingAI || summary.totalDays === 0}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 disabled:opacity-45 disabled:pointer-events-none border border-purple-500/35 text-purple-200 text-xs font-black uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors"
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Generando frase de Pepe IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>Toque de Pepe IA</span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadPng}
                    disabled={isDownloading}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Renderizando...</span>
                      </>
                    ) : (
                      <>
                        <Download size={15} />
                        <span>Descargar PNG</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleShareOrCopy}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 text-xs font-black uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    {copiedNotice ? (
                      <>
                        <Check size={15} className="text-emerald-400" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={15} />
                        <span>Compartir</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PepeWrappedModal;
