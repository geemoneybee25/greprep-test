import React from 'react';
import { Skill, SkillStatus } from '../types';

interface SkillCardProps {
  skill: Skill;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill }) => {
  const getStatusStyles = (status: SkillStatus) => {
    switch (status) {
      case SkillStatus.MASTERED:
        return 'bg-green-100 text-green-700 border-green-200';
      case SkillStatus.LEARNING:
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case SkillStatus.NOT_READY:
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const getProgressColor = (status: SkillStatus) => {
    switch (status) {
      case SkillStatus.MASTERED: return 'bg-green-500';
      case SkillStatus.LEARNING: return 'bg-amber-500';
      case SkillStatus.NOT_READY: return 'bg-slate-300';
    }
  };

  const getMasteryLabel = (p: number, status: SkillStatus) => {
    if (status === SkillStatus.MASTERED) return 'Complete';
    if (status === SkillStatus.NOT_READY) return 'Not Ready';
    if (p < 0.55) return 'Foundations';
    if (p < 0.75) return 'Proficient';
    return 'Advanced';
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never practiced';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyles(skill.status)}`}>
            {skill.status === SkillStatus.NOT_READY ? 'NOT READY' : skill.status}
          </span>
          <span className="text-slate-400 text-xs font-medium">#{skill.id.split('-').pop()}</span>
        </div>
        <h3 className="text-slate-800 font-semibold leading-tight mb-4">{skill.name}</h3>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500 font-medium">Mastery Level</span>
          <span className="text-xs font-bold text-slate-800">{getMasteryLabel(skill.pMastery, skill.status)}</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div 
            className={`h-full ${getProgressColor(skill.status)} transition-all duration-500`} 
            style={{ width: `${skill.pMastery * 100}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-[11px]">
          <div className="text-slate-400">
            Attempts: <span className="text-slate-600 font-medium">{skill.attempts}</span>
          </div>
          <div className="text-slate-400">
            {formatDate(skill.lastPracticed)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillCard;