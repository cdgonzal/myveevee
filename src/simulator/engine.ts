import type { SimulatorInput } from "./schema";

export type RiskLevel = "low" | "moderate" | "high" | "urgent";

export interface TwinStateUpdate {
  field: string;
  direction: "up" | "down" | "watch";
  summary: string;
}

export interface Recommendation {
  id: string;
  title: string;
  rationale: string;
  priority: number;
  coverageNote: string;
}

export interface DecisionTraceStep {
  stage: "input" | "policy" | "guardrail" | "coverage" | "reasoning" | "output";
  ruleId: string;
  detail: string;
  outcome: "applied" | "not_applied" | "advisory";
}

export interface SimulationResult {
  pipelineVersion: string;
  policyVersion: string;
  guardrailVersion: string;
  coverageVersion: string;
  riskScore: number;
  riskLevel: RiskLevel;
  riskSignals: string[];
  twinStateUpdates: TwinStateUpdate[];
  recommendations: Recommendation[];
  followUpQuestions: string[];
  decisionTrace: DecisionTraceStep[];
}

function toRiskLevel(score: number): RiskLevel {
  if (score >= 85) return "urgent";
  if (score >= 70) return "high";
  if (score >= 40) return "moderate";
  return "low";
}

export function runWellnessMirrorSimulation(input: SimulatorInput): SimulationResult {
  let riskScore = 0;
  const riskSignals: string[] = [];
  const twinStateUpdates: TwinStateUpdate[] = [];
  const decisionTrace: DecisionTraceStep[] = [];
  const recommendations: Recommendation[] = [];

  decisionTrace.push({
    stage: "input",
    ruleId: "INGEST-001",
    detail: "Input payload normalized to Digital Twin schema.",
    outcome: "applied",
  });

  if (input.symptom.severity === "high") {
    riskScore += 35;
    riskSignals.push("High symptom severity detected");
    twinStateUpdates.push({
      field: "symptom.priority",
      direction: "up",
      summary: "Escalate triage priority",
    });
    decisionTrace.push({
      stage: "policy",
      ruleId: "SYMPTOM-SEVERITY-HIGH",
      detail: "Severity=high increased risk by 35.",
      outcome: "applied",
    });
  } else if (input.symptom.severity === "moderate") {
    riskScore += 20;
    riskSignals.push("Moderate symptoms need near-term follow-up");
    twinStateUpdates.push({
      field: "symptom.priority",
      direction: "watch",
      summary: "Monitor and schedule non-urgent follow-up",
    });
    decisionTrace.push({
      stage: "policy",
      ruleId: "SYMPTOM-SEVERITY-MODERATE",
      detail: "Severity=moderate increased risk by 20.",
      outcome: "applied",
    });
  }

  if (input.symptom.durationDays >= 14) {
    riskScore += 15;
    riskSignals.push("Persistent symptom duration");
    twinStateUpdates.push({
      field: "symptom.duration",
      direction: "up",
      summary: "Persistent symptoms increase action urgency",
    });
    decisionTrace.push({
      stage: "policy",
      ruleId: "SYMPTOM-DURATION-14D",
      detail: "Duration >=14 days increased risk by 15.",
      outcome: "applied",
    });
  } else if (input.symptom.durationDays >= 7) {
    riskScore += 8;
    decisionTrace.push({
      stage: "policy",
      ruleId: "SYMPTOM-DURATION-7D",
      detail: "Duration >=7 days increased risk by 8.",
      outcome: "applied",
    });
  }

  if (input.medication.adherencePercent < 60) {
    riskScore += 15;
    riskSignals.push("Low medication adherence");
    twinStateUpdates.push({
      field: "medication.adherence",
      direction: "down",
      summary: "Adherence drop likely increases symptom burden",
    });
    decisionTrace.push({
      stage: "policy",
      ruleId: "ADHERENCE-LOW",
      detail: "Adherence <60% increased risk by 15.",
      outcome: "applied",
    });
  } else if (input.medication.adherencePercent < 80) {
    riskScore += 8;
    decisionTrace.push({
      stage: "policy",
      ruleId: "ADHERENCE-MID",
      detail: "Adherence <80% increased risk by 8.",
      outcome: "applied",
    });
  }

  if (input.behaviorChange.sleepHours < 6) {
    riskScore += 12;
    riskSignals.push("Insufficient sleep pattern");
    twinStateUpdates.push({
      field: "lifestyle.recovery",
      direction: "down",
      summary: "Short sleep can compound symptoms and stress",
    });
    decisionTrace.push({
      stage: "guardrail",
      ruleId: "SLEEP-LOW",
      detail: "Sleep <6 hours increased risk by 12.",
      outcome: "applied",
    });
  }

  if ((input.labs.a1c ?? 0) >= 8) {
    riskScore += 18;
    riskSignals.push("A1c above target range");
    twinStateUpdates.push({
      field: "labs.a1c",
      direction: "up",
      summary: "Elevated A1c requires tighter follow-up plan",
    });
    decisionTrace.push({
      stage: "guardrail",
      ruleId: "LAB-A1C-HIGH",
      detail: "A1c >=8 increased risk by 18.",
      outcome: "applied",
    });
  }

  if ((input.labs.systolicBp ?? 0) >= 140) {
    riskScore += 12;
    riskSignals.push("Elevated blood pressure reading");
    decisionTrace.push({
      stage: "guardrail",
      ruleId: "LAB-BP-HIGH",
      detail: "Systolic BP >=140 increased risk by 12.",
      outcome: "applied",
    });
  } else if ((input.labs.systolicBp ?? 0) >= 130) {
    riskScore += 7;
    decisionTrace.push({
      stage: "guardrail",
      ruleId: "LAB-BP-ELEVATED",
      detail: "Systolic BP >=130 increased risk by 7.",
      outcome: "applied",
    });
  }

  if (input.profile.hasChronicCondition) {
    riskScore += 8;
    decisionTrace.push({
      stage: "guardrail",
      ruleId: "CHRONIC-COND-YES",
      detail: "Chronic condition flag increased risk by 8.",
      outcome: "applied",
    });
  }

  if (!input.insurance.hasPcpAssigned) {
    riskScore += 6;
    riskSignals.push("No assigned PCP on file");
    decisionTrace.push({
      stage: "coverage",
      ruleId: "PCP-MISSING",
      detail: "No PCP assigned increased risk by 6 and added navigation recommendation.",
      outcome: "applied",
    });
  }

  const riskLevel = toRiskLevel(riskScore);

  recommendations.push({
    id: "care-next-step",
    title: riskLevel === "urgent" ? "Escalate to urgent clinical triage" : "Schedule a clinician follow-up",
    rationale: "Symptom severity, duration, and profile context indicate follow-up should be prioritized.",
    priority: riskLevel === "urgent" ? 100 : riskLevel === "high" ? 90 : 70,
    coverageNote: "Check in-network urgent care or telehealth options for fastest access.",
  });

  if (!input.insurance.hasPcpAssigned) {
    recommendations.push({
      id: "pcp-navigation",
      title: "Assign an in-network PCP",
      rationale: "No PCP on file can delay coordinated follow-up and referrals.",
      priority: 82,
      coverageNote: `Prioritize ${input.insurance.payer} in-network PCP options first.`,
    });
  }

  if (input.medication.adherencePercent < 80) {
    recommendations.push({
      id: "adherence-plan",
      title: "Start a medication adherence plan",
      rationale: "Lower adherence can increase variability in outcomes.",
      priority: 78,
      coverageNote: "Review formulary and refill support options under current plan.",
    });
  }

  if (input.behaviorChange.sleepHours < 6) {
    recommendations.push({
      id: "sleep-intervention",
      title: "Stabilize sleep schedule for 2 weeks",
      rationale: "Improved sleep can reduce compounding symptom and fatigue signals.",
      priority: 65,
      coverageNote: "Behavioral coaching may be covered under wellness benefits.",
    });
  }

  recommendations.sort((a, b) => b.priority - a.priority);

  const followUpQuestions = [
    "Are symptoms worsening, improving, or unchanged over the last 48 hours?",
    "Do you have any red-flag symptoms today (chest pain, severe shortness of breath, confusion)?",
    "Can you complete a telehealth visit in the next 24-48 hours?",
  ];

  decisionTrace.push({
    stage: "reasoning",
    ruleId: "RANK-RECOMMENDATIONS",
    detail: `Recommendations ranked by priority with riskLevel=${riskLevel} and riskScore=${riskScore}.`,
    outcome: "applied",
  });

  decisionTrace.push({
    stage: "output",
    ruleId: "OUTPUT-STRUCTURED",
    detail: "Generated structured outputs: deltas, signals, recommendations, follow-up questions, trace.",
    outcome: "applied",
  });

  return {
    pipelineVersion: "wm-pipeline@0.1.0",
    policyVersion: "policy@2026.02",
    guardrailVersion: "guardrails@2026.02",
    coverageVersion: "coverage@2026.02",
    riskScore,
    riskLevel,
    riskSignals,
    twinStateUpdates,
    recommendations,
    followUpQuestions,
    decisionTrace,
  };
}

