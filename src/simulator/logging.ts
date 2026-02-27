import type { SimulationResult } from "./engine";
import type { SimulatorInput } from "./schema";

export interface SimulationAuditRecord {
  runId: string;
  timestamp: string;
  source: string;
  inputSummary: {
    ageRange: SimulatorInput["profile"]["ageRange"];
    state: string;
    payer: string;
    severity: SimulatorInput["symptom"]["severity"];
    durationDays: number;
    adherencePercent: number;
    sleepHours: number;
    hasChronicCondition: boolean;
    hasPcpAssigned: boolean;
    medicationCount: number;
    hasLabs: boolean;
    freeTextRedacted: true;
  };
  outputSummary: {
    riskScore: number;
    riskLevel: SimulationResult["riskLevel"];
    recommendationCount: number;
    riskSignalCount: number;
    traceSteps: number;
    pipelineVersion: string;
  };
}

const STORAGE_KEY = "wm_audit_records";
const MAX_AUDIT_RECORDS = 25;

function makeRunId() {
  return `wm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createSimulationAuditRecord(
  input: SimulatorInput,
  result: SimulationResult,
  source: string
): SimulationAuditRecord {
  return {
    runId: makeRunId(),
    timestamp: new Date().toISOString(),
    source,
    inputSummary: {
      ageRange: input.profile.ageRange,
      state: input.profile.state,
      payer: input.insurance.payer,
      severity: input.symptom.severity,
      durationDays: input.symptom.durationDays,
      adherencePercent: input.medication.adherencePercent,
      sleepHours: input.behaviorChange.sleepHours,
      hasChronicCondition: input.profile.hasChronicCondition,
      hasPcpAssigned: input.insurance.hasPcpAssigned,
      medicationCount: input.medication.currentlyTaking.length,
      hasLabs: Boolean(input.labs.a1c || input.labs.systolicBp || input.labs.ldl),
      freeTextRedacted: true,
    },
    outputSummary: {
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      recommendationCount: result.recommendations.length,
      riskSignalCount: result.riskSignals.length,
      traceSteps: result.decisionTrace.length,
      pipelineVersion: result.pipelineVersion,
    },
  };
}

export function persistSimulationAuditRecord(record: SimulationAuditRecord) {
  if (typeof window === "undefined") return;
  try {
    const existingRaw = window.sessionStorage.getItem(STORAGE_KEY);
    const existing: SimulationAuditRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
    const next = [record, ...existing].slice(0, MAX_AUDIT_RECORDS);
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // swallow storage errors to avoid interrupting simulation flow
  }
}

