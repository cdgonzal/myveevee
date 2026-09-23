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
  { number: "1", title: "VeeVee gets to know you", detail: "Brings the information you share into context, connecting your story with what matters to you." },
  { number: "2", title: "VeeVee explores your possibilities", detail: "Uses your digital twin to explore options and possible paths toward your goals." },
  { number: "3", title: "VeeVee helps you move forward", detail: "Brings together a suggested roadmap, relevant recommendations, and next steps to consider." },
] as const;

export const PATIENT_STORY_STEPS = [
  { number: "1", title: "VeeVee gets to know Liam", detail: "Brings the information he shares into context with his goal of moving more freely." },
  { number: "2", title: "VeeVee explores his possibilities", detail: "Uses his digital twin to explore possible paths toward his mobility goal." },
  { number: "3", title: "VeeVee helps him move forward", detail: "Brings together a suggested roadmap and relevant options to discuss with his wellness team." },
] as const;

export const HEALTH_TWIN_FAQS = [
  { question: "What is a Health Twin?", answer: "A digital version of you that helps you explore possibilities and find a path toward your wellness goals." },
  { question: "Where do I get started?", answer: "Choose Start Now to create your account or sign in." },
  { question: "Does VeeVee replace my wellness team?", answer: "Not a doctor. VeeVee is for entertainment and educational purposes only. VeeVee gives you lifestyle tips, wellness prompts, and benefit reminders. We do not provide medical advice. Always talk to a licensed healthcare professional for medical decisions." },
] as const;
