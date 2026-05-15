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
  followUpQuestions?: SwcaFollowUpQuestion[];
};

export type SwcaQuestionOption = {
  id: string;
  label: string;
  reportLabel?: string;
};

export type SwcaFollowUpQuestion = {
  id: string;
  label: string;
  type: "single_select" | "multi_select";
  required: boolean;
  reportLabel?: string;
  options: SwcaQuestionOption[];
};

export type SwcaIntakeConfig = {
  formId: "swca-wellness-priority-intake";
  followUpTopRankedCount: number;
  concerns: SwcaConcern[];
  intentQuestions: SwcaFollowUpQuestion[];
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
  consentAgreement: {
    rewardCommunicationConsent: true;
    consentVersion: string;
    consentCopy: string;
    consentedAt: string;
    consentSourcePath: string;
  };
  honeypot?: string;
};

export type SwcaIntakeSubmissionResult = {
  submissionId?: string;
  wheelUrl?: string;
  mode: "mock" | "live";
};
