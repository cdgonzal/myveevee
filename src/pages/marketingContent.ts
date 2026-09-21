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
  { number: "3", title: "Results", detail: "Found solutions and a roadmap to discuss with his wellness team." },
] as const;

export const HEALTH_TWIN_FAQS = [
  { question: "What is a Health Twin?", answer: "A digital version of you that helps you explore possibilities and find a path toward your wellness goals." },
  { question: "Where do I get started?", answer: "Choose Start to create your free account or sign in." },
  { question: "Does VeeVee replace my wellness team?", answer: "Not a doctor. VeeVee is for entertainment and educational purposes only. VeeVee gives you lifestyle tips, wellness prompts, and benefit reminders. We do not provide medical advice. Always talk to a licensed healthcare professional for medical decisions." },
] as const;
