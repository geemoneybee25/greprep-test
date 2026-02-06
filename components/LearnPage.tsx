import React, { useState, useMemo } from 'react';
import { Skill, Domain } from '../types';

interface LearnPageProps {
  skills: Skill[];
  onTabChange: (tab: 'Study Plan') => void;
  onSelectPracticeSkill: (skillId: string) => void;
  activeLessonId: string | null;
  setActiveLessonId: (id: string | null) => void;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string) => void;
}

type FilterType = 'All' | 'Saved' | Domain;

const LearnPage: React.FC<LearnPageProps> = ({ 
  skills, 
  onTabChange, 
  activeLessonId, 
  setActiveLessonId,
  bookmarkedIds,
  onToggleBookmark
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  const filteredSkills = useMemo(() => {
    const baseFiltered = skills.filter(skill => {
      const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            skill.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesFilter = true;
      if (activeFilter === 'Saved') {
        matchesFilter = bookmarkedIds.has(skill.id);
      } else if (activeFilter === Domain.QUANT) {
        matchesFilter = skill.domain === Domain.QUANT;
      } else if (activeFilter === Domain.VERBAL) {
        matchesFilter = skill.domain === Domain.VERBAL;
      }

      return matchesSearch && matchesFilter;
    });

    if (activeFilter === 'All' || activeFilter === 'Saved') {
      const quantItems = baseFiltered.filter(s => s.domain === Domain.QUANT);
      const verbalItems = baseFiltered.filter(s => s.domain === Domain.VERBAL);
      
      const interleaved: Skill[] = [];
      const maxLength = Math.max(quantItems.length, verbalItems.length);
      
      for (let i = 0; i < maxLength; i++) {
        if (quantItems[i]) interleaved.push(quantItems[i]);
        if (verbalItems[i]) interleaved.push(verbalItems[i]);
      }
      
      return interleaved;
    }

    return baseFiltered;
  }, [skills, searchTerm, activeFilter, bookmarkedIds]);

  const handleStartLesson = (skillId: string) => {
    setActiveLessonId(skillId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filterTabs: { label: string; value: FilterType; icon?: React.ReactNode }[] = [
    { label: 'All Lessons', value: 'All' },
    { label: 'Quantitative', value: Domain.QUANT },
    { label: 'Verbal', value: Domain.VERBAL },
    { 
      label: 'Saved', 
      value: 'Saved',
      icon: (
        <svg className={`w-3.5 h-3.5 ${activeFilter === 'Saved' ? 'fill-current' : 'fill-none stroke-current'}`} strokeWidth={2.5} viewBox="0 0 24 24">
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
        </svg>
      )
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 animate-in fade-in duration-700">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Content Library</h1>
        <p className="text-slate-700 font-medium text-lg leading-relaxed max-w-2xl">
          Explore our complete collection of adaptive GRE lessons. Save units for later review or search for specific topics to strengthen your foundations.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-16 pb-4 border-b border-slate-200/60">
        <div className="flex flex-wrap items-center gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeFilter === tab.value 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.value === 'Saved' && ` (${bookmarkedIds.size})`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text"
            placeholder="Search library..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 transition-all placeholder:text-slate-500 shadow-sm"
          />
        </div>
      </div>

      <div className="min-h-[400px]">
        {filteredSkills.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="text-7xl mb-8">🔖</div>
            <h3 className="text-2xl font-black text-slate-900">
              {activeFilter === 'Saved' ? "Your collection is empty" : "No results found"}
            </h3>
            <p className="text-slate-600 mt-3 font-medium text-lg">
              {activeFilter === 'Saved' 
                ? "Click the bookmark icon on any lesson to save it for later review." 
                : "Try adjusting your filters or search query."}
            </p>
            <button 
              onClick={() => { setSearchTerm(''); setActiveFilter('All'); }}
              className="mt-10 bg-slate-200 text-slate-700 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-300 transition-all"
            >
              Back to Library
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredSkills.map((skill) => (
              <div 
                key={skill.id} 
                className="group bg-white rounded-[2.5rem] border border-slate-200 p-8 transition-all hover:shadow-2xl hover:shadow-slate-200/80 hover:-translate-y-1 hover:border-slate-400 flex flex-col cursor-default relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] ${
                    skill.domain === Domain.QUANT ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {skill.domain === Domain.QUANT ? 'Quant' : 'Verbal'}
                  </div>
                  <button 
                    onClick={() => onToggleBookmark(skill.id)}
                    className={`p-2 rounded-xl transition-all ${
                      bookmarkedIds.has(skill.id) 
                        ? 'bg-rose-50 text-rose-600' 
                        : 'bg-slate-50 text-slate-400 hover:text-slate-600'
                    }`}
                    title={bookmarkedIds.has(skill.id) ? "Remove from saved" : "Save for later"}
                  >
                    <svg className={`w-5 h-5 ${bookmarkedIds.has(skill.id) ? 'fill-current' : 'fill-none stroke-current'}`} strokeWidth={2.5} viewBox="0 0 24 24">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
                    </svg>
                  </button>
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-8 leading-tight group-hover:text-blue-700 transition-colors h-14 overflow-hidden text-ellipsis">
                  {skill.name}
                </h3>
                
                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">
                      Estimated Duration
                    </span>
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {Math.floor(Math.random() * 5) + 12}m
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleStartLesson(skill.id)}
                    className="px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200"
                  >
                    Learn
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-32 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[4rem] p-16 text-white relative overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 p-16 opacity-10 pointer-events-none text-white">
          <svg className="w-96 h-96" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
          </svg>
        </div>
        <div className="relative z-10 flex flex-col xl:flex-row items-center gap-16 text-center xl:text-left">
          <div className="flex-1">
            <span className="inline-block px-4 py-1.5 bg-blue-500/30 text-blue-200 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-blue-400/40">
              Skill Management
            </span>
            <h3 className="text-4xl md:text-5xl font-black mb-6 leading-[1.1] tracking-tighter text-white">Everything in one place.</h3>
            <p className="text-slate-300 text-xl font-medium leading-relaxed max-w-2xl">
              Focus on any section or review your saved items. This library adapts to your current goals, helping you find exactly what you need to improve your GRE score without the noise.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <button 
              onClick={() => onTabChange('Study Plan')}
              className="bg-white text-slate-900 px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl"
            >
              Resume Study Plan
            </button>
            <button 
              onClick={() => { setActiveFilter('Saved'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="bg-slate-800 border border-slate-600 text-white px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all hover:bg-slate-700"
            >
              View Saved ({bookmarkedIds.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnPage;