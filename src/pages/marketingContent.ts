export const HOSPITAL_VALUE_ROWS = [
  {
    rollout: "75-bed rollout",
    monthlyCost: "$14,925",
    revenue: "$10,000",
    laborSavings: "$18,000",
    netImpact: "+$13,075",
    payback: "Month 1",
    valueNote: "Cash-flow positive from the first invoice under the subscription model.",
  },
  {
    rollout: "150-bed rollout",
    monthlyCost: "$29,850",
    revenue: "$20,000",
    laborSavings: "$54,000",
    netImpact: "+$44,150",
    payback: "Month 1",
    valueNote: "Plus avoided fall-event exposure, documentation lift, and broader vigilance coverage.",
  },
] as const;

export const PATIENT_STEPS = [
  {
    number: "1",
    title: "Tell us what's happening",
    detail: "Type it. Say it. Upload a photo. VeeVee listens and understands. Free and instant.",
  },
  {
    number: "2",
    title: "Get clear guidance",
    detail: "See what might be going on and what to do next. Simple, personalized answers for free.",
  },
  {
    number: "3",
    title: "Take the next step",
    detail: "Know where to go, what to ask, and whether your plan covers it.",
  },
] as const;
