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
  { title: "Keep your health story together", detail: "Your records, daily habits, and care context form a more connected picture of you." },
  { title: "Understand what changes", detail: "Follow patterns over time and turn scattered information into questions you can discuss with your care team." },
  { title: "Feel prepared for what comes next", detail: "Get plain-language guidance to help you organize questions, follow up after visits, and support someone you care for." },
] as const;

export const PATIENT_STEPS = [
  { number: "1", title: "Input", promise: "Tell your story", detail: "Upload photos, videos, or medical records. Check in on how you’re feeling and set a goal you want to work toward." },
  { number: "2", title: "Simulate", promise: "Explore your possibilities", detail: "Run simulations with your digital twin to compare different approaches toward your goal." },
  { number: "3", title: "Results", promise: "Take an informed next step", detail: "Review the projected results. Share them with your medical team, or explore a relevant product or service." },
] as const;

export const MOBILITY_EXAMPLE_STEPS = [
  { number: "1", title: "Input", detail: "Alex wants to walk comfortably and enjoy outings again. He adds his records, uploads a movement video, and describes his current limitations and goal." },
  { number: "2", title: "Simulate", detail: "He compares different approaches using his digital twin, exploring how each could support his mobility goal." },
  { number: "3", title: "Results", detail: "He reviews the projected differences, identifies an option worth exploring, and shares the comparison with his medical team for discussion." },
] as const;

export const HEALTH_TWIN_FAQS = [
  { question: "What is a Health Twin?", answer: "A digital picture of your health that brings your records, habits, and care context together. It helps you make sense of information over time." },
  { question: "Where do I get started?", answer: "Visit veevee.io to create your free account. If you already have an account, choose Log In at the top of this page." },
  { question: "What should I know before sharing health information?", answer: "Review the privacy policy and consent information in VeeVee before adding records. For questions about how your information is handled, contact our team." },
  { question: "Does VeeVee replace my care team?", answer: "No. VeeVee supports wellness, education, and preparation for care conversations. Your care team remains your source for diagnosis and treatment, and coverage questions should be confirmed with your plan." },
] as const;
