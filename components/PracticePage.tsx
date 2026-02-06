import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Skill, SkillStatus, EngagementStats, Domain, SessionHistoryItem } from '../types';
import { StudyPlanAdjustment } from '../App';
import MathText from './MathText';
import DiagnosticLanding from './DiagnosticLanding';

interface PracticePageProps {
  skills: Skill[];
  onUpdateSkill: (id: string, newP: number) => void;
  onNavigateToAnalytics: () => void;
  onSelectSkill: (id: string) => void;
  adjustment?: StudyPlanAdjustment | null;
  engagement: EngagementStats;
  onSessionComplete: (minutes: number) => void;
  queuedSkillId?: string | null;
  isDemoMode?: boolean;
  onSimulateDiagnostic?: () => void;
}

type ActivityType = 'Lesson' | 'Live Class' | 'Guided Practice' | 'Practice Drill';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  duration: string;
  questionCount?: number;
  skills: string[];
  completed: boolean;
  link?: string;
  scheduledTime?: string;
}

interface DayPlan {
  dayName: string;
  date: Date;
  dayIdx: number;
  activities: Activity[];
}

interface Problem {
  id: string;
  question: string;
  answer: string; 
  explanation: string;
  feedback: string;
  hints: {
    strategic: string;
    conceptual: string;
    procedural: string;
    bottomOut: string;
  };
  renderAsPlain?: boolean;
  options?: string[];
}

const PROGRESSIVE_DRILL: Problem[] = [
  {
    id: 'p1',
    question: "If x + 2y = 10 and x - y = 4, what is the value of y?",
    answer: "2",
    options: ["1", "2", "3", "4"],
    renderAsPlain: true,
    explanation: "From the second equation: x = 4 + y.\nSubstitute into the first equation: (4 + y) + 2y = 10\n4 + 3y = 10\n3y = 6\ny = 2",
    feedback: "Excellent! You correctly solved the system of equations using substitution.",
    hints: {
      strategic: "Use one equation to express x in terms of y, then substitute.",
      conceptual: "Systems of equations can be solved by substitution or elimination.",
      procedural: "From x - y = 4, we get x = 4 + y. Substitute this into x + 2y = 10.",
      bottomOut: "The answer is y = 2."
    }
  },
  {
    id: 'p2',
    question: "The average (arithmetic mean) of 5 numbers is 24. If one of the numbers is removed, the average of the remaining numbers is 21. What is the value of the number that was removed?",
    answer: "36",
    options: ["21", "27", "30", "36"],
    renderAsPlain: true,
    explanation: "The sum of 5 numbers with average 24 is: 5 × 24 = 120.\nThe sum of 4 numbers with average 21 is: 4 × 21 = 84.\nThe removed number is: 120 - 84 = 36.",
    feedback: "Great work! You used the relationship between average, sum, and count.",
    hints: {
      strategic: "Find the total sum before and after removing the number.",
      conceptual: "Average = Sum ÷ Count, so Sum = Average × Count.",
      procedural: "Total sum of 5 numbers = 5 × 24 = 120. Total sum of 4 numbers = 4 × 21 = 84. Difference = 36.",
      bottomOut: "The removed number is 36."
    }
  },
  {
    id: 'p3',
    question: "Although the scientist's theory was initially met with _____, subsequent experiments provided _____ evidence that vindicated her hypothesis.\n\nBlank (i): skepticism\nBlank (ii): compelling",
    answer: "skepticism ... compelling",
    options: [
      "skepticism ... compelling",
      "enthusiasm ... ambiguous", 
      "indifference ... contradictory",
      "acclaim ... preliminary"
    ],
    renderAsPlain: true,
    explanation: "The word 'Although' signals contrast. If the theory was vindicated (proven correct), it must have initially faced doubt (skepticism), and the evidence must have been strong (compelling). The contrast structure requires: negative reception → positive evidence.",
    feedback: "Excellent! You recognized the contrast signal and logical flow of the sentence.",
    hints: {
      strategic: "Look for contrast words like 'although' that signal opposing ideas.",
      conceptual: "The theory was vindicated (proven right), so it must have faced doubt initially.",
      procedural: "'Although' creates contrast. The theory was vindicated, so: initial reception = negative (skepticism), evidence = strong (compelling).",
      bottomOut: "The answer is skepticism ... compelling."
    }
  }
];

