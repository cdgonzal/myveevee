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
    id: "sx-fatigue-coverage",
    title: "Fatigue + Headache with PCP Gap",
    summary: "Simulate triage and coverage-aware next steps without an assigned PCP.",
    input: DEFAULT_SIMULATOR_INPUT,
  },
  {
    id: "med-adherence-swing",
    title: "Medication Adherence Dip",
    summary: "See impact on risk priority when adherence falls over 30 days.",
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
    id: "behavior-improvement",
    title: "Lifestyle Improvement Plan",
    summary: "Test how better sleep and activity can shift the recommendation ranking.",
    input: {
      ...DEFAULT_SIMULATOR_INPUT,
      behaviorChange: {
        sleepHours: 7,
        exerciseDaysPerWeek: 4,
      },
      lifestyleEvent: {
        event: "Started a structured morning routine",
        timing: "current",
      },
    },
  },
];

