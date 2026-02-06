import React, { useState, useMemo, useEffect } from 'react';
import { generateMockSkills, calculateStatus, generateMockPastTests } from './constants';
import { Skill, SkillStatus, MasterySummary, EngagementStats, TestResult, Domain } from './types';
import Navbar, { TabType } from './components/Navbar';
import ProgressPage, { ProgressTab } from './components/ProgressPage';
import PracticePage from './components/PracticePage';
import TestPage from './components/TestPage';
import LearnPage from './components/LearnPage';
import SkillDetail from './components/SkillDetail';
import TutorialOverlay, { TutorialStep } from './components/TutorialOverlay';
import OnboardingSurvey from './components/OnboardingSurvey';
import DiagnosticSimulationFlow from './components/DiagnosticSimulationFlow';

export interface StudyPlanAdjustment {
  date: string;
  weakSkills: string[];
  gainPotential: number;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    targetId: '',
    title: 'Welcome to Adaptive GRE',
    description: 'Let\'s take a 60-second tour of how this system optimizes your study path using Bayesian Knowledge Tracing.',
    position: 'center'
  },
  {
    targetId: 'tutorial-bullseye',
    title: 'The Mastery Matrix',
    description: 'This is your Zone of Proximal Development. The amber ring shows skills you\'re ready to master right now for the highest score gains.',
    tab: 'Analytics',
    position: 'bottom'
  },
  {
    targetId: 'tutorial-practice-start',
    title: 'Adaptive Practice',
    description: 'When you start a sprint, our engine selects the perfect problems to push your boundaries without causing frustration.',
    tab: 'Study Plan',
    position: 'top'
  },
  {
    targetId: 'tutorial-hints',
    title: 'Graduated Hint System',
    description: 'Stuck? Use hints to learn concepts. You\'ll still gain mastery points if you solve it, just slightly fewer than if solved independently.',
    tab: 'Study Plan',
    position: 'top'
  },
  {
    targetId: 'tutorial-test-adjust',
    title: 'Diagnostic Feedback Loop',
    description: 'After every simulation, we analyze your gaps and automatically rewire your practice priorities to target weak spots.',
    tab: 'Tests',
    position: 'top'
  },
  {
    targetId: '',
    title: 'You\'re All Set!',
    description: 'You are now ready to start your journey to a higher GRE score. Happy studying!',
    position: 'center'
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('Study Plan');
  const [skills, setSkills] = useState<Skill[]>(() => generateMockSkills());
  const [pastTests, setPastTests] = useState<TestResult[]>(() => generateMockPastTests());
  const [adjustment, setAdjustment] = useState<StudyPlanAdjustment | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  
  // Demo & Onboarding State
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [isSimulatingDiagnostic, setIsSimulatingDiagnostic] = useState(false);

  // Lesson/Skill Detail View State
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [queuedSkillId, setQueuedSkillId] = useState<string | null>(null);
  const [analyticsSubTab, setAnalyticsSubTab] = useState<ProgressTab>('Overview');

  // Tutorial State
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);

  // Engagement State
  const [minutesToday, setMinutesToday] = useState(12);
  const [practiceLog, setPracticeLog] = useState<string[]>(() => {
    const today = new Date();
    const log = [today.toISOString().split('T')[0]];
    for (let i = 1; i < 8; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        log.push(d.toISOString().split('T')[0]);
    }
    return log;
  });

  const dailyGoalMinutes = 35;

  const currentStreak = useMemo(() => {
    const sortedDates = [...new Set(practiceLog)].sort().reverse();
    if (sortedDates.length === 0) return 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let streak = 0;
    let currentCheck = sortedDates.includes(todayStr) ? todayStr : yesterdayStr;

    if (!sortedDates.includes(todayStr) && !sortedDates.includes(yesterdayStr)) return 0;

    for (let i = 0; i < 365; i++) {
      const dateStr = new Date(new Date(currentCheck).getTime() - i * 86400000).toISOString().split('T')[0];
      if (sortedDates.includes(dateStr)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [practiceLog]);

  const engagementStats: EngagementStats = {
    streak: currentStreak,
    minutesToday,
    dailyGoalMinutes,
    practiceLog
  };

  const handleStartDemo = () => {
    setIsDemoMode(true);
    setShowSurvey(true);
    setActiveTab('Study Plan');
    setAdjustment(null);
    setMinutesToday(0);
    setPastTests([]);
    setActiveLessonId(null);
    setQueuedSkillId(null);
    setTutorialStep(null);
  };

  const handleTriggerSimulate = () => {
    setIsSimulatingDiagnostic(true);
  };

  const handleCompleteDiagnosticSimulation = () => {
    // 1. Hide the diagnostic overlay
    setIsSimulatingDiagnostic(false);
    
    // 2. Clear out demo constraints and reveal actual skills data
    const revealedSkills = generateMockSkills();
    setSkills(revealedSkills);
    
    // 3. Create a new diagnostic test result for history
    const diagnosticResult: TestResult = {
      id: 'test-diagnostic',
      date: new Date().toISOString(),
      totalScore: 308,
      mathScore: 155,
      readingScore: 153,
      performanceBreakdown: [
        { topic: 'Arithmetic Operations', score: 65, averageScore: 75 },
        { topic: 'Quantitative Comparison', score: 45, averageScore: 72 },
        { topic: 'Text Completion (Double Blank)', score: 85, averageScore: 75 },
      ]
    };
    
    setPastTests([diagnosticResult]);
    setIsDemoMode(false);
    
    // 4. Force navigation to the STUDY PLAN page (Home)
    setActiveTab('Study Plan');
    setAnalyticsSubTab('Overview');
    setActiveLessonId(null);
    setQueuedSkillId(null);
    
    // 5. Explicitly ensure we are NOT in tutorial mode to avoid tab switching
    setTutorialStep(null);
  };

  const handleSessionComplete = (minutesEarned: number) => {
    setMinutesToday(prev => prev + minutesEarned);
    const todayStr = new Date().toISOString().split('T')[0];
    setPracticeLog(prev => prev.includes(todayStr) ? prev : [...prev, todayStr]);
    setQueuedSkillId(null);
  };

  const handleNextTutorialStep = () => {
    if (tutorialStep === null) return;
    const nextStep = tutorialStep + 1;
    if (nextStep >= TUTORIAL_STEPS.length) {
      setTutorialStep(null);
    } else {
      const stepData = TUTORIAL_STEPS[nextStep];
      if (stepData.tab) setActiveTab(stepData.tab);
      setTutorialStep(nextStep);
    }
  };

  const handleSelectSkillForLesson = (skillId: string) => {
    setActiveLessonId(skillId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleBookmark = (skillId: string) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(skillId)) next.delete(skillId);
      else next.add(skillId);
      return next;
    });
  };

  const updateSkill = (skillId: string, newPMastery: number) => {
    setSkills(prevSkills => {
      const updatedSkills = prevSkills.map(skill => {
        if (skill.id === skillId) {
          const clampedP = Math.max(0, Math.min(1, newPMastery));
          return {
            ...skill,
            pMastery: Number(clampedP.toFixed(2)),
            status: calculateStatus(clampedP),
            attempts: skill.attempts + 1,
            lastPracticed: new Date().toISOString(),
          };
        }
        return skill;
      });

      const finalSkills = updatedSkills.map(skill => {
        if (skill.status === SkillStatus.NOT_READY && skill.prerequisites && skill.prerequisites.length > 0) {
          const allPrereqsMet = skill.prerequisites.every(prereqId => {
            const pSkill = updatedSkills.find(s => s.id === prereqId);
            return pSkill && pSkill.status === SkillStatus.MASTERED;
          });

          if (allPrereqsMet) {
            return {
              ...skill,
              status: SkillStatus.LEARNING,
              pMastery: 0.40
            };
          }
        }
        return skill;
      });

      return finalSkills;
    });
  };

  const handleAdjustStudyPlan = (testDate: string, performanceData: any[]) => {
    setSkills(prevSkills => {
      const updated = prevSkills.map(skill => {
        const performance = performanceData.find(p => 
          skill.name.toLowerCase().includes(p.topic.toLowerCase()) || 
          p.topic.toLowerCase().includes(skill.name.toLowerCase())
        );
        if (performance) {
          let newP = skill.pMastery;
          if (performance.score < performance.averageScore) {
            newP = Math.max(0.2, skill.pMastery - 0.15);
          } else if (performance.score > performance.averageScore + 10) {
            newP = Math.min(1.0, skill.pMastery + 0.1);
          }
          return {
            ...skill,
            pMastery: Number(newP.toFixed(2)),
            status: calculateStatus(newP)
          };
        }
        return skill;
      });
      return updated;
    });

    const weakAreas = performanceData
      .filter(p => p.score < p.averageScore)
      .map(p => p.topic);

    setAdjustment({
      date: new Date(testDate).toLocaleDateString(undefined, { weekday: 'long' }),
      weakSkills: weakAreas,
      gainPotential: 15 + Math.floor(Math.random() * 10) // GRE gains are smaller in scale
    });

    setActiveTab('Study Plan');
  };

  const stats = useMemo<MasterySummary>(() => {
    return {
      total: skills.length,
      mastered: skills.filter(s => s.status === SkillStatus.MASTERED).length,
      learning: skills.filter(s => s.status === SkillStatus.LEARNING).length,
      locked: skills.filter(s => s.status === SkillStatus.NOT_READY).length,
    };
  }, [skills]);

  const renderContent = () => {
    if (activeLessonId) {
      const selectedSkill = skills.find(s => s.id === activeLessonId);
      if (selectedSkill) {
        return (
          <SkillDetail 
            skill={selectedSkill} 
            onBack={() => {
              setActiveLessonId(null);
              if (activeTab === 'Analytics') {
                setAnalyticsSubTab('Skills');
              }
            }} 
            onStartPractice={(id) => {
              setQueuedSkillId(id);
              setActiveTab('Study Plan');
              setActiveLessonId(null);
            }}
            backLabel={activeTab === 'Analytics' ? 'Back to Skills Map' : 'Back to Index'}
          />
        );
      }
    }

    switch (activeTab) {
      case 'Analytics':
        return (
          <ProgressPage 
            skills={skills} 
            stats={stats} 
            engagement={engagementStats} 
            pastTests={pastTests} 
            onSelectSkill={handleSelectSkillForLesson}
            initialTab={analyticsSubTab}
          />
        );
      case 'Study Plan':
        return (
          <PracticePage 
            skills={skills} 
            onUpdateSkill={updateSkill} 
            onSelectSkill={handleSelectSkillForLesson}
            onNavigateToAnalytics={() => setActiveTab('Analytics')}
            adjustment={adjustment}
            engagement={engagementStats}
            onSessionComplete={handleSessionComplete}
            queuedSkillId={queuedSkillId}
            isDemoMode={isDemoMode}
            onSimulateDiagnostic={handleTriggerSimulate}
          />
        );
      case 'Tests':
        return (
          <TestPage 
            pastTests={pastTests}
            onNavigateToAnalytics={() => setActiveTab('Analytics')} 
            onAdjustStudyPlan={handleAdjustStudyPlan}
          />
        );
      case 'Content Library':
        return (
          <LearnPage 
            skills={skills} 
            onTabChange={setActiveTab} 
            onSelectPracticeSkill={setQueuedSkillId}
            activeLessonId={activeLessonId}
            setActiveLessonId={setActiveLessonId}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={toggleBookmark}
          />
        );
      default:
        return null;
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setActiveLessonId(null); 
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-amber-100 relative">
      <div className="bg-slate-950 text-white py-2.5 px-6 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Adaptive Engine Simulation</span>
        </div>
        <button 
          onClick={handleStartDemo}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40 active:scale-95"
        >
          {isDemoMode ? 'Restart Demo' : 'Start Demo'}
        </button>
      </div>

      <Navbar activeTab={activeLessonId ? (null as any) : activeTab} onTabChange={handleTabChange} streak={engagementStats.streak} />

      {showSurvey && (
        <OnboardingSurvey onComplete={() => setShowSurvey(false)} />
      )}

      {isSimulatingDiagnostic && (
        <DiagnosticSimulationFlow onComplete={handleCompleteDiagnosticSimulation} />
      )}

      {tutorialStep !== null && (
        <TutorialOverlay 
          currentStep={tutorialStep}
          totalSteps={TUTORIAL_STEPS.length}
          stepData={TUTORIAL_STEPS[tutorialStep]}
          onNext={handleNextTutorialStep}
          onSkip={() => setTutorialStep(null)}
        />
      )}

      <main className="max-w-[1600px] mx-auto p-6 md:p-10">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;