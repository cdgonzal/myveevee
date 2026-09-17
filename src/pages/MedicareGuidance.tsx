import { APP_LINKS } from "../config/links";
import SeoLandingPage from "./SeoLandingPage";

export default function MedicareGuidance() {
  return (
    <SeoLandingPage
      pagePath={APP_LINKS.internal.medicare}
      eyebrow="Medicare guidance"
      title="A simpler way to understand Medicare-related next steps, questions, and coverage context."
      intro="VeeVee is positioned for people who want a calmer way to understand what may matter after a visit, what questions to ask, and how benefits or coverage may shape the next step."
      audienceLabel="Older adults, families, and Medicare users who want clearer follow-up"
      audienceSummary="This lane is grounded in the existing testimonial and homepage copy about simpler Medicare coverage understanding, easy questions, and more confidence after appointments."
      sections={[
        {
          title: "Start with plain-language guidance",
          body: "The current site already emphasizes simple questions, calmer next steps, and less confusing answers. That matters for Medicare users who often feel overwhelmed after appointments.",
          points: [
            "Simple setup and easy questions",
            "Clearer next-step guidance after a visit",
            "Less intimidating language around follow-up",
          ],
        },
        {
          title: "Keep coverage in the conversation",
          body: "VeeVee brings benefits and plan context into your health story so you can better understand your coverage questions and next steps.",
          points: [
            "Benefits can be considered alongside symptoms or routines",
            "Users can see what questions to ask next",
            "Coverage context stays connected to the care story",
          ],
        },
        {
          title: "Build confidence after appointments",
          body: "Medicare users and families often leave visits with paperwork, instructions, and uncertainty. VeeVee aims to make that follow-up feel simpler and more manageable.",
          points: [
            "More confidence after appointments",
            "A calmer, easier-to-follow experience",
            "Less reliance on memory alone once someone gets home",
          ],
        },
      ]}
      faqTitle="Medicare guidance FAQs"
      faqs={[
        {
          question: "Does VeeVee guarantee Medicare coverage?",
          answer: "No. The current site explicitly says benefits and coverage are not guaranteed and depend on the underlying plan.",
        },
        {
          question: "What can someone use VeeVee for today?",
          answer: "The current product story supports using VeeVee to understand what may matter, what to do next, and what coverage-related questions to ask.",
        },
        {
          question: "Is this only for older adults?",
          answer: "No. This page is just one search-intent lane. The broader VeeVee product also speaks to caregivers, working adults, and hospital-connected care use cases.",
        },
        {
          question: "What is the best next action from this page?",
          answer: "See how VeeVee works, then continue to create your account when you are ready.",
        },
      ]}
      primaryCta={{
        label: "See How It Works",
        to: APP_LINKS.internal.howItWorks,
        destinationType: "internal",
        placement: "medicare_hero",
        ctaName: "medicare_how_it_works",
      }}
      secondaryCta={{
        label: "Contact VeeVee",
        to: APP_LINKS.internal.contact,
        destinationType: "internal",
        placement: "medicare_hero",
        ctaName: "medicare_contact",
      }}
      relatedLinks={[
        {
          title: "Caregiver support",
          description: "For adult children or loved ones helping someone manage follow-up and benefits questions.",
          to: APP_LINKS.internal.caregivers,
        },
        {
          title: "Hospital to home support",
          description: "For people focused on what happens after discharge and how follow-through continues at home.",
          to: APP_LINKS.internal.hospitalToHome,
        },
        {
          title: "How It Works",
          description: "See how VeeVee connects your health context to clearer next steps.",
          to: APP_LINKS.internal.howItWorks,
        },
      ]}
    />
  );
}
