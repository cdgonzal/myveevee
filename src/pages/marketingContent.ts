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

export const HEALTH_TWIN_BENEFITS = [
  { title: "Personalized guidance" },
  { title: "Products & services" },
  { title: "Coupons & discounts" },
] as const;

export const PATIENT_STEPS = [
  { number: "1", title: "Input", promise: "Tell your story", detail: "Add records, photos, or videos. Set your goal." },
  { number: "2", title: "Simulate", promise: "Explore your possibilities", detail: "Compare approaches with your digital twin." },
  { number: "3", title: "Results", promise: "Take an informed next step", detail: "Review results and explore relevant options." },
] as const;

export const PATIENT_STORY_STEPS = [
  { number: "1", title: "Input", detail: "Added his records and a movement video." },
  { number: "2", title: "Simulate", detail: "Compared options with his digital twin." },
  { number: "3", title: "Results", detail: "Shared the results with his care team." },
] as const;

export const HEALTH_TWIN_FAQS = [
  { question: "What is a Health Twin?", answer: "A digital picture of your health that brings your records, habits, and care context together. It helps you make sense of information over time." },
  { question: "Where do I get started?", answer: "Visit veevee.io to create your free account. If you already have an account, choose Log In at the top of this page." },
  { question: "What should I know before sharing health information?", answer: "Review the privacy policy and consent information in VeeVee before adding records. For questions about how your information is handled, contact our team." },
  { question: "Does VeeVee replace my care team?", answer: "No. VeeVee supports wellness, education, and preparation for care conversations. Your care team remains your source for diagnosis and treatment, and coverage questions should be confirmed with your plan." },
] as const;
