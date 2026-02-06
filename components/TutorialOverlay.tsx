import React, { useEffect, useState, useMemo } from 'react';

export interface TutorialStep {
  targetId: string;
  title: string;
  description: string;
  tab?: 'Content Library' | 'Study Plan' | 'Tests' | 'Analytics';
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface TutorialOverlayProps {
  currentStep: number;
  totalSteps: number;
  stepData: TutorialStep;
  onNext: () => void;
  onSkip: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ currentStep, totalSteps, stepData, onNext, onSkip }) => {
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number; opacity: number }>({
    top: 0, left: 0, width: 0, height: 0, opacity: 0
  });

  useEffect(() => {
    const updateCoords = () => {
      if (stepData.position === 'center') {
        setCoords({ top: window.innerHeight / 2, left: window.innerWidth / 2, width: 0, height: 0, opacity: 0 });
        return;
      }

      const el = document.getElementById(stepData.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setCoords({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          opacity: 1
        });
      }
    };

    updateCoords();
    window.addEventListener('resize', updateCoords);
    // Add a small delay to allow tab transitions to complete
    const timeout = setTimeout(updateCoords, 100);

    return () => {
      window.removeEventListener('resize', updateCoords);
      clearTimeout(timeout);
    };
  }, [stepData, currentStep]);

  const tooltipStyle = useMemo(() => {
    if (stepData.position === 'center') {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const gap = 20;
    switch (stepData.position) {
      case 'bottom':
        return { top: coords.top + coords.height + gap, left: coords.left + coords.width / 2, transform: 'translateX(-50%)' };
      case 'top':
        return { top: coords.top - gap, left: coords.left + coords.width / 2, transform: 'translate(-50%, -100%)' };
      case 'right':
        return { top: coords.top + coords.height / 2, left: coords.left + coords.width + gap, transform: 'translateY(-50%)' };
      case 'left':
        return { top: coords.top + coords.height / 2, left: coords.left - gap, transform: 'translate(-100%, -50%)' };
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  }, [coords, stepData.position]);

  return (
    <div className="fixed inset-0 z-[1000] overflow-hidden pointer-events-none">
      {/* Background Mask */}
      <div 
        className="absolute inset-0 bg-slate-900/80 transition-all duration-500 pointer-events-auto"
        style={{
          maskImage: stepData.position === 'center' ? 'none' : `radial-gradient(circle ${Math.max(coords.width, coords.height) / 1.5 + 40}px at ${coords.left + coords.width/2}px ${coords.top + coords.height/2}px, transparent 99%, black 100%)`,
          WebkitMaskImage: stepData.position === 'center' ? 'none' : `radial-gradient(circle ${Math.max(coords.width, coords.height) / 1.5 + 40}px at ${coords.left + coords.width/2}px ${coords.top + coords.height/2}px, transparent 99%, black 100%)`,
        }}
      />

      {/* Tooltip Content */}
      <div 
        className="absolute w-[320px] bg-white rounded-3xl shadow-2xl p-6 pointer-events-auto transition-all duration-500 ease-out border border-slate-200"
        style={tooltipStyle}
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <button onClick={onSkip} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">{stepData.title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-6 font-medium">{stepData.description}</p>
        
        <div className="flex items-center justify-between">
          <button 
            onClick={onSkip}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
          >
            Skip Intro
          </button>
          <button 
            onClick={onNext}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all"
          >
            {currentStep === totalSteps - 1 ? 'Finish Tour' : 'Got it, Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;