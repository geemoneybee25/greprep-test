
import React from 'react';

interface DiagnosticLandingProps {
  onBack: () => void;
  onSimulate: () => void;
}

const DiagnosticLanding: React.FC<DiagnosticLandingProps> = ({ onBack, onSimulate }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-10 transition-all group"
      >
        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Study Plan
      </button>

      <div className="bg-white rounded-[3.5rem] border border-slate-200 overflow-hidden shadow-2xl">
        <div className="bg-slate-950 p-12 md:p-16 text-white relative">
          <div className="relative z-10">
            <span className="inline-block px-4 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-blue-500/30">
              Adaptive Simulation
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">Full-Length Diagnostic</h1>
          </div>
        </div>

        <div className="p-12 md:p-16 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="flex flex-col items-center text-center p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1">
              <span className="text-3xl mb-4">⏱️</span>
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Duration</h4>
              <p className="text-xl font-black text-slate-900">134 Minutes</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1">
              <span className="text-3xl mb-4">📝</span>
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Questions</h4>
              <p className="text-xl font-black text-slate-900">98 Items</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1">
              <span className="text-3xl mb-4">🔄</span>
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Format</h4>
              <p className="text-xl font-black text-slate-900">Adaptive Digital</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={onSimulate}
              className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-lg uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-slate-200"
            >
              Simulate Diagnostic Results
            </button>
            <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
              Instant analysis & study plan calibration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticLanding;
