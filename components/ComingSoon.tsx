
import React from 'react';

interface ComingSoonProps {
  pageName: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ pageName }) => {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-6">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">{pageName}</h2>
      <p className="text-slate-500 text-center max-w-sm">
        We're currently building the {pageName.toLowerCase()} experience. Check back soon for interactive features.
      </p>
      <div className="mt-8 flex gap-3">
        <div className="px-3 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-400 uppercase tracking-widest">v0.1 Alpha</div>
      </div>
    </div>
  );
};

export default ComingSoon;
