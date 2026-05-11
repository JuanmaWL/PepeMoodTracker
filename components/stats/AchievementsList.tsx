
import React, { memo, useMemo, useState } from 'react';
import { Lock, CalendarCheck, Search, Filter, ArrowUpDown, Check, X, Trophy, ChevronDown, LayoutGrid, List, LayoutPanelTop } from 'lucide-react';
import { ACHIEVEMENTS } from '../../utils/gamification';
import { UnlockedAchievement, Rarity } from '../../types';

const RARITY_ORDER = {
    [Rarity.Legendary]: 4,
    [Rarity.Epic]: 3,
    [Rarity.Rare]: 2,
    [Rarity.Common]: 1
};

const TRANSLATED_RARITIES = {
    [Rarity.Legendary]: 'Legendario',
    [Rarity.Epic]: 'Épico',
    [Rarity.Rare]: 'Raro',
    [Rarity.Common]: 'Común'
};

interface AchievementsListProps {
  unlockedItems: UnlockedAchievement[];
}

type SortOption = 'date' | 'alpha' | 'id';
type FilterOption = 'all' | 'unlocked' | 'locked';
type ViewMode = 'list' | 'compact';

const AchievementsList: React.FC<AchievementsListProps> = ({ unlockedItems }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterBy, setFilterBy] = useState<FilterOption>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('list');
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
        const sorted = items.sort((a, b) => {
            const unlockA = unlockedItems.find(u => u.id === a.id);
            const unlockB = unlockedItems.find(u => u.id === b.id);
            
            let result = 0;
            if (sortBy === 'date') {
                if (unlockA && unlockB) result = unlockA.unlockedAt - unlockB.unlockedAt;
                else if (unlockA && !unlockB) result = 1;
                else if (!unlockA && unlockB) result = -1;
                else result = 0;
            } else if (sortBy === 'alpha') {
                result = b.title.localeCompare(a.title);
            } else {
                // Rarity Sort
                const rareA = RARITY_ORDER[a.rarity || Rarity.Common];
                const rareB = RARITY_ORDER[b.rarity || Rarity.Common];
                result = rareA - rareB;
            }
            
            return sortOrder === 'desc' ? -result : result;
        });

        return sorted;
    }, [unlockedItems, searchQuery, sortBy, filterBy, sortOrder]);

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
                        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 flex-1 shadow-inner relative overflow-hidden group/filter">
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
                            {(['all', 'unlocked', 'locked'] as FilterOption[]).map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => setFilterBy(opt)}
                                    className={`
                                        flex-1 px-1.5 md:px-2 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative z-10
                                        ${filterBy === opt 
                                            ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg' 
                                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
                                    `}
                                >
                                    {opt === 'all' ? 'Todos' : opt === 'unlocked' ? 'Conseguidos' : 'Bloqueados'}
                                </button>
                            ))}
                        </div>

                        {/* Sort Logic */}
                        <div className="flex gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                            <div className="flex flex-1">
                                {(['date', 'alpha', 'id'] as SortOption[]).map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => {
                                            if (sortBy === opt) {
                                                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                            } else {
                                                setSortBy(opt);
                                                setSortOrder('desc');
                                            }
                                        }}
                                        className={`
                                            flex-1 px-2 md:px-4 py-2.5 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5 md:gap-2
                                            ${sortBy === opt 
                                                ? 'bg-slate-800 text-amber-400 shadow-md border border-white/10 ring-1 ring-white/5 scale-[1.02]' 
                                                : 'text-slate-600 hover:text-slate-400 hover:bg-white/5'}
                                        `}
                                    >
                                        {opt === 'date' && <CalendarCheck size={14} />}
                                        {opt === 'alpha' && <ArrowUpDown size={14} />}
                                        {opt === 'id' && <Trophy size={14} />}
                                        
                                        <span className="ml-1">
                                            {opt === 'date' 
                                                ? (sortOrder === 'desc' ? 'Nuevos' : 'Viejos') 
                                                : opt === 'alpha' 
                                                    ? (sortOrder === 'desc' ? 'z-a' : 'a-z') 
                                                    : (sortOrder === 'desc' ? 'Rareza' : 'Rareza')}
                                        </span>

                                        {sortBy === opt && (
                                            <div className={`ml-1 transition-transform duration-300 ${sortOrder === 'asc' ? '' : 'rotate-180'}`}>
                                                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ACHIEVEMENTS LIST/COMPACT */}
            <div className={`
                pb-20 mt-1 transition-all duration-500
                ${viewMode === 'list' 
                    ? 'flex flex-col gap-3 md:gap-4' 
                    : 'grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4'}
            `}>
                 {processedAchievements.length > 0 ? processedAchievements.map((ach) => {
                     const unlockInfo = unlockedItems.find(u => u.id === ach.id);
                     const isUnlocked = !!unlockInfo;
                     const rarityName = TRANSLATED_RARITIES[ach.rarity || Rarity.Common].toUpperCase();
                     
                     if (viewMode === 'compact') {
                        return (
                            <div 
                                key={ach.id}
                                className={`
                                    aspect-[4/5] rounded-3xl border flex flex-col items-center justify-between p-4 group/compact transition-all duration-300 relative overflow-hidden active:scale-95 touch-manipulation
                                    ${isUnlocked 
                                        ? 'bg-slate-800/40 border-white/10 hover:bg-slate-800/60 shadow-xl' 
                                        : 'bg-black/20 border-white/5 opacity-40 grayscale'}
                                `}
                                style={{
                                    boxShadow: isUnlocked ? `0 12px 24px -10px ${ach.color}40` : 'none',
                                    borderColor: isUnlocked ? `${ach.color}30` : ''
                                }}
                            >
                                <div className="mt-2 p-3 md:p-4 rounded-2xl transition-transform duration-500 group-hover/compact:rotate-12 group-active/compact:scale-110" style={{ color: isUnlocked ? ach.color : '#334155', backgroundColor: isUnlocked ? `${ach.color}15` : 'transparent' }}>
                                    {isUnlocked ? <ach.icon className="size-10 md:size-12" /> : <Lock className="size-8 md:size-10" />}
                                </div>

                                <div className="text-center w-full mt-auto">
                                    <span className={`block text-[11px] md:text-sm font-black text-white uppercase tracking-tighter leading-tight mb-1 line-clamp-2 px-1 ${isUnlocked ? '' : 'text-slate-500'}`}>
                                        {ach.title}
                                    </span>
                                    {isUnlocked && (
                                        <div className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest inline-block mb-1" style={{ backgroundColor: `${ach.color}20`, color: ach.color }}>
                                            {rarityName}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Full info on mobile Hover overlay */}
                                <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-4 text-center opacity-0 group-hover/compact:opacity-100 transition-opacity duration-300 pointer-events-none backdrop-blur-md">
                                    <span className="text-sm font-black text-white uppercase tracking-tight mb-2">{ach.title}</span>
                                    <p className="text-[11px] text-slate-400 font-medium leading-tight mb-3">{ach.description}</p>
                                    {isUnlocked && (
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-2 border-t border-white/10">
                                            {formatDate(unlockInfo.unlockedAt)}
                                        </div>
                                    )}
                                </div>
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
                                        ? 'bg-slate-800/30 border-white/10 hover:bg-slate-800/40 hover:translate-x-1 shadow-lg' 
                                        : 'bg-black/10 border-white/5 opacity-50 grayscale'}
                                `}
                            >
                                <div 
                                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
                                    style={{ 
                                        backgroundColor: isUnlocked ? `${ach.color}20` : '#0f172a', 
                                        color: isUnlocked ? ach.color : '#334155',
                                        border: isUnlocked ? `1px solid ${ach.color}30` : '1px solid #1e293b'
                                    }}
                                >
                                    {isUnlocked ? <ach.icon size={28} /> : <Lock size={22} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className={`text-sm md:text-base font-black uppercase tracking-tight leading-none ${isUnlocked ? 'text-white' : 'text-slate-600'}`}>
                                            {ach.title}
                                        </h4>
                                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border" style={{ backgroundColor: isUnlocked ? `${ach.color}10` : 'transparent', color: isUnlocked ? ach.color : '#334155', borderColor: isUnlocked ? `${ach.color}20` : '#1e293b' }}>
                                            {rarityName}
                                        </span>
                                    </div>
                                    <p className="text-[10px] md:text-xs text-slate-500 font-medium group-hover/list:text-slate-300">
                                        {ach.description}
                                    </p>
                                </div>
                                {isUnlocked && (
                                    <div className="flex flex-col items-end shrink-0 pl-3 md:pl-4 border-l border-white/5">
                                        <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Obtenido</span>
                                        <span className="text-[9px] md:text-[10px] font-bold text-slate-400 whitespace-nowrap">{formatDate(unlockInfo.unlockedAt)}</span>
                                    </div>
                                )}
                            </div>
                        );
                     }
                     return null;
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
