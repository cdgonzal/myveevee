export type SwcaConcernId =
  | "chronic-fatigue-low-energy"
  | "weight-gain-metabolic-dysfunction"
  | "hormonal-imbalance"
  | "chronic-pain-inflammation"
  | "poor-sleep-insomnia"
  | "brain-fog-cognitive-decline"
  | "stress-anxiety-burnout"
  | "gut-health-issues"
  | "immune-dysfunction-frequent-illness"
  | "aging-longevity-optimization";

export type SwcaConcern = {
  id: SwcaConcernId;
  number: number;
  title: string;
  description: string;
};

export type SwcaIntakeSubmission = {
  formId: "swca-wellness-priority-intake";
  sourcePath: string;
  pageUrl: string;
  clientSubmittedAt: string;
  userAgent: string;
  selectedConcernIds: SwcaConcernId[];
  rankedConcernIds: SwcaConcernId[];
  concernsSnapshot: SwcaConcern[];
  honeypot?: string;
};

export type SwcaIntakeSubmissionResult = {
  submissionId?: string;
  mode: "mock" | "live";
};
