import React from 'react';
import { Skill, SkillStatus } from '../types';
import MathText from './MathText';

interface SkillDetailProps {
  skill: Skill;
  onBack: () => void;
  onStartPractice: (skillId: string) => void;
  backLabel?: string;
}

const SkillDetail: React.FC<SkillDetailProps> = ({ 
  skill, 
  onBack, 
  onStartPractice, 
  backLabel = "Back to Index" 
}) => {
  const getMasteryLabel = (p: number, status: SkillStatus) => {
    if (status === SkillStatus.MASTERED) return 'Mastered';
    if (status === SkillStatus.NOT_READY) return 'Locked';
    return 'Learning';
  };

  return (
    <div className="max-w-6xl mx-auto py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-slate-50">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          {backLabel}
        </button>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
            skill.status === SkillStatus.LEARNING ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-100 text-slate-500'
          }`}>
            {getMasteryLabel(skill.pMastery, skill.status)}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Skill ID: {skill.id}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <section>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">{skill.name}</h1>
            <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-2xl">
              Understanding complex relationships and logic is foundational to GRE success. 
              In this unit, we explore how to analyze core concepts and apply them in high-pressure testing contexts.
            </p>
          </section>

          <section className="relative group">
            <div className="aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center transition-transform group-hover:scale-110 cursor-pointer border border-white/20">
                  <svg className="w-8 h-8 text-white fill-current ml-1" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              
              <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 w-1/3" />
                    </div>
                    <span className="text-[10px] font-bold text-white/60">04:12 / 12:45</span>
                 </div>
                 <div className="flex justify-between items-center text-white/60 text-[10px] font-black uppercase tracking-widest">
                    <div className="flex gap-4">
                       <span className="text-white">Chapter 1: Core Concepts</span>
                       <span className="opacity-40">Chapter 2: Comparison Strategies</span>
                    </div>
                    <span>1080p HD</span>
                 </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Knowledge Primers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                 <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold mb-4">
                    <MathText text="$x$" />
                 </div>
                 <h3 className="font-bold text-slate-800 mb-2">Quant Relationships</h3>
                 <div className="text-sm text-slate-500 leading-relaxed mb-4">
                    <MathText text="$$A > B$$" />
                 </div>
                 <ul className="text-xs space-y-2 text-slate-600 font-medium">
                   <li>• Analyze the relationship between two quantities</li>
                   <li>• Identify constraints that determine equality or inequality</li>
                 </ul>
              </div>
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                 <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold mb-4">
                    <MathText text="$\\text{TC}$" />
                 </div>
                 <h3 className="font-bold text-slate-800 mb-2">Verbal Context</h3>
                 <div className="text-sm text-slate-500 leading-relaxed mb-4">
                    <MathText text="$$\\text{Context} \\rightarrow \\text{Vocabulary}$$" />
                 </div>
                 <ul className="text-xs space-y-2 text-slate-600 font-medium">
                   <li>• Use structural clues to identify missing meaning</li>
                   <li>• Select vocabulary that maintains logical coherence</li>
                 </ul>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 overflow-hidden pointer-events-none">
                 <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
              </div>
              
              <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">Current Progress</h3>
              <div className="mb-8">
                <span className="text-5xl font-black">{Math.round(skill.pMastery * 100)}%</span>
                <span className="text-slate-500 font-bold ml-2">Mastery</span>
              </div>
              
              <div className="space-y-6">
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-amber-400" style={{ width: `${skill.pMastery * 100}%` }} />
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed">
                  Based on your performance, our model estimates a {Math.round(skill.pMastery * 100)}% probability you've learned this skill. You need $85\%$ to master it{' '}
                  <span className="relative group inline-block">
                    <span className="text-amber-400 font-bold underline decoration-amber-400/30 underline-offset-4 cursor-help transition-all hover:text-amber-300">
                      How is this calculated?
                    </span>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-4 bg-white text-slate-600 text-[11px] font-medium leading-relaxed rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 border border-slate-200 text-left">
                      We track every problem you attempt—whether you got it right, how many hints you used, and how difficult it was. A proven statistical model (Bayesian Knowledge Tracing) estimates your probability of having mastered this skill. The more you practice, the more accurate this estimate becomes.
                      <span className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white"></span>
                    </span>
                  </span>.
                </p>

                <button 
                  onClick={() => onStartPractice(skill.id)}
                  className="w-full bg-amber-400 text-slate-900 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-300 transition-all active:scale-95 shadow-xl shadow-amber-900/40"
                >
                  Start Focused Practice
                </button>
              </div>
           </div>

           <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
              <h3 className="text-slate-900 font-black text-sm uppercase tracking-widest mb-6">Related Lessons</h3>
              <div className="space-y-4">
                 {[
                   { name: 'Quant Strategy: Backsolving', duration: '14:20', type: 'VIDEO' },
                   { name: 'Sentence Equivalence Clues', duration: '08:45', type: 'VIDEO' },
                   { name: 'Data Interpretation Review', duration: '12:10', type: 'VIDEO' }
                 ].map((lesson) => (
                    <div key={lesson.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 cursor-pointer transition-colors group">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg flex items-center justify-center">
                             <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                             </svg>
                          </div>
                          <div>
                             <p className="text-xs font-bold text-slate-800">{lesson.name}</p>
                             <p className="text-[10px] text-slate-400 font-bold">{lesson.duration}</p>
                          </div>
                       </div>
                       <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-slate-400 transition-colors">
                          <svg className="w-3 h-3 text-slate-400 group-hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7-7" />
                          </svg>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SkillDetail;