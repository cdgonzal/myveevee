import { APP_LINKS } from "../config/links";
import SeoLandingPage from "./SeoLandingPage";

export default function HospitalToHome() {
  return (
    <SeoLandingPage
      pagePath={APP_LINKS.internal.hospitalToHome}
      eyebrow="Hospital to home"
      title="Hospital-to-home support for discharge follow-up, family visibility, and connected care."
      intro="VeeVee repeatedly positions its value around continuity after the visit. This page focuses that story for people searching around discharge follow-up, home recovery, and staying connected once someone leaves the hospital."
      audienceLabel="Patients, families, and operators focused on the transition from bedside to home"
      audienceSummary="This page is grounded in the existing product language around hospital-to-home continuity, family involvement, care-team visibility, and smoother follow-through after discharge."
      sections={[
        {
          title: "Keep the care story moving after discharge",
          body: "One of the clearest product themes in the repo is that care should not stop when the visit ends. That makes hospital-to-home continuity a strong search-intent page.",
          points: [
            "People stay connected after they go home",
            "Families can stay informed and involved",
            "Care teams get a clearer view of progress",
          ],
        },
        {
          title: "Reduce follow-up confusion at home",
          body: "The gap after discharge often comes from lost instructions, unclear priorities, and benefits questions that show up once someone is back home.",
          points: [
            "Clearer next steps after the visit",
            "Better support between visits",
            "Fewer fragmented handoffs across people and teams",
          ],
        },
        {
          title: "Support patient and operator value together",
          body: "The public site also ties this continuity story to hospital value through RPM and RTM-aligned workflows, labor efficiency, and lower operational risk.",
          points: [
            "A patient-facing support story",
            "A care-team visibility story",
            "A hospital workflow and value story",
          ],
        },
      ]}
      faqTitle="Hospital-to-home FAQs"
      faqs={[
        {
          question: "What does hospital-to-home mean here?",
          answer: "It refers to the period after a person leaves the hospital, when follow-up, home recovery, family coordination, and next-step guidance still matter.",
        },
        {
          question: "Is this page only for hospitals?",
          answer: "No. It is useful for patients and families too, because the public VeeVee story is about keeping everyone connected after the visit.",
        },
        {
          question: "Does VeeVee claim to replace discharge instructions?",
          answer: "No. The current product copy supports a guidance and continuity layer, not a replacement for care-team judgment or formal clinical instructions.",
        },
        {
          question: "Where should someone go from here?",
          answer: "The best next step depends on intent: families may want the caregiver page, operators may want the technology or features page, and users can try the simulator directly.",
        },
      ]}
      primaryCta={{
        label: "Explore Core Features",
        to: APP_LINKS.internal.whyVeeVee,
        destinationType: "internal",
        placement: "hospital_to_home_hero",
        ctaName: "hospital_to_home_explore_features",
      }}
      secondaryCta={{
        label: "Contact VeeVee",
        to: APP_LINKS.internal.contact,
        destinationType: "internal",
        placement: "hospital_to_home_hero",
        ctaName: "hospital_to_home_contact",
      }}
      relatedLinks={[
        {
          title: "Caregiver support",
          description: "See the family-support angle for people helping someone recover or stay on track at home.",
          to: APP_LINKS.internal.caregivers,
        },
        {
          title: "Medicare guidance",
          description: "See the coverage-and-next-steps lane for older adults and families.",
          to: APP_LINKS.internal.medicare,
        },
        {
          title: "Technology",
          description: "See how the site describes the infrastructure supporting bedside-to-home continuity.",
          to: APP_LINKS.internal.technology,
        },
      ]}
    />
  );
}
