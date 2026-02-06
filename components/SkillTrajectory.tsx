import React, { useState } from 'react';
import { SkillStatus, MasterySummary, Domain } from '../types';

interface SkillTrajectoryProps {
  stats: MasterySummary;
  activeZone: SkillStatus | null;
  onZoneClick: (zone: SkillStatus) => void;
  startingScore: number;
  projectedScore: number;
  activeDomain: Domain;
  onDomainChange: (domain: Domain) => void;
}

const SkillTrajectory: React.FC<SkillTrajectoryProps> = ({ 
  stats, 
  activeZone, 
  onZoneClick, 
  startingScore, 
  projectedScore,
  activeDomain,
  onDomainChange
}) => {
  const [hoveredZone, setHoveredZone] = useState<SkillStatus | null>(null);
  
  // Determine current active context for highlighting groups
  const effectiveActiveZone = hoveredZone || activeZone;

  const totalSkills = stats.total || 1; // Prevent division by zero
  const masteredPct = (stats.mastered / totalSkills) * 100;
  const learningPct = (stats.learning / totalSkills) * 100;
  const lockedPct = (stats.locked / totalSkills) * 100;

  return (
    <div className="w-full pb-4" id="tutorial-bullseye">
      <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-200 shadow-sm relative overflow-hidden">
        
        {/* Domain Toggle: Top Center */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => onDomainChange(Domain.QUANT)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeDomain === Domain.QUANT 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Quant Reasoning
            </button>
            <button
              onClick={() => onDomainChange(Domain.VERBAL)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeDomain === Domain.VERBAL 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Verbal Reasoning
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-between gap-8 md:gap-16 mb-8">
          {/* Departure Point: Baseline Score */}
          <div 
            className="flex flex-col cursor-pointer shrink-0 transition-all duration-300 hover:scale-105"
            onClick={() => onZoneClick(SkillStatus.MASTERED)}
          >
            <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">Baseline</span>
            <span className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900">
              {startingScore}
            </span>
          </div>

          {/* Segmented Bar Visualization */}
          <div className="flex-1 flex flex-col justify-center gap-3">
             <div className="flex h-6 w-full bg-slate-100 rounded-full items-center overflow-hidden border border-slate-200">
                <div 
                  className="h-full bg-green-500 transition-all duration-700 cursor-pointer"
                  style={{ width: `${masteredPct}%` }}
                  onMouseEnter={() => setHoveredZone(SkillStatus.MASTERED)}
                  onMouseLeave={() => setHoveredZone(null)}
                  onClick={() => onZoneClick(SkillStatus.MASTERED)}
                />
                <div 
                  className="h-full bg-amber-400 transition-all duration-700 cursor-pointer"
                  style={{ width: `${learningPct}%` }}
                  onMouseEnter={() => setHoveredZone(SkillStatus.LEARNING)}
                  onMouseLeave={() => setHoveredZone(null)}
                  onClick={() => onZoneClick(SkillStatus.LEARNING)}
                />
                <div 
                  className="h-full bg-slate-400 transition-all duration-700 cursor-pointer"
                  style={{ width: `${lockedPct}%` }}
                  onMouseEnter={() => setHoveredZone(SkillStatus.NOT_READY)}
                  onMouseLeave={() => setHoveredZone(null)}
                  onClick={() => onZoneClick(SkillStatus.NOT_READY)}
                />
             </div>
          </div>

          {/* Arrival Point: Projected Score */}
          <div 
            className="flex flex-col items-end cursor-pointer shrink-0 transition-all duration-300 hover:scale-105"
            onClick={() => onZoneClick(SkillStatus.NOT_READY)}
          >
            <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">Projected</span>
            <span className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900">
              {projectedScore}
            </span>
          </div>
        </div>

        {/* Legend / Status Footer - Updated to Segmented Button Group Style */}
        <div className="flex justify-center">
          <div className="bg-slate-100 p-1 rounded-2xl flex w-full max-w-2xl">
            <button 
              onMouseEnter={() => setHoveredZone(SkillStatus.MASTERED)}
              onMouseLeave={() => setHoveredZone(null)}
              onClick={() => onZoneClick(SkillStatus.MASTERED)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                effectiveActiveZone === SkillStatus.MASTERED 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Mastered ({stats.mastered})
            </button>
            <button 
              onMouseEnter={() => setHoveredZone(SkillStatus.LEARNING)}
              onMouseLeave={() => setHoveredZone(null)}
              onClick={() => onZoneClick(SkillStatus.LEARNING)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                effectiveActiveZone === SkillStatus.LEARNING 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              Learning ({stats.learning})
            </button>
            <button 
              onMouseEnter={() => setHoveredZone(SkillStatus.NOT_READY)}
              onMouseLeave={() => setHoveredZone(null)}
              onClick={() => onZoneClick(SkillStatus.NOT_READY)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                effectiveActiveZone === SkillStatus.NOT_READY 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-slate-400" />
              Not Ready ({stats.locked})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillTrajectory;