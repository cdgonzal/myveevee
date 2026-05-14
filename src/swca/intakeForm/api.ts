import type { SwcaIntakeSubmission, SwcaIntakeSubmissionResult } from "./types";

type SwcaIntakeApiResponse = {
  submissionId?: string;
  wheelUrl?: string;
  message?: string;
};

const SWCA_INTAKE_API_URL = import.meta.env.VITE_SWCA_INTAKE_API_URL as string | undefined;

export async function submitSwcaIntake(
  submission: SwcaIntakeSubmission
): Promise<SwcaIntakeSubmissionResult> {
  const endpoint = SWCA_INTAKE_API_URL?.trim();

  if (!endpoint) {
    console.info("SWCA intake mock submission", submission);
    return {
      mode: "mock",
      submissionId: "local-preview",
      wheelUrl: "/swca/wheel?sid=local-preview&token=local-preview-token-for-reward-wheel",
    };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(submission),
  });

  const payload = (await response.json().catch(() => ({}))) as SwcaIntakeApiResponse;

  if (!response.ok) {
    throw new Error(payload.message ?? "The intake form could not be submitted.");
  }

  return {
    mode: "live",
    submissionId: payload.submissionId,
    wheelUrl: payload.wheelUrl,
  };
}
