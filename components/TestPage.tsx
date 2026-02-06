import React, { useState } from 'react';
import { TestResult, TopicPerformance } from '../types';

interface TestPageProps {
  pastTests: TestResult[];
  onNavigateToAnalytics: () => void;
  onAdjustStudyPlan: (date: string, performance: TopicPerformance[]) => void;
}

const PerformanceBadge: React.FC<{ topic: TopicPerformance }> = ({ topic }) => {
  if (topic.score >= 75) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase">
        <span className="w-1 h-1 rounded-full bg-green-500" /> Above Average
      </span>
    );
  }
  if (topic.score >= 50) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 uppercase">
        <span className="w-1 h-1 rounded-full bg-amber-500" /> Average
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 uppercase">
      <span className="w-1 h-1 rounded-full bg-rose-500" /> Critical Gap
    </span>
  );
};

const TestPage: React.FC<TestPageProps> = ({ pastTests, onNavigateToAnalytics, onAdjustStudyPlan }) => {
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(pastTests[0] || null);
  const [isAdjusting, setIsAdjusting] = useState(false);

  const handleAdjustPlan = () => {
    if (!selectedTest) return;
    setIsAdjusting(true);
    setTimeout(() => {
      onAdjustStudyPlan(selectedTest.date, selectedTest.performanceBreakdown);
      setIsAdjusting(false);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 animate-in fade-in duration-700 relative">
      {isAdjusting && (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center text-white text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-6" />
          <h2 className="text-2xl font-bold mb-2">Analyzing Results...</h2>
          <p className="text-white/60 font-medium">Updating practice priorities for maximum score growth.</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Practice Tests</h1>
          <p className="text-slate-500 mt-1">Benchmarking your current score against target percentiles.</p>
        </div>
        <button 
          onClick={() => setShowStartModal(true)}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-200"
        >
          New Practice Test
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Session History
          </h2>
          
          <div className="space-y-4">
            {pastTests.map((test) => (
              <div 
                key={test.id}
                onClick={() => setSelectedTest(test)}
                className={`group bg-white rounded-2xl border p-5 cursor-pointer transition-all ${
                  selectedTest?.id === test.id 
                    ? 'border-slate-900 ring-2 ring-slate-900/5 shadow-xl bg-slate-50/30' 
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      {new Date(test.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">Full SAT Simulation</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-slate-900">{test.totalScore}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8">
          {selectedTest ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/50">
                <div className="bg-slate-900 p-10 text-white flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
                  <div className="relative z-10 text-center md:text-left">
                    <h2 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Detailed Report</h2>
                    <h3 className="text-3xl font-black mb-1">Score Analysis</h3>
                  </div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="text-6xl font-black tracking-tighter mb-1">{selectedTest.totalScore}</div>
                  </div>
                </div>

                <div className="p-8 md:p-12">
                  <div className="mb-10">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Topic Performance</h3>
                    <div className="space-y-4">
                      {selectedTest.performanceBreakdown.map((item) => (
                        <div key={item.topic} className="group bg-slate-50 p-5 rounded-2xl">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-slate-800">{item.topic}</h4>
                            <PerformanceBadge topic={item} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-center">
                    <button 
                      id="tutorial-test-adjust"
                      onClick={handleAdjustPlan}
                      className="w-full md:w-auto bg-slate-900 text-white font-bold px-12 py-4 rounded-xl hover:bg-slate-800 transition-all shadow-xl"
                    >
                      View Full Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-20 text-center">
              <p className="text-slate-400">Select a test result to see analysis.</p>
            </div>
          )}
        </div>
      </div>

      {showStartModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-900 mb-2 text-center">Adaptive Simulation</h3>
            <button onClick={() => setShowStartModal(false)} className="w-full mt-6 bg-slate-900 text-white font-bold py-4 rounded-xl">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPage;