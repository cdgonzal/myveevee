import { describe, expect, it } from "vitest";
import { runWellnessMirrorSimulation } from "./engine";
import { DEFAULT_SIMULATOR_INPUT } from "./schema";

describe("runWellnessMirrorSimulation", () => {
  it("returns structured output contract", () => {
    const result = runWellnessMirrorSimulation(DEFAULT_SIMULATOR_INPUT);

    expect(result.pipelineVersion).toMatch(/^wm-pipeline@/);
    expect(result.policyVersion).toMatch(/^policy@/);
    expect(result.guardrailVersion).toMatch(/^guardrails@/);
    expect(result.coverageVersion).toMatch(/^coverage@/);
    expect(typeof result.riskScore).toBe("number");
    expect(["low", "moderate", "high", "urgent"]).toContain(result.riskLevel);
    expect(Array.isArray(result.riskSignals)).toBe(true);
    expect(Array.isArray(result.twinStateUpdates)).toBe(true);
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(Array.isArray(result.followUpQuestions)).toBe(true);
    expect(Array.isArray(result.decisionTrace)).toBe(true);
  });

  it("adds PCP navigation recommendation when no PCP is assigned", () => {
    const result = runWellnessMirrorSimulation({
      ...DEFAULT_SIMULATOR_INPUT,
      insurance: {
        ...DEFAULT_SIMULATOR_INPUT.insurance,
        hasPcpAssigned: false,
      },
    });

    expect(result.recommendations.some((r) => r.id === "pcp-navigation")).toBe(true);
    expect(result.riskSignals).toContain("No assigned PCP on file");
  });

  it("sorts recommendations by descending priority", () => {
    const result = runWellnessMirrorSimulation(DEFAULT_SIMULATOR_INPUT);
    const priorities = result.recommendations.map((r) => r.priority);
    const sorted = [...priorities].sort((a, b) => b - a);
    expect(priorities).toEqual(sorted);
  });
});

