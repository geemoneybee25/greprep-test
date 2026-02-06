import React, { useState, useMemo } from 'react';

interface OnboardingSurveyProps {
  onComplete: () => void;
}

const BellCurveSection: React.FC<{
  selectedRange: string;
  onSelect: (range: string) => void;
}> = ({ selectedRange, onSelect }) => {
  const [hoveredRange, setHoveredRange] = useState<string | null>(null);

  // Math constants for the curve
  const width = 400;
  const height = 120;
  const mean = width / 2;
  const sigma = 75; // Fatter curve
  const amplitude = 100; // Peak height in pixels

  // Generate 101 points for a high-fidelity smooth path
  const curvePoints = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i <= 100; i++) {
      const x = (i / 100) * width;
      // Normal distribution PDF: f(x) = e^(-(x-mu)^2 / (2*sigma^2))
      // Scaled to fit our amplitude and baseline
      const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(sigma, 2));
      const y = height - 5 - amplitude * Math.exp(exponent);
      points.push({ x, y });
    }
    return points;
  }, [width, height, mean, sigma, amplitude]);

  const bellPath = useMemo(() => {
    return `M ${curvePoints[0].x},${curvePoints[0].y} ` + 
      curvePoints.slice(1).map(p => `L ${p.x},${p.y}`).join(' ');
  }, [curvePoints]);

  // Updated granularity for GRE: 260-340 range.
  const ranges = [
    { id: 'p50', label: '260 - 300', percentile: '50th & Below', startX: 0, endX: 200 },
    { id: 'p65', label: '300 - 310', percentile: '50th - 65th', startX: 200, endX: 240 },
    { id: 'p80', label: '310 - 320', percentile: '65th - 80th', startX: 240, endX: 280 },
    { id: 'p90', label: '320 - 330', percentile: '80th - 90th', startX: 280, endX: 320 },
    { id: 'p95', label: '330 - 335', percentile: '90th - 95th', startX: 320, endX: 360 },
    { id: 'p99', label: '335 - 340', percentile: '95th - 99th+', startX: 360, endX: 400 },
  ];

  const activeRange = ranges.find(r => r.label === (hoveredRange || selectedRange)) || null;

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Set Your Target Score</h3>
      <p className="text-slate-500 text-sm mb-12 font-medium">Calibrate the adaptive engine by choosing your goal range.</p>
      
      <div className="relative mb-12 px-4">
        {/* Floating Tooltip snappy following the mouse logic based on region */}
        <div 
          className="absolute z-20 pointer-events-none transition-all duration-300 ease-out"
          style={{ 
            opacity: activeRange ? 1 : 0,
            left: activeRange ? `${(activeRange.startX + activeRange.endX) / 2 / 4}%` : '50%',
            top: '0px',
            transform: 'translate(-50%, -100%)'
          }}
        >
          {activeRange && (
            <div className="bg-slate-900 rounded-2xl p-4 shadow-2xl relative min-w-[200px] text-center border border-white/10">
              <span className="block text-[8px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Target Range</span>
              <span className="block text-xl font-black text-white">{activeRange.label}</span>
              <span className="block text-[9px] font-bold text-slate-400 mt-1">{activeRange.percentile} Percentile</span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
            </div>
          )}
        </div>

        <svg viewBox="0 0 400 120" className="w-full h-auto overflow-visible cursor-pointer drop-shadow-sm">
          <defs>
            <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
            {ranges.map(r => (
              <clipPath id={`clip-${r.id}`} key={r.id}>
                <rect x={r.startX} y="0" width={r.endX - r.startX} height="120" />
              </clipPath>
            ))}
          </defs>

          {/* Static x-axis line */}
          <line x1="0" y1="118" x2="400" y2="118" stroke="#e2e8f0" strokeWidth="1" />

          {/* Main curve background fill */}
          <path d={`${bellPath} L 400,120 L 0,120 Z`} fill="url(#emeraldGradient)" />
          
          {/* Active section highlight fill */}
          {ranges.map(r => (
            <path
              key={r.id}
              d={`${bellPath} L 400,120 L 0,120 Z`}
              fill="#10b981"
              className="transition-opacity duration-300"
              style={{ 
                opacity: selectedRange === r.label ? 0.35 : (hoveredRange === r.label ? 0.2 : 0),
                clipPath: `url(#clip-${r.id})`
              }}
            />
          ))}

          {/* The main high-fidelity emerald curve line */}
          <path 
            d={bellPath} 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="transition-all duration-500"
          />

          {/* Vertical separators for visual granularity */}
          {ranges.map((r, i) => i > 0 && (
            <line 
              key={`sep-${r.id}`} 
              x1={r.startX} y1="118" x2={r.startX} y2="114" 
              stroke="#e2e8f0" strokeWidth="1" 
            />
          ))}

          {/* Interactive Hit Areas */}
          {ranges.map(r => (
            <rect
              key={`hit-${r.id}`}
              x={r.startX}
              y="0"
              width={r.endX - r.startX}
              height="120"
              fill="transparent"
              onMouseEnter={() => setHoveredRange(r.label)}
              onMouseLeave={() => setHoveredRange(null)}
              onClick={() => onSelect(r.label)}
            />
          ))}
        </svg>

        <div className="flex justify-between mt-4 px-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">260</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">300 (Avg)</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">340</span>
        </div>
      </div>

      {/* Side-by-side Summary Boxes */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-8 rounded-[2rem] border-2 transition-all duration-300 text-center ${activeRange ? 'bg-white border-slate-200 shadow-xl scale-[1.02]' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
          <span className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Target Goal</span>
          <span className="block text-2xl font-black text-slate-900">
            {activeRange ? activeRange.label : '---'}
          </span>
        </div>
        <div className={`p-8 rounded-[2rem] border-2 transition-all duration-300 text-center ${activeRange ? 'bg-emerald-50/50 border-emerald-100 shadow-xl scale-[1.02]' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
          <span className="block text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Target Percentile</span>
          <span className="block text-2xl font-black text-emerald-700">
            {activeRange ? activeRange.percentile.split(' ')[0] : '---'}
          </span>
        </div>
      </div>
    </div>
  );
};

const OnboardingSurvey: React.FC<OnboardingSurveyProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    targetScore: '',
    testDate: '',
    hoursPerWeek: '',
    notDecidedDate: false
  });

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
    else onComplete();
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const isStepComplete = useMemo(() => {
    if (step === 1) return !!formData.targetScore;
    if (step === 2) return !!formData.testDate || formData.notDecidedDate;
    if (step === 3) return !!formData.hoursPerWeek;
    return false;
  }, [step, formData]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <BellCurveSection 
            selectedRange={formData.targetScore}
            onSelect={(range) => {
              setFormData({ ...formData, targetScore: range });
            }} 
          />
        );
      case 2:
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">When is your test date?</h3>
            <p className="text-slate-500 text-sm mb-10 font-medium">Select a date to build your custom countdown and study milestones.</p>
            
            <div className="space-y-6">
              <div className={`relative group transition-all duration-300 ${formData.notDecidedDate ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <svg className="w-6 h-6 text-slate-400 group-focus-within:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input 
                  type="date"
                  value={formData.testDate}
                  onChange={(e) => setFormData({ ...formData, testDate: e.target.value, notDecidedDate: false })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] py-8 pl-16 pr-8 text-xl font-black text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-sm cursor-pointer"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-xs font-black uppercase tracking-widest">
                  <span className="bg-white px-4 text-slate-300">Or</span>
                </div>
              </div>

              <button
                onClick={() => setFormData({ ...formData, notDecidedDate: !formData.notDecidedDate, testDate: '' })}
                className={`w-full py-6 px-8 rounded-[2rem] border-2 font-bold transition-all flex items-center justify-between active:scale-[0.98] ${
                  formData.notDecidedDate 
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xl' 
                    : 'border-slate-100 text-slate-500 hover:border-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>I haven't picked a date yet</span>
                {formData.notDecidedDate && (
                   <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">How many hours per week can you study?</h3>
            <div className="grid grid-cols-1 gap-3">
              {['2 - 5 Hours', '5 - 10 Hours', '10+ Hours'].map(hours => (
                <button
                  key={hours}
                  onClick={() => { setFormData({ ...formData, hoursPerWeek: hours }); }}
                  className={`w-full py-4 px-6 text-left rounded-2xl border-2 font-bold transition-all active:scale-[0.98] ${
                    formData.hoursPerWeek === hours 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900' 
                      : 'border-slate-100 text-slate-800 hover:border-slate-900 hover:bg-slate-50'
                  }`}
                >
                   <div className="flex items-center justify-between">
                    <span>{hours}</span>
                    {formData.hoursPerWeek === hours && (
                      <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-[3rem] p-12 max-w-2xl w-full shadow-2xl relative overflow-hidden flex flex-col min-h-[600px]">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
        <div className="flex justify-between items-center mb-10">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Profile: {step} of 3</span>
        </div>
        
        <div className="flex-1">
          {renderStep()}
        </div>

        <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between gap-4">
          <button 
            onClick={prevStep} 
            disabled={step === 1}
            className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
              step === 1 
                ? 'opacity-0 pointer-events-none' 
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Previous
          </button>
          <button 
            onClick={nextStep}
            disabled={!isStepComplete}
            className={`px-12 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl ${
              isStepComplete 
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-[1.02] shadow-emerald-200' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {step === 3 ? 'Finish & Create Plan' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSurvey;