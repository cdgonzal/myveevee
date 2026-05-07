import { APP_LINKS } from "../config/links";
import SeoLandingPage from "./SeoLandingPage";

export default function Caregivers() {
  return (
    <SeoLandingPage
      pagePath={APP_LINKS.internal.caregivers}
      eyebrow="Caregiver support"
      title="Caregiver support that keeps family, questions, and next steps in one place."
      intro="VeeVee is positioned to help caregivers follow updates, understand benefits and coverage questions more clearly, and stay involved after appointments or during recovery without adding more confusion."
      audienceLabel="Family caregivers and loved ones helping someone stay on track at home"
      audienceSummary="This page targets people supporting a parent, spouse, or family member who needs clearer updates, calmer next steps, and less fragmented health admin."
      sections={[
        {
          title: "Stay involved without getting lost",
          body: "Caregivers often inherit paperwork, plan questions, and follow-up tasks all at once. VeeVee frames the experience around simpler updates and clearer next actions.",
          points: [
            "A shared view of updates and next steps",
            "Less confusion during recovery and handoffs",
            "Support that stays useful between visits",
          ],
        },
        {
          title: "Make benefits easier to understand",
          body: "The current product copy repeatedly emphasizes benefits and coverage clarity. That makes caregiver support a natural discoverability lane for people trying to understand what a plan may cover next.",
          points: [
            "Benefits and coverage are easier to understand",
            "Questions to ask can be surfaced earlier",
            "Coverage can be considered alongside the health situation",
          ],
        },
        {
          title: "Carry support past the visit",
          body: "Caregiver stress usually peaks after discharge or after an appointment, when instructions are easy to lose and families are expected to coordinate the next step quickly.",
          points: [
            "A clearer home follow-up rhythm",
            "More confidence about what to do next",
            "A calmer experience for the person giving support",
          ],
        },
      ]}
      faqTitle="Caregiver support FAQs"
      faqs={[
        {
          question: "Who is this most useful for?",
          answer: "It fits families helping someone manage appointments, recovery, benefits questions, or day-to-day follow-through after care events.",
        },
        {
          question: "Does VeeVee replace a doctor or care team?",
          answer: "No. The site positions VeeVee as a guidance and support layer that helps people understand what may matter and what to ask next.",
        },
        {
          question: "Why is this different from a generic health app?",
          answer: "The current VeeVee story is about bringing records, habits, benefits, family support, and care continuity into one connected experience instead of leaving families to piece it together alone.",
        },
        {
          question: "What should a caregiver do next?",
          answer: "The most direct next step today is to explore a scenario in VeeVee Simulator or move into the main product flow to create a health twin.",
        },
      ]}
      primaryCta={{
        label: "Try VeeVee Simulator",
        to: APP_LINKS.internal.simulator,
        destinationType: "internal",
        placement: "caregivers_hero",
        ctaName: "caregivers_try_simulator",
      }}
      secondaryCta={{
        label: "Create Your Health Twin",
        to: APP_LINKS.external.authenticatedConsole,
        destinationType: "external",
        placement: "caregivers_hero",
        ctaName: "caregivers_create_health_twin",
      }}
      relatedLinks={[
        {
          title: "Medicare guidance",
          description: "For people trying to understand next steps and coverage with Medicare in the mix.",
          to: APP_LINKS.internal.medicare,
        },
        {
          title: "Hospital to home support",
          description: "For families focused on recovery, discharge follow-up, and continuity after the visit.",
          to: APP_LINKS.internal.hospitalToHome,
        },
        {
          title: "Core features",
          description: "See the broader VeeVee platform story across guidance, family support, and care-team visibility.",
          to: APP_LINKS.internal.whyVeeVee,
        },
      ]}
    />
  );
}
