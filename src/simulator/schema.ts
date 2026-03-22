export type SymptomSeverity = "low" | "moderate" | "high";
export type PlanType = "commercial" | "medicare" | "medicaid" | "exchange";

export interface SimulatorInput {
  profile: {
    ageRange: "18-34" | "35-49" | "50-64" | "65+";
    state: string;
    hasChronicCondition: boolean;
  };
  insurance: {
    payer: string;
    planType: PlanType;
    hasPcpAssigned: boolean;
  };
  symptom: {
    description: string;
    durationDays: number;
    severity: SymptomSeverity;
  };
  behaviorChange: {
    sleepHours: number;
    exerciseDaysPerWeek: number;
  };
  medication: {
    currentlyTaking: string[];
    adherencePercent: number;
  };
  labs: {
    a1c?: number;
    systolicBp?: number;
    ldl?: number;
  };
  lifestyleEvent: {
    event: string;
    timing: "current" | "recent";
  };
}

export interface StarterScenario {
  id: string;
  title: string;
  summary: string;
  input: SimulatorInput;
}

export const DEFAULT_SIMULATOR_INPUT: SimulatorInput = {
  profile: {
    ageRange: "35-49",
    state: "FL",
    hasChronicCondition: true,
  },
  insurance: {
    payer: "Aetna",
    planType: "commercial",
    hasPcpAssigned: false,
  },
  symptom: {
    description: "Recurring headaches with fatigue",
    durationDays: 10,
    severity: "moderate",
  },
  behaviorChange: {
    sleepHours: 5,
    exerciseDaysPerWeek: 1,
  },
  medication: {
    currentlyTaking: ["Metformin"],
    adherencePercent: 70,
  },
  labs: {
    a1c: 8.1,
    systolicBp: 138,
    ldl: 132,
  },
  lifestyleEvent: {
    event: "Started a new night-shift job",
    timing: "recent",
  },
};

export const STARTER_SCENARIOS: StarterScenario[] = [
  {
    id: "low-energy-headache",
    title: "Low energy and headaches",
    summary: "See what may matter when you feel run down and not quite like yourself.",
    input: DEFAULT_SIMULATOR_INPUT,
  },
  {
    id: "missed-medication-routine",
    title: "Missed medication routine",
    summary: "Explore how missed medication can change what VeeVee suggests next.",
    input: {
      ...DEFAULT_SIMULATOR_INPUT,
      medication: {
        currentlyTaking: ["Metformin", "Lisinopril"],
        adherencePercent: 55,
      },
      symptom: {
        description: "Increased thirst and intermittent dizziness",
        durationDays: 14,
        severity: "moderate",
      },
    },
  },
  {
    id: "better-sleep-better-routine",
    title: "Poor sleep this week",
    summary: "See how sleep and routine changes may affect your next steps.",
    input: {
      ...DEFAULT_SIMULATOR_INPUT,
      behaviorChange: {
        sleepHours: 4,
        exerciseDaysPerWeek: 1,
      },
      lifestyleEvent: {
        event: "Sleep schedule has been off all week",
        timing: "recent",
      },
    },
  },
  {
    id: "starting-health-reset",
    title: "Trying to get back on track",
    summary: "Start with a simple reset scenario and see what support may help.",
    input: {
      ...DEFAULT_SIMULATOR_INPUT,
      symptom: {
        description: "Feeling off, low energy, and trying to rebuild healthy habits",
        durationDays: 6,
        severity: "low",
      },
      behaviorChange: {
        sleepHours: 6,
        exerciseDaysPerWeek: 2,
      },
      medication: {
        currentlyTaking: ["Metformin"],
        adherencePercent: 80,
      },
      lifestyleEvent: {
        event: "Trying to restart healthy routines",
        timing: "current",
      },
    },
  },
];
