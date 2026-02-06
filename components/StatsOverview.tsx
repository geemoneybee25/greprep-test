import React from 'react';
import { MasterySummary } from '../types';

interface StatsOverviewProps {
  stats: MasterySummary;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Skills</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <p className="text-green-600 text-sm font-medium uppercase tracking-wider">Mastered</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">{stats.mastered}</p>
        <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
          <div 
            className="bg-green-500 h-full" 
            style={{ width: `${(stats.mastered / stats.total) * 100}%` }}
          />
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <p className="text-amber-600 text-sm font-medium uppercase tracking-wider">Learning</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">{stats.learning}</p>
        <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
          <div 
            className="bg-amber-500 h-full" 
            style={{ width: `${(stats.learning / stats.total) * 100}%` }}
          />
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Not Ready</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">{stats.locked}</p>
        <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
          <div 
            className="bg-slate-300 h-full" 
            style={{ width: `${(stats.locked / stats.total) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;