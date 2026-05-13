import type { SwcaConcern } from "./types";

export const SWCA_INTAKE_FORM_ID = "swca-wellness-priority-intake" as const;

export const SWCA_CONCERNS: SwcaConcern[] = [
  {
    id: "chronic-fatigue-low-energy",
    number: 1,
    title: "Chronic Fatigue / Low Energy",
    description: "Feelings of constant tiredness, low stamina, brain fog, or difficulty getting through the day.",
  },
  {
    id: "weight-gain-metabolic-dysfunction",
    number: 2,
    title: "Weight Gain / Metabolic Dysfunction",
    description:
      "Difficulty losing weight, especially around the midsection, slow metabolism, or concerns about blood sugar/insulin.",
  },
  {
    id: "hormonal-imbalance",
    number: 3,
    title: "Hormonal Imbalance",
    description: "Symptoms such as low libido, mood changes, hot flashes, PMS, low testosterone, or other hormone-related concerns.",
  },
  {
    id: "chronic-pain-inflammation",
    number: 4,
    title: "Chronic Pain and Inflammation",
    description: "Ongoing pain, stiffness, joint pain, back pain, or inflammation that interferes with daily activities.",
  },
  {
    id: "poor-sleep-insomnia",
    number: 5,
    title: "Poor Sleep / Insomnia",
    description: "Trouble falling asleep, staying asleep, or waking up feeling unrefreshed and tired.",
  },
  {
    id: "brain-fog-cognitive-decline",
    number: 6,
    title: "Brain Fog / Cognitive Decline",
    description: "Difficulty with memory, concentration, focus, or mental clarity.",
  },
  {
    id: "stress-anxiety-burnout",
    number: 7,
    title: "Stress, Anxiety, and Burnout",
    description: "High stress levels, anxiety, irritability, or feeling overwhelmed and unable to recharge.",
  },
  {
    id: "gut-health-issues",
    number: 8,
    title: "Gastrointestinal / Gut Health Issues",
    description: "Bloating, constipation, reflux, IBS-like symptoms, or food sensitivities.",
  },
  {
    id: "immune-dysfunction-frequent-illness",
    number: 9,
    title: "Immune Dysfunction / Frequent Illness",
    description: "Getting sick often, slow healing, chronic inflammation, or autoimmune-type symptoms.",
  },
  {
    id: "aging-longevity-optimization",
    number: 10,
    title: "Aging / Longevity Optimization",
    description: "Desire to improve overall vitality, prevent age-related decline, and optimize long-term health and longevity.",
  },
];
