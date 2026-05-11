
import React, { memo, useMemo, useState } from 'react';
import { Lock, CalendarCheck, Search, Filter, ArrowUpDown, Check, X, Trophy, ChevronDown, LayoutGrid, List, LayoutPanelTop } from 'lucide-react';
import { ACHIEVEMENTS } from '../../utils/gamification';
import { UnlockedAchievement } from '../../types';

interface AchievementsListProps {
  unlockedItems: UnlockedAchievement[];
}

type SortOption = 'date' | 'alpha' | 'id';
type FilterOption = 'all' | 'unlocked' | 'locked';
type ViewMode = 'grid' | 'list' | 'compact';

const AchievementsList: React.FC<AchievementsListProps> = ({ unlockedItems }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('date');
    const [filterBy, setFilterBy] = useState<FilterOption>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
    
    // Filter and Sort logic
    const processedAchievements = useMemo(() => {
        let items = [...ACHIEVEMENTS];

        // 1. Search Filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            items = items.filter(ach => 
                ach.title.toLowerCase().includes(query) || 
                ach.description.toLowerCase().includes(query)
            );
        }

        // 2. Status Filter
        if (filterBy === 'unlocked') {
            items = items.filter(ach => unlockedItems.some(u => u.id === ach.id));
        } else if (filterBy === 'locked') {
            items = items.filter(ach => !unlockedItems.some(u => u.id === ach.id));
        }

        // 3. Sorting
        return items.sort((a, b) => {
            const unlockA = unlockedItems.find(u => u.id === a.id);
            const unlockB = unlockedItems.find(u => u.id === b.id);
            
            if (sortBy === 'date') {
                // If both unlocked, sort by date
                if (unlockA && unlockB) return unlockB.unlockedAt - unlockA.unlockedAt;
                // Unlocked first
                if (unlockA && !unlockB) return -1;
                if (!unlockA && unlockB) return 1;
                return 0;
            } else if (sortBy === 'alpha') {
                return a.title.localeCompare(b.title);
            } else {
                // Sort by ID is usually Category/Rarity in logic
                return a.id.localeCompare(b.id);
            }
        });
    }, [unlockedItems, searchQuery, sortBy, filterBy]);

    const formatDate = (timestamp: number) => {
        if (!timestamp) return 'Hito Histórico'; 
        return `${new Date(timestamp).toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'short',
            year: 'numeric'
        })}`;
    };

    return (
        <div className="flex flex-col gap-6">
            {/* SEARCH & FILTERS BAR */}
            <div className={`
                flex flex-col gap-3 bg-slate-900/80 p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] border border-white/10 backdrop-blur-xl sticky top-0 z-30 shadow-2xl shadow-black/50 overflow-hidden group/bar transition-all duration-500
                ${isFiltersExpanded ? 'max-h-[600px]' : 'max-h-[64px] md:max-h-[72px]'}
            `}>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none opacity-[0.05]" />
                
                {/* Compact Row: Search + View + Filter Toggle */}
                <div className="flex items-center gap-1.5 md:gap-3 relative z-10 shrink-0">
                    <div className="relative flex-1 group/search">
                        <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/search:text-amber-400 transition-colors" size={16} />
                        <input 
                            type="text"
                            placeholder="Buscar..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl py-2 md:py-2.5 pl-9 md:pl-12 pr-4 text-[10px] md:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 transition-all shadow-inner"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    
                    {/* View Switcher - More compact on mobile */}
                    <div className="flex bg-black/40 p-0.5 md:p-1 rounded-xl md:rounded-2xl border border-white/10 shrink-0">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all ${viewMode === 'grid' ? 'bg-amber-500 text-white' : 'text-slate-500'}`}
                        >
                            <LayoutGrid size={14} className="md:size-[18px]" />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all ${viewMode === 'list' ? 'bg-amber-500 text-white' : 'text-slate-500'}`}
                        >
                            <List size={14} className="md:size-[18px]" />
                        </button>
                        <button 
                            onClick={() => setViewMode('compact')}
                            className={`p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all ${viewMode === 'compact' ? 'bg-amber-500 text-white' : 'text-slate-500'}`}
                        >
                            <LayoutPanelTop size={14} className="md:size-[18px]" />
                        </button>
                    </div>

                    <button 
                        onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                        className={`
                            h-[34px] md:h-[42px] px-2 md:px-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-1.5 font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all shrink-0
                            ${isFiltersExpanded 
                                ? 'bg-amber-500 text-white shadow-lg' 
                                : 'bg-slate-800 text-slate-400 border border-white/5 hover:bg-slate-700'}
                        `}
                    >
                        <Filter size={14} className="md:size-4" />
                        <span className="hidden sm:inline">{isFiltersExpanded ? 'Ok' : 'Filtros'}</span>
                        <ChevronDown size={12} className={`transition-transform duration-500 ${isFiltersExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Collapsible Content */}
                <div className={`
                    flex flex-col gap-3 transition-all duration-500
                    ${isFiltersExpanded ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible pointer-events-none'}
                `}>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        {/* Status Filter */}
                        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 flex-1 shadow-inner relative overflow-hidden">
                            {(['all', 'unlocked', 'locked'] as FilterOption[]).map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => setFilterBy(opt)}
                                    className={`
                                        flex-1 px-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative z-10
                                        ${filterBy === opt 
                                            ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg' 
                                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
                                    `}
                                >
                                    {opt === 'all' ? 'Todos' : opt === 'unlocked' ? 'Conseguidos' : 'Bloqueados'}
                                </button>
                            ))}
                        </div>

                        {/* Sort Order */}
                        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                            {(['date', 'alpha', 'id'] as SortOption[]).map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => setSortBy(opt)}
                                    className={`
                                        flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2
                                        ${sortBy === opt 
                                            ? 'bg-slate-800 text-amber-400 shadow-md border border-white/10 ring-1 ring-white/5 scale-[1.02]' 
                                            : 'text-slate-600 hover:text-slate-400 hover:bg-white/5'}
                                    `}
                                >
                                    {opt === 'date' && <CalendarCheck size={14} />}
                                    {opt === 'alpha' && <ArrowUpDown size={14} />}
                                    {opt === 'id' && <Trophy size={14} />}
                                    <span className={sortBy === opt ? 'block' : 'hidden md:block'}>
                                        {opt === 'date' ? 'Recientes' : opt === 'alpha' ? 'A-Z' : 'Rareza'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ACHIEVEMENTS GRID */}
            <div className={`
                pb-20 mt-1 transition-all duration-500
                ${viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6' 
                    : viewMode === 'list' 
                        ? 'flex flex-col gap-3 md:gap-4' 
                        : 'grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3'}
            `}>
                 {processedAchievements.length > 0 ? processedAchievements.map((ach) => {
                     const unlockInfo = unlockedItems.find(u => u.id === ach.id);
                     const isUnlocked = !!unlockInfo;
                     
                     if (viewMode === 'compact') {
                        return (
                            <div 
                                key={ach.id}
                                className={`
                                    aspect-square rounded-xl md:rounded-2xl border flex flex-col items-center justify-center gap-1 group/mini transition-all duration-300
                                    ${isUnlocked 
                                        ? 'bg-slate-800/40 border-white/10 hover:scale-105 hover:bg-slate-800/60' 
                                        : 'bg-black/20 border-white/5 opacity-40 grayscale'}
                                `}
                                style={{
                                    boxShadow: isUnlocked ? `0 8px 16px -8px ${ach.color}30` : 'none',
                                    borderColor: isUnlocked ? `${ach.color}20` : ''
                                }}
                                title={`${ach.title}: ${ach.description}`}
                            >
                                <div className="p-1 md:p-2 rounded-lg md:rounded-xl transition-transform duration-500 group-hover/mini:rotate-12" style={{ color: isUnlocked ? ach.color : '#334155', backgroundColor: isUnlocked ? `${ach.color}15` : 'transparent' }}>
                                    {isUnlocked ? <ach.icon size={16} className="md:size-5" /> : <Lock size={14} className="md:size-4" />}
                                </div>
                                <span className={`text-[7px] md:text-[8px] font-black tracking-tighter uppercase line-clamp-1 px-1 ${isUnlocked ? 'text-slate-300' : 'text-slate-700'}`}>
                                    {ach.title}
                                </span>
                            </div>
                        );
                     }

                     if (viewMode === 'list') {
                        return (
                            <div 
                                key={ach.id}
                                className={`
                                    relative p-4 rounded-2xl border transition-all duration-500 flex items-center gap-4 overflow-hidden group/list
                                    ${isUnlocked 
                                        ? 'bg-slate-800/30 border-white/10 hover:bg-slate-800/40 hover:translate-x-1' 
                                        : 'bg-black/10 border-white/5 opacity-50 grayscale'}
                                `}
                            >
                                <div 
                                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ 
                                        backgroundColor: isUnlocked ? `${ach.color}20` : '#0f172a', 
                                        color: isUnlocked ? ach.color : '#334155',
                                        border: isUnlocked ? `1px solid ${ach.color}30` : '1px solid #1e293b'
                                    }}
                                >
                                    {isUnlocked ? <ach.icon size={24} /> : <Lock size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h4 className={`text-sm font-black uppercase tracking-tight leading-none ${isUnlocked ? 'text-white' : 'text-slate-600'}`}>
                                            {ach.title}
                                        </h4>
                                        {isUnlocked && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ach.color }} />}
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium line-clamp-1 group-hover/list:text-slate-300">
                                        {ach.description}
                                    </p>
                                </div>
                                {isUnlocked && (
                                    <div className="hidden sm:flex flex-col items-end shrink-0 pl-4 border-l border-white/5">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Obtenido</span>
                                        <span className="text-[10px] font-bold text-slate-400">{formatDate(unlockInfo.unlockedAt)}</span>
                                    </div>
                                )}
                            </div>
                        );
                     }
                     
                     return (
                         <div 
                            key={ach.id} 
                            className={`
                                relative p-6 rounded-[2.5rem] border transition-all duration-700 flex flex-col gap-5 overflow-hidden group/card
                                ${isUnlocked 
                                    ? 'bg-slate-800/20 border-white/10 hover:border-amber-500/30 hover:bg-slate-800/40 hover:-translate-y-2' 
                                    : 'bg-black/20 border-white/5 opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                                }
                            `}
                            style={{
                                boxShadow: isUnlocked ? `0 20px 40px -15px ${ach.color}20` : 'none'
                            }}
                         >
                            {/* Background Effects for Unlocked */}
                            {isUnlocked && (
                                <>
                                    <div 
                                        className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover/card:opacity-[0.08] transition-opacity duration-700"
                                        style={{ background: `radial-gradient(circle at top right, ${ach.color}, transparent 70%)` }}
                                    />
                                    <div className="absolute inset-0 -translate-x-full group-hover/card:animate-[shimmer_2s_linear] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none z-10" />
                                </>
                            )}

                            <div className="flex items-start gap-5 relative z-20">
                                {/* Icon Box */}
                                <div 
                                    className={`
                                        w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 transition-all duration-700 group-hover/card:scale-110 group-hover/card:rotate-6
                                        relative
                                    `}
                                    style={{ 
                                        backgroundColor: isUnlocked ? `${ach.color}20` : '#0f172a', 
                                        color: isUnlocked ? ach.color : '#334155',
                                        border: isUnlocked ? `1px solid ${ach.color}40` : '1px solid #1e293b'
                                    }}
                                >
                                    {isUnlocked && (
                                        <div 
                                            className="absolute inset-0 blur-xl opacity-40 animate-pulse pointer-events-none"
                                            style={{ backgroundColor: ach.color }}
                                        />
                                    )}
                                    {isUnlocked ? <ach.icon size={32} className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] filter relative z-10" /> : <Lock size={24} className="relative z-10" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-base font-black uppercase tracking-tighter leading-none mb-2 ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                                        {ach.title}
                                    </h4>
                                    <p className="text-xs text-slate-400 font-medium leading-relaxed group-hover/card:text-slate-200 transition-colors line-clamp-3">
                                        {ach.description}
                                    </p>
                                </div>
                            </div>

                            {/* Footer: Date & Status */}
                            {isUnlocked && (
                                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center relative z-20">
                                    <div className="flex items-center gap-2 opacity-60 group-hover/card:opacity-100 transition-opacity">
                                        <CalendarCheck size={14} className="text-slate-400" />
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                            {formatDate(unlockInfo.unlockedAt)}
                                        </span>
                                    </div>
                                    <div 
                                        className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"
                                        style={{ backgroundColor: `${ach.color}20`, color: ach.color, border: `1px solid ${ach.color}30` }}
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_currentColor]" style={{ backgroundColor: ach.color }} />
                                        Completado
                                    </div>
                                </div>
                            )}
                         </div>
                     );
                 }) : (
                     <div className="col-span-full py-24 flex flex-col items-center justify-center text-center gap-6 bg-slate-900/40 rounded-[3.5rem] border border-dashed border-white/5 backdrop-blur-sm shadow-inner shadow-black/20">
                         <div className="p-8 bg-slate-800/80 rounded-full text-slate-700 shadow-xl border border-white/5 relative group">
                             <div className="absolute inset-0 bg-amber-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                             <Trophy size={64} className="opacity-10 translate-y-1 relative z-10" />
                         </div>
                         <div className="max-w-xs">
                             <h3 className="text-slate-400 font-black uppercase tracking-tighter text-2xl mb-2">Desierto de Trofeos</h3>
                             <p className="text-slate-600 text-sm font-medium leading-relaxed">No hemos encontrado ningún logro que coincida con tu criterio de búsqueda.</p>
                         </div>
                         <button 
                            onClick={() => { setSearchQuery(''); setFilterBy('all'); }}
                            className="mt-4 px-8 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-slate-400 rounded-full text-xs font-black uppercase tracking-[0.2em] hover:from-amber-500 hover:to-amber-600 hover:text-white transition-all transform hover:scale-105 shadow-lg active:scale-95 border border-white/5"
                         >
                             Resetear Bóveda
                         </button>
                     </div>
                 )}
            </div>
        </div>
    );
};

export default memo(AchievementsList);
