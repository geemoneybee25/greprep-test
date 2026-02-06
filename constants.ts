import { Domain, Skill, SkillStatus, TestResult } from './types';

export const calculateStatus = (p: number): SkillStatus => {
  if (p < 0.40) return SkillStatus.NOT_READY;
  if (p < 0.85) return SkillStatus.LEARNING;
  return SkillStatus.MASTERED;
};

const QUANT_SKILL_CATEGORIES: Record<string, string> = {
  "Arithmetic Operations": "Arithmetic",
  "Exponents and Roots": "Arithmetic",
  "Ratios and Proportions": "Arithmetic",
  "Percentages": "Arithmetic",
  "Linear Equations": "Algebra",
  "Quadratic Equations": "Algebra",
  "Inequalities": "Algebra",
  "Functions": "Algebra",
  "Coordinate Geometry": "Geometry",
  "Lines and Angles": "Geometry",
  "Triangles": "Geometry",
  "Circles": "Geometry",
  "Polygons and Area": "Geometry",
  "3D Geometry": "Geometry",
  "Mean, Median, Mode": "Data Analysis",
  "Standard Deviation": "Data Analysis",
  "Probability": "Data Analysis",
  "Permutations and Combinations": "Data Analysis",
  "Data Interpretation": "Data Analysis",
  "Quantitative Comparison": "Problem Solving Strategies"
};

const VERBAL_SKILL_CATEGORIES: Record<string, string> = {
  "Text Completion (Single Blank)": "Text Completion",
  "Text Completion (Double Blank)": "Text Completion",
  "Text Completion (Triple Blank)": "Text Completion",
  "Sentence Equivalence": "Sentence Equivalence",
  "Main Idea": "Reading Comprehension",
  "Supporting Details": "Reading Comprehension",
  "Inference": "Reading Comprehension",
  "Author's Purpose": "Reading Comprehension",
  "Logical Structure": "Reading Comprehension",
  "Strengthen/Weaken": "Critical Reasoning",
  "Vocabulary in Context": "Vocabulary",
  "Synonym Recognition": "Vocabulary",
  "Antonym Recognition": "Vocabulary"
};

const QUANT_SKILL_NAMES = Object.keys(QUANT_SKILL_CATEGORIES);
const VERBAL_SKILL_NAMES = Object.keys(VERBAL_SKILL_CATEGORIES);

const PREREQUISITE_MAP: Record<string, string[]> = {
  "Quadratic Equations": ["Linear Equations"],
  "Inequalities": ["Linear Equations"],
  "Functions": ["Linear Equations"],
  "Coordinate Geometry": ["Linear Equations"],
  "Circles": ["Coordinate Geometry"],
  "3D Geometry": ["Polygons and Area"],
  "Standard Deviation": ["Mean, Median, Mode"],
  "Permutations and Combinations": ["Probability"],
  "Data Interpretation": ["Mean, Median, Mode"],
  "Quantitative Comparison": ["Ratios and Proportions", "Inequalities"],
  "Text Completion (Double Blank)": ["Text Completion (Single Blank)"],
  "Text Completion (Triple Blank)": ["Text Completion (Double Blank)"],
  "Inference": ["Main Idea", "Supporting Details"],
  "Logical Structure": ["Main Idea"],
  "Strengthen/Weaken": ["Inference"]
};

export const generateMockPastTests = (): TestResult[] => {
  const quantBaseline = 155;
  const verbalBaseline = 153;
  const totalBaseline = 308;

  return [
    {
      id: 'test-1',
      date: '2024-05-15T10:00:00Z',
      totalScore: totalBaseline + 6,
      mathScore: quantBaseline + 3,    // Mapping GRE Quant to mathScore field
      readingScore: verbalBaseline + 3, // Mapping GRE Verbal to readingScore field
      performanceBreakdown: [
        { topic: 'Ratios and Proportions', score: 70, averageScore: 80 },
        { topic: 'Quadratic Equations', score: 65, averageScore: 75 },
        { topic: 'Text Completion (Double Blank)', score: 60, averageScore: 72 },
      ]
    },
    {
      id: 'test-2',
      date: '2024-04-22T14:30:00Z',
      totalScore: totalBaseline - 2,
      mathScore: quantBaseline - 1,
      readingScore: verbalBaseline - 1,
      performanceBreakdown: [
        { topic: 'Coordinate Geometry', score: 55, averageScore: 75 },
      ]
    }
  ];
};

export const generateMockSkills = (): Skill[] => {
  const createSkillsForDomain = (names: string[], categories: Record<string, string>, domain: Domain) => {
    return names.map((name, index) => {
      let pMastery: number;
      
      if (index < names.length * 0.3) pMastery = 0.25 + Math.random() * 0.25;
      else if (index < names.length * 0.7) pMastery = 0.55 + Math.random() * 0.25;
      else pMastery = 0.88 + Math.random() * 0.11;

      return {
        id: `${domain.toLowerCase().split(' ')[0]}-skill-${index + 1}`,
        name,
        domain,
        category: categories[name],
        pMastery: Number(pMastery.toFixed(2)),
        status: calculateStatus(pMastery),
        lastPracticed: Math.random() > 0.3 ? new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString() : null,
        attempts: Math.floor(Math.random() * 100)
      };
    });
  };

  const quantSkills = createSkillsForDomain(QUANT_SKILL_NAMES, QUANT_SKILL_CATEGORIES, Domain.QUANT);
  const verbalSkills = createSkillsForDomain(VERBAL_SKILL_NAMES, VERBAL_SKILL_CATEGORIES, Domain.VERBAL);
  
  const allSkills = [...quantSkills, ...verbalSkills];

  return allSkills.map(skill => {
    const prereqNames = PREREQUISITE_MAP[skill.name];
    if (prereqNames) {
      const prereqIds = prereqNames.map(pName => {
        const found = allSkills.find(s => s.name === pName);
        return found ? found.id : '';
      }).filter(id => id !== '');
      
      const allPrereqsMastered = prereqIds.every(id => {
        const prereq = allSkills.find(s => s.id === id);
        return prereq && prereq.pMastery >= 0.85;
      });

      if (!allPrereqsMastered) {
        return {
          ...skill,
          prerequisites: prereqIds,
          status: SkillStatus.NOT_READY,
          pMastery: Math.min(skill.pMastery, 0.35)
        };
      }

      return { ...skill, prerequisites: prereqIds };
    }
    return skill;
  });
};

export const INITIAL_SKILLS: Skill[] = generateMockSkills();
export const MOCK_PAST_TESTS: TestResult[] = generateMockPastTests();