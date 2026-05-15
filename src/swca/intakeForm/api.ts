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

  console.info("SWCA intake submit request", {
    endpoint,
    origin: window.location.origin,
    sourcePath: submission.sourcePath,
    formId: submission.formId,
    selectedCount: submission.selectedConcernIds.length,
    rankedCount: submission.rankedConcernIds.length,
  });

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submission),
    });
  } catch (error) {
    console.error("SWCA intake submit network failure", {
      endpoint,
      origin: window.location.origin,
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw new Error("Network or CORS failure while submitting. Please refresh and try again.");
  }

  const payload = (await response.json().catch(() => ({}))) as SwcaIntakeApiResponse;

  console.info("SWCA intake submit response", {
    status: response.status,
    ok: response.ok,
    submissionId: payload.submissionId,
    hasWheelUrl: Boolean(payload.wheelUrl),
    message: payload.message,
  });

  if (!response.ok) {
    throw new Error(payload.message ?? "The intake form could not be submitted.");
  }

  return {
    mode: "live",
    submissionId: payload.submissionId,
    wheelUrl: payload.wheelUrl,
  };
}