const WEEK_THEMES: Record<number, { title: string; focus: string; domain: Domain }> = {
  1: { title: "Quantitative Foundations", focus: "Arithmetic & Basic Algebra", domain: Domain.QUANT },
  2: { title: "Verbal Foundations", focus: "Text Completion Basics", domain: Domain.VERBAL },
  3: { title: "Advanced Algebra", focus: "Equations & Inequalities", domain: Domain.QUANT },
  4: { title: "Reading Comprehension", focus: "Main Ideas & Details", domain: Domain.VERBAL },
  5: { title: "Geometry Essentials", focus: "Shapes & Spatial Reasoning", domain: Domain.QUANT },
  6: { title: "Vocabulary Builder", focus: "Context & Word Relationships", domain: Domain.VERBAL },
  7: { title: "Data Analysis", focus: "Statistics & Probability", domain: Domain.QUANT },
  8: { title: "Critical Reasoning", focus: "Inference & Argument", domain: Domain.VERBAL },
  9: { title: "Mixed Simulation & Strategy", focus: "Timed Pressure", domain: Domain.QUANT },
  10: { title: "Final Simulation Week", focus: "Full Endurance Review", domain: Domain.QUANT }
};

const PracticePage: React.FC<PracticePageProps> = ({ skills, onUpdateSkill, onNavigateToAnalytics, onSelectSkill, adjustment, engagement, onSessionComplete, queuedSkillId, isDemoMode = false, onSimulateDiagnostic }) => {
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);
  const [showActivityLanding, setShowActivityLanding] = useState(false);
  const [showDiagnosticLanding, setShowDiagnosticLanding] = useState(false);
  const [showSessionReport, setShowSessionReport] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<(SessionHistoryItem & { userAnswer: string, correctAnswer: string, feedback: string })[]>([]);
  
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [isPracticing, setIsPracticing] = useState(false);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [hintLevels, setHintLevels] = useState<Record<number, number>>({});
  const [attempts, setAttempts] = useState<Record<number, number>>({});
  const [animatedAccuracy, setAnimatedAccuracy] = useState(0);

  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [plansByWeek, setPlansByWeek] = useState<Record<number, DayPlan[]>>({});
  const [draggedActivity, setDraggedActivity] = useState<{ activityId: string, fromDayIdx: number } | null>(null);
  const [dragOverDayIdx, setDragOverDayIdx] = useState<number | null>(null);

  const [sidebarDomain, setSidebarDomain] = useState<Domain>(Domain.QUANT);
  const [sidebarZone, setSidebarZone] = useState<SkillStatus>(SkillStatus.MASTERED);
  
  const sidebarSkills = useMemo(() => {
    if (isDemoMode) return [];
    return skills.filter(s => s.domain === sidebarDomain);
  }, [skills, sidebarDomain, isDemoMode]);
  
  const zoneStats = useMemo(() => {
    if (isDemoMode) return { total: 100, mastered: 0, learning: 0, notReady: 0 };
    const s = skills.filter(sk => sk.domain === sidebarDomain);
    return {
      total: s.length || 1,
      mastered: s.filter(sk => sk.status === SkillStatus.MASTERED).length,
      learning: s.filter(sk => sk.status === SkillStatus.LEARNING).length,
      notReady: s.filter(sk => sk.status === SkillStatus.NOT_READY).length,
    };
  }, [skills, sidebarDomain, isDemoMode]);

  const filteredSidebarSkills = useMemo(() => {
    if (isDemoMode) return [];
    return sidebarSkills.filter(s => s.status === sidebarZone);
  }, [sidebarSkills, sidebarZone, isDemoMode]);

  const todayIdx = (new Date().getDay() + 6) % 7;
  const activeProblemSet = PROGRESSIVE_DRILL;
  const TOTAL_QUESTIONS = activeProblemSet.length;

  const generateDefaultPlan = (week: number): DayPlan[] => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const startOfWeek = new Date();
    startOfWeek.setDate(new Date().getDate() - todayIdx);

    if (isDemoMode) {
      return days.map((day, i) => ({ dayName: day, date: new Date(startOfWeek.getTime() + i * 86400000), dayIdx: i, activities: [] }));
    }

    const theme = WEEK_THEMES[week] || WEEK_THEMES[1];
    const themeSkills = skills.filter(s => s.category.includes(theme.focus) || s.domain === theme.domain);
    const getTopic = (offset: number) => themeSkills[(offset) % themeSkills.length]?.name || 'Mixed Topic';

    const masteredSkills = skills.filter(s => s.status === SkillStatus.MASTERED);
    const learningSkills = skills.filter(s => s.status === SkillStatus.LEARNING);

    return days.map((day, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dayActivities: Activity[] = [];
      const isWeek1 = week === 1;
      const isMonday = i === 0;

      if (i === 0) {
        dayActivities.push({ id: `act-${week}-${i}-1`, type: 'Lesson', title: `${getTopic(0)} Mastery`, subtitle: 'Educational Unit', duration: '15m', questionCount: 5, skills: [getTopic(0)], completed: isWeek1 && isMonday });
        dayActivities.push({ id: `act-${week}-${i}-2`, type: 'Guided Practice', title: `Applying ${getTopic(0)}`, subtitle: 'Active Feedback', duration: '20m', questionCount: 10, skills: [getTopic(0)], completed: isWeek1 && isMonday });
      } else if (i === 1) {
        dayActivities.push({ id: `act-${week}-${i}-1`, type: 'Practice Drill', title: `Quant Strategy Drill`, subtitle: 'Blind Assessment', duration: '25m', questionCount: 15, skills: [getTopic(1)], completed: false });
        dayActivities.push({ id: `act-${week}-${i}-2`, type: 'Lesson', title: 'Daily Spaced Review', subtitle: 'Educational Unit', duration: '10m', questionCount: 8, skills: masteredSkills.slice(0, 2).map(s => s.name), completed: false });
      } else if (i === 2) {
        dayActivities.push({ id: `act-${week}-${i}-1`, type: 'Lesson', title: `Advanced ${getTopic(2)}`, subtitle: 'Educational Unit', duration: '15m', questionCount: 6, skills: [getTopic(2)], completed: false });
        dayActivities.push({ id: `act-${week}-${i}-2`, type: 'Guided Practice', title: `GRE Level ${getTopic(2)}`, subtitle: 'Active Feedback', duration: '20m', questionCount: 12, skills: [getTopic(2)], completed: false });
      } else if (i === 3) {
        dayActivities.push({ id: `act-${week}-${i}-1`, type: 'Live Class', title: `${theme.title} Workshop`, subtitle: 'Scheduled Workshop', duration: '45m', skills: themeSkills.slice(0, 3).map(s => s.name), completed: false });
        dayActivities.push({ id: `act-${week}-${i}-2`, type: 'Practice Drill', title: 'Targeted Gap Drill', subtitle: 'Blind Assessment', duration: '15m', questionCount: 8, skills: learningSkills.slice(0, 1).map(s => s.name), completed: false });
      } else if (i === 4) {
        dayActivities.push({ id: `act-${week}-${i}-1`, type: 'Guided Practice', title: `${getTopic(0)}`, subtitle: 'Active Feedback', duration: '15m', questionCount: 10, skills: [getTopic(0)], completed: false });
        dayActivities.push({ id: `act-${week}-${i}-2`, type: 'Lesson', title: 'Retention Synthesis', subtitle: 'Educational Unit', duration: '10m', questionCount: 12, skills: masteredSkills.map(s => s.name), completed: false });
      } else if (i === 5) {
        dayActivities.push({ id: `act-${week}-${i}-1`, type: 'Practice Drill', title: 'Weekly Section Simulation', subtitle: 'Blind Assessment', duration: '35m', questionCount: 20, skills: themeSkills.slice(0, 8).map(s => s.name), completed: false });
      } else if (i === 6) {
        dayActivities.push({ id: `act-${week}-${i}-1`, type: 'Live Class', title: 'Strategy Recap', subtitle: 'Scheduled Workshop', duration: '20m', skills: masteredSkills.slice(0, 5).map(s => s.name), completed: false });
      }
      return { dayName: day, date, dayIdx: i, activities: dayActivities };
    });
  };

  const prevIsDemoModeRef = useRef(isDemoMode);

  useEffect(() => {
    const transitionedOutOfDemo = prevIsDemoModeRef.current === true && isDemoMode === false;
    
    if (transitionedOutOfDemo) {
      setShowDiagnosticLanding(false);
    }

    if (!plansByWeek[selectedWeek] || isDemoMode || transitionedOutOfDemo) {
      setPlansByWeek(prev => ({ ...prev, [selectedWeek]: generateDefaultPlan(selectedWeek) }));
    }
    
    prevIsDemoModeRef.current = isDemoMode;
  }, [selectedWeek, skills, isDemoMode]);

  const currentWeekPlan = plansByWeek[selectedWeek] || [];

  const handleDragStart = (e: React.DragEvent, activityId: string, fromDayIdx: number) => {
    setDraggedActivity({ activityId, fromDayIdx });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, dayIdx: number) => {
    e.preventDefault();
    setDragOverDayIdx(dayIdx);
  };

  const handleDrop = (e: React.DragEvent, toDayIdx: number) => {
    e.preventDefault();
    setDragOverDayIdx(null);
    if (!draggedActivity) return;

    const { activityId, fromDayIdx } = draggedActivity;
    if (fromDayIdx === toDayIdx) {
      setDraggedActivity(null);
      return;
    }

    const newWeekPlan = [...currentWeekPlan];
    const sourceDay = { ...newWeekPlan[fromDayIdx], activities: [...newWeekPlan[fromDayIdx].activities] };
    const targetDay = { ...newWeekPlan[toDayIdx], activities: [...newWeekPlan[toDayIdx].activities] };

    const activityToMove = sourceDay.activities.find(a => a.id === activityId);
    if (activityToMove) {
      sourceDay.activities = sourceDay.activities.filter(a => a.id !== activityId);
      targetDay.activities.push(activityToMove);
      newWeekPlan[fromDayIdx] = sourceDay;
      newWeekPlan[toDayIdx] = targetDay;
      setPlansByWeek(prev => ({ ...prev, [selectedWeek]: newWeekPlan }));
    }

    setDraggedActivity(null);
  };

  const resetPlan = () => {
    setPlansByWeek(prev => ({ ...prev, [selectedWeek]: generateDefaultPlan(selectedWeek) }));
  };

  const resetPracticeState = () => {
    setIsPracticing(false);
    setActiveActivity(null);
    setShowActivityLanding(false);
    setShowSessionReport(false);
    setShowExitConfirm(false);
    setSessionHistory([]);
    setUserAnswers({});
    setHintLevels({});
    setAttempts({});
    setCurrentProblemIndex(0);
  };

  const handleOpenActivity = (activity: Activity) => {
    if (isEditingPlan) return;
    setActiveActivity(activity);
    setShowActivityLanding(true);
    setShowSessionReport(false);
    setIsCalculating(false);
    setSessionHistory([]);
    setIsPracticing(true);
    setCurrentProblemIndex(0);
    setUserAnswers({});
    setHintLevels({});
    setAttempts({});
    setAnimatedAccuracy(0);
  };

  const currentProblem = activeProblemSet[currentProblemIndex];
  const currentAnswer = userAnswers[currentProblemIndex] || '';
  const currentHintLevel = hintLevels[currentProblemIndex] || 0;
  const currentAttemptCount = attempts[currentProblemIndex] || 0;
  const currentFeedback = sessionHistory[currentProblemIndex] ? (sessionHistory[currentProblemIndex].isCorrect ? 'correct' : 'incorrect') : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAnswer.trim() || currentFeedback) return;
    
    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, '').replace(/[x𝑥]=/g, '').replace(/\.0$/g, '');
    const isCorrect = normalize(currentAnswer) === normalize(currentProblem.answer);
    const newAttemptCount = currentAttemptCount + 1;
    
    if (isCorrect || newAttemptCount >= 2) {
      const newHistory = [...sessionHistory];
      newHistory[currentProblemIndex] = {
        problemId: currentProblem.id,
        question: currentProblem.question,
        isCorrect: isCorrect,
        timeSpent: 30,
        hintsUsed: Array.from({ length: currentHintLevel }, (_, i) => `L${i + 1}`),
        explanation: currentProblem.explanation,
        feedback: currentProblem.feedback,
        userAnswer: currentAnswer,
        correctAnswer: currentProblem.answer
      };
      setSessionHistory(newHistory);
    }
    
    setAttempts(prev => ({ ...prev, [currentProblemIndex]: newAttemptCount }));
  };

  const handleNext = () => {
    if (currentProblemIndex >= TOTAL_QUESTIONS - 1) {
      setIsCalculating(true);
    } else {
      setCurrentProblemIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    if (isCalculating) {
      const timer = setTimeout(() => {
        setIsCalculating(false);
        setShowSessionReport(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCalculating]);

  const correctAnswersCount = useMemo(() => 
    sessionHistory.filter(h => h.isCorrect).length
  , [sessionHistory]);

  const actualAccuracyPercent = useMemo(() => 
    sessionHistory.length > 0 ? (correctAnswersCount / sessionHistory.length) * 100 : 0
  , [sessionHistory, correctAnswersCount]);

  useEffect(() => {
    if (showSessionReport) {
      setAnimatedAccuracy(0);
      setTimeout(() => setAnimatedAccuracy(actualAccuracyPercent), 200);
    }
  }, [showSessionReport, actualAccuracyPercent]);

  const handleGetHint = () => { 
    if (currentHintLevel < 4 && !currentFeedback) {
      setHintLevels(prev => ({ ...prev, [currentProblemIndex]: (prev[currentProblemIndex] || 0) + 1 }));
    }
  };

  const getActivityIcon = (type: ActivityType, completed: boolean) => {
    if (completed) {
      return (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      );
    }

    switch (type) {
      case 'Guided Practice':
        return (
          <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" strokeWidth={2.5} />
            <path strokeWidth={2.5} strokeLinecap="round" d="M12 7l-2 5 2 5 2-5-2-5z" />
          </svg>
        );
      case 'Practice Drill':
        return (
          <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth={2.5} d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
            <path strokeWidth={2.5} d="M12 2v2m0 16v2m10-10h-2M4 12H2" />
          </svg>
        );
      case 'Live Class':
        return (
          <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'Lesson':
      default:
        return (
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
    }
  };

  if (isCalculating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
        <div className="relative w-24 h-24 mb-10">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center"><span className="text-xl">📊</span></div>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Analyzing Results</h2>
        <p className="text-slate-600 font-bold text-sm uppercase tracking-widest animate-pulse">Updating Knowledge Frontier...</p>
      </div>
    );
  }

  if (showDiagnosticLanding) {
    return (
      <DiagnosticLanding 
        onBack={() => setShowDiagnosticLanding(false)} 
        onSimulate={() => onSimulateDiagnostic?.()}
      />
    );
  }

  if (isPracticing && activeActivity) {
    if (showActivityLanding) {
      return (
        <div className="max-w-2xl mx-auto py-20 px-6 animate-in fade-in zoom-in-95 duration-300">
          <button onClick={resetPracticeState} className="flex items-center gap-2 text-slate-600 font-bold hover:text-slate-900 mb-12 group">
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/></svg> Return to Study Plan
          </button>
          <div className="bg-white rounded-[3.5rem] border border-slate-200 p-12 md:p-16 shadow-2xl text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              {getActivityIcon(activeActivity.type, false)}
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-2">{activeActivity.title}</h2>
            <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-10">{activeActivity.type}</p>
            <button onClick={() => setShowActivityLanding(false)} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-lg uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all">Start Session</button>
          </div>
        </div>
      );
    }

    if (showSessionReport) {
      return (
        <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-500 space-y-12">
          <header className="text-center">
            <h2 className="text-4xl font-black text-slate-900 mb-8">Session Summary</h2>
            <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-xl flex flex-col md:flex-row items-center gap-10">
               <div className="relative w-40 h-40 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#0f172a" strokeWidth="8" strokeDasharray="282.7" style={{ strokeDashoffset: 282.7 - (282.7 * animatedAccuracy) / 100, transition: 'stroke-dashoffset 2s cubic-bezier(0.34, 1.56, 0.64, 1)' }} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-3xl font-black text-slate-900 leading-none">{Math.round(animatedAccuracy)}%</span>
                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Accuracy</span>
                  </div>
               </div>
               <div className="text-left flex-1">
                  <h3 className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-2">Performance Breakdown</h3>
                  <h4 className="text-2xl font-black text-slate-900 mb-4">{activeActivity.skills[0]}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    You scored <strong>{correctAnswersCount} out of {sessionHistory.length}</strong> correct in this session. 
                    {correctAnswersCount === sessionHistory.length 
                      ? " Perfect accuracy! You've mastered the core procedural requirements for this unit."
                      : " Good effort! Review the step-by-step explanations below to address specific procedural gaps."}
                  </p>
               </div>
            </div>
          </header>

          <section className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-xl font-black text-slate-900">Detailed Review</h3>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {correctAnswersCount} / {sessionHistory.length} Correct
              </span>
            </div>
            
            <div className="space-y-4">
              {sessionHistory.map((item, idx) => (
                <div key={idx} className={`bg-white rounded-3xl border-2 p-8 shadow-sm transition-all hover:shadow-md ${item.isCorrect ? 'border-green-100' : 'border-red-100'}`}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${item.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {idx + 1}
                      </span>
                      <h4 className="text-lg font-black text-slate-900">Question {idx + 1}</h4>
                    </div>
                    {item.isCorrect ? (
                      <span className="flex items-center gap-1.5 text-green-600 font-black text-[10px] uppercase tracking-widest">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-600 font-black text-[10px] uppercase tracking-widest">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={3} d="M6 18L18 6M6 6l12 12" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Incorrect
                      </span>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="text-slate-800 font-medium leading-relaxed">
                      <MathText text={item.question} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-2xl border ${item.isCorrect ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                        <span className="block text-[9px] font-black uppercase text-slate-500 mb-1">Your Answer</span>
                        <span className={`font-bold ${item.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                          <MathText text={item.userAnswer} />
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                        <span className="block text-[9px] font-black uppercase text-slate-500 mb-1">Correct Answer</span>
                        <span className="font-bold text-slate-900">
                          <MathText text={item.correctAnswer} />
                        </span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50">
                      <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Step-by-Step Explanation</h5>
                      <div className="text-sm font-medium text-slate-700 whitespace-pre-line leading-relaxed">
                        <MathText text={item.explanation} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <button onClick={() => { onSessionComplete(15); resetPracticeState(); }} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all">Return to Study Plan</button>
        </div>
      );
    }

    const isGuidedPractice = activeActivity.type === 'Guided Practice';
    const hasSubmitted = !!currentFeedback;
    const isFirstAttemptWrong = currentAttemptCount === 1 && !hasSubmitted;

    return (
      <div className="max-w-4xl mx-auto py-12 px-6 min-h-screen animate-in fade-in duration-300 relative">
        {showExitConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-black text-slate-900 mb-4">Exit Session?</h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed mb-8">Your progress in this specific drill will not be saved. Are you sure you want to return to the study plan?</p>
              <div className="flex flex-col gap-3">
                <button onClick={resetPracticeState} className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all">Yes, Exit Drill</button>
                <button onClick={() => setShowExitConfirm(false)} className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-12 shadow-2xl relative">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-10 border-b border-slate-50 pb-6 gap-6">
            <div className="flex items-center gap-6">
              <button onClick={handlePrevious} disabled={currentProblemIndex === 0} className={`text-[11px] font-black uppercase tracking-widest ${currentProblemIndex === 0 ? 'text-slate-200' : 'text-slate-600 hover:text-slate-900'}`}>Previous</button>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Q{currentProblemIndex + 1}</span>
                <span className="text-slate-200">/</span>
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{TOTAL_QUESTIONS}</span>
              </div>
              <button onClick={handleNext} disabled={!hasSubmitted} className={`text-[11px] font-black uppercase tracking-widest ${!hasSubmitted ? 'text-slate-200' : 'text-slate-600 hover:text-slate-900'}`}>Next</button>
            </div>
            <button onClick={() => setShowExitConfirm(true)} className="px-4 py-2 bg-slate-100 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
              Exit Session
            </button>
          </div>

          <div className="space-y-10">
            <div className="text-xl font-medium text-slate-800 leading-relaxed">
              {currentProblem.renderAsPlain ? <span>{currentProblem.question}</span> : <MathText text={currentProblem.question} />}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-4">
                {currentProblem.options ? (
                  <div className="grid grid-cols-1 gap-4">
                    {currentProblem.options.map((option, idx) => {
                      const isSelected = currentAnswer === option;
                      const label = String.fromCharCode(65 + idx);
                      return (
                        <button
                          key={option}
                          type="button"
                          disabled={hasSubmitted}
                          onClick={() => setUserAnswers(prev => ({ ...prev, [currentProblemIndex]: option }))}
                          className={`flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                            isSelected ? 'border-slate-900 bg-slate-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-300'
                          } ${hasSubmitted ? 'opacity-50' : ''} ${isFirstAttemptWrong && isSelected ? 'border-rose-300' : ''}`}
                        >
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black uppercase transition-colors ${
                            isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>{label}</span>
                          <span className="font-bold text-slate-800 text-lg"><MathText text={option} /></span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input 
                      autoFocus 
                      type="text" 
                      value={currentAnswer} 
                      onChange={(e) => setUserAnswers(prev => ({ ...prev, [currentProblemIndex]: e.target.value }))} 
                      disabled={hasSubmitted} 
                      className={`flex-1 bg-slate-50 border-2 rounded-2xl px-6 py-5 text-xl font-black focus:border-slate-900 transition-all ${isFirstAttemptWrong ? 'border-rose-300' : 'border-slate-100'}`} 
                      placeholder="Your answer..." 
                    />
                  </div>
                )}
              </div>
              
              {isGuidedPractice && currentHintLevel > 0 && !hasSubmitted && (
                 <div className="space-y-3 animate-in slide-in-from-top-4 duration-300 py-4">
                    {currentHintLevel >= 1 && <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-slate-400"><div className="text-lg font-medium text-slate-700"><strong>Strategy:</strong> <MathText text={currentProblem.hints.strategic} /></div></div>}
                    {currentHintLevel >= 2 && <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-slate-400"><div className="text-lg font-medium text-slate-700"><strong>Concept:</strong> <MathText text={currentProblem.hints.conceptual} /></div></div>}
                    {currentHintLevel >= 3 && <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-slate-400"><div className="text-lg font-medium text-slate-700"><strong>Step:</strong> <MathText text={currentProblem.hints.procedural} /></div></div>}
                    {currentHintLevel >= 4 && <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-400"><div className="text-lg font-black text-green-950"><strong>Solution:</strong> <MathText text={currentProblem.hints.bottomOut} /></div></div>}
                 </div>
              )}

              {isFirstAttemptWrong && (
                <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <span className="text-xl">⚠️</span>
                  <p className="text-rose-700 font-bold text-sm">Not quite. You have one more attempt! Use a hint if you're stuck.</p>
                </div>
              )}

              {!hasSubmitted && (
                <div className="flex flex-col sm:flex-row gap-4">
                  {isGuidedPractice && currentAttemptCount > 0 && (
                    <button type="button" onClick={handleGetHint} disabled={hasSubmitted || currentHintLevel >= 4} className="px-8 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 animate-in zoom-in duration-300">
                      Hint ({currentHintLevel}/4)
                    </button>
                  )}
                  <button type="submit" disabled={!currentAnswer.trim()} className="flex-1 py-5 rounded-2xl font-black uppercase tracking-widest bg-slate-900 text-white shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all">
                    {currentAttemptCount === 0 ? 'Confirm Answer' : 'Submit Final Attempt'}
                  </button>
                </div>
              )}
            </form>
            
            {hasSubmitted && (
              <div className="animate-in slide-in-from-top-4 duration-300 space-y-6">
                <div className={`p-8 rounded-[2rem] border-2 ${currentFeedback === 'correct' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                  <h3 className="text-lg font-black uppercase mb-3">{currentFeedback === 'correct' ? '✓ Correct' : '✕ Incorrect'}</h3>
                  <div className="text-base font-bold text-slate-800 whitespace-pre-line leading-relaxed"><MathText text={currentProblem.explanation} /></div>
                </div>
                <button onClick={handleNext} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl">
                  {currentProblemIndex >= TOTAL_QUESTIONS - 1 ? 'Complete Session' : 'Continue'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-10 min-h-screen pb-20">
      <aside className="lg:w-[280px] shrink-0">
        <div className="lg:sticky lg:top-32 space-y-8">
          <h3 className="text-2xl font-black text-slate-900 mb-6 px-4">Study Plan</h3>
          <nav className="space-y-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((wk) => (
              <button key={wk} onClick={() => setSelectedWeek(wk)} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${selectedWeek === wk ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>Week {wk}</button>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        {!isDemoMode && (
          <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
            <div>
              <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-2 block">Week {selectedWeek}</span>
              <h1 className="text-3xl font-black text-slate-900">{WEEK_THEMES[selectedWeek]?.title || "Study Unit"}</h1>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsEditingPlan(!isEditingPlan)}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  isEditingPlan ? 'bg-slate-900 text-white shadow-inner' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200'
                }`}
              >
                {isEditingPlan ? 'Finish Editing' : 'Customize Plan'}
              </button>
              {isEditingPlan && (
                <button onClick={resetPlan} className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all">Reset Default</button>
              )}
            </div>
          </header>
        )}

        {isDemoMode ? (
          <div className="bg-white rounded-[3.5rem] border border-slate-200 p-16 text-center shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-10 text-4xl">
              🎯
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Your Personalized Path Starts Here</h2>
            <p className="text-slate-600 text-xl font-medium leading-relaxed max-w-2xl mx-auto mb-12">
              Welcome to your empty study plan! To build an adaptive path tailored specifically to your weak spots, we need a baseline of your current skill levels.
            </p>
            <div className="flex flex-col items-center gap-6">
               <button 
                onClick={() => setShowDiagnosticLanding(true)}
                className="bg-slate-900 text-white px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-slate-200"
               >
                  Take Full Length Diagnostic Test
               </button>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Takes approx. 120 minutes • Proctored Session</p>
            </div>
          </div>
        ) : (
          <>
            {isEditingPlan && (
              <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-3xl flex items-center gap-4 text-blue-900 shadow-sm animate-in fade-in slide-in-from-top-2">
                <svg className="w-6 h-6 shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-sm font-black leading-tight uppercase tracking-tight">Drag activities to reorder your schedule</p>
              </div>
            )}

            <div className="space-y-12">
              {currentWeekPlan.map((day, dIdx) => (
                <section 
                  key={dIdx} 
                  onDragOver={(e) => isEditingPlan && handleDragOver(e, dIdx)}
                  onDrop={(e) => isEditingPlan && handleDrop(e, dIdx)}
                  className={`animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-[2.5rem] transition-all relative ${
                    dragOverDayIdx === dIdx ? 'bg-blue-50/50 scale-[1.01] p-6 -m-6 z-10 border-2 border-blue-400 border-dashed' : ''
                  }`}
                >
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6 px-2">{day.dayName}</h2>
                  <div className="space-y-3">
                    {day.activities.length === 0 ? (
                      <div className={`border-2 border-dashed rounded-3xl p-10 text-center transition-colors ${isEditingPlan ? 'border-slate-400 bg-slate-50' : 'border-slate-200'}`}>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isEditingPlan ? 'text-slate-600' : 'text-slate-400'}`}>No activities scheduled</p>
                      </div>
                    ) : (
                      day.activities.map((activity) => (
                        <div 
                          key={activity.id} 
                          draggable={isEditingPlan}
                          onDragStart={(e) => handleDragStart(e, activity.id, dIdx)}
                          onClick={() => handleOpenActivity(activity)} 
                          className={`group bg-white border rounded-2xl p-5 flex items-center justify-between transition-all ${
                            isEditingPlan 
                              ? 'cursor-grab active:cursor-grabbing border-slate-300 border-dashed hover:border-slate-900 hover:shadow-xl' 
                              : 'cursor-pointer hover:shadow-xl hover:bg-slate-50/50 border-slate-200'
                            } ${activity.completed ? 'opacity-70 bg-slate-50' : ''} ${
                              draggedActivity?.activityId === activity.id ? 'opacity-20' : ''
                            }`}
                        >
                          <div className="flex items-center gap-5">
                            {isEditingPlan && (
                              <div className="text-slate-600 hover:text-slate-900 transition-colors">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                </svg>
                              </div>
                            )}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${activity.completed ? 'bg-green-50' : 'bg-slate-100'}`}>
                              {getActivityIcon(activity.type, activity.completed)}
                            </div>
                            <div>
                              <h4 className={`font-bold text-slate-900 leading-tight ${isEditingPlan ? 'text-sm' : ''}`}>{activity.title}</h4>
                              <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                                {activity.type} • {activity.type === 'Live Class' ? activity.duration : `${activity.questionCount || 0} Questions`}
                              </span>
                            </div>
                          </div>
                          {!activity.completed && !isEditingPlan && <button className="bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Start</button>}
                        </div>
                      ))
                    )}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </main>
      <aside className="lg:w-[340px] shrink-0">
        <div className="lg:sticky lg:top-32 space-y-6">
          <div className={`bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm transition-all duration-500 ${isDemoMode ? 'opacity-80' : ''}`}>
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Section Progress</h3>
            
            <div className={`flex bg-slate-100 p-1 rounded-xl mb-6 ${isDemoMode ? 'pointer-events-none grayscale opacity-50' : ''}`}>
              <button onClick={() => setSidebarDomain(Domain.QUANT)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${sidebarDomain === Domain.QUANT ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Quantitative</button>
              <button onClick={() => setSidebarDomain(Domain.VERBAL)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${sidebarDomain === Domain.VERBAL ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Verbal</button>
            </div>
            
            <div className="flex h-2.5 w-full bg-slate-100 rounded-full mb-8 overflow-hidden border border-slate-200/50">
               <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(zoneStats.mastered / zoneStats.total) * 100}%` }} />
               <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${(zoneStats.learning / zoneStats.total) * 100}%` }} />
               <div className="h-full bg-slate-300 transition-all duration-500" style={{ width: `${(zoneStats.notReady / zoneStats.total) * 100}%` }} />
            </div>

            <div className={`flex bg-slate-100 p-1 rounded-xl mb-6 ${isDemoMode ? 'pointer-events-none grayscale opacity-50' : ''}`}>
              {[SkillStatus.MASTERED, SkillStatus.LEARNING, SkillStatus.NOT_READY].map((status) => (
                <button 
                  key={status}
                  onClick={() => setSidebarZone(status)} 
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center gap-1.5 ${sidebarZone === status ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-800'}`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    status === SkillStatus.MASTERED ? 'bg-green-500' :
                    status === SkillStatus.LEARNING ? 'bg-amber-400' : 'bg-slate-400'
                  }`} />
                  {status === SkillStatus.NOT_READY ? 'NOT READY' : status === SkillStatus.MASTERED ? 'MASTERED' : 'LEARNING'}
                </button>
              ))}
            </div>

            <div className="relative min-h-[300px]">
              {isDemoMode ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-700">
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2">Locked Profile</h4>
                  <p className="text-[10px] font-bold text-slate-500 leading-relaxed max-w-[180px]">
                    Complete a diagnostic test to reveal your current mastery profile and identify skill gaps.
                  </p>
                  <div className="mt-6 w-full space-y-2 opacity-20 select-none pointer-events-none">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-10 bg-slate-100 rounded-xl w-full" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                  {filteredSidebarSkills.length > 0 ? (
                    filteredSidebarSkills.map(skill => (
                      <div key={skill.id} onClick={() => onSelectSkill(skill.id)} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          skill.status === SkillStatus.MASTERED ? 'bg-green-500' :
                          skill.status === SkillStatus.LEARNING ? 'bg-amber-400' : 'bg-slate-400'
                        }`} />
                        <span className="text-[11px] font-bold text-slate-700 truncate">{skill.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No skills in this unit</p></div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default PracticePage;