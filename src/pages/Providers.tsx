import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, Container, Heading, Image, Link, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { trackCtaClick } from "../analytics/trackCtaClick";
import { CampaignScene } from "../components/CampaignScene";
import { APP_LINKS } from "../config/links";

const PATIENT_JOURNEY = [
  { title: "Tell their story", label: "Input", detail: "Patients add their records, photos, or videos and choose a wellness goal.", subject: "input", treatment: "parkInput" },
  { title: "Explore possibilities", label: "Explore", detail: "Their Health Twin helps them explore approaches related to their goals.", subject: "simulation", treatment: "home" },
  { title: "Bring questions to you", label: "Results", detail: "Patients review their results and bring questions and next steps to a conversation with your team.", subject: "results", treatment: "park" },
] as const;

const PRACTICE_STEPS = [
  { title: "Make the introduction", detail: "Introduce VeeVee during a visit or in your patient communications. Invite patients to explore their own Health Twin." },
  { title: "Let patients explore", detail: "Patients start their free account and explore their goals through the patient experience." },
  { title: "Keep the conversation going", detail: "Invite patients to discuss what they explored and the questions they want to ask at their next visit." },
];

const PROVIDER_FAQS = [
  { question: "Is the Health Twin free for patients?", answer: "Yes. Patients can create their Health Twin for free through VeeVee. Practice partnership arrangements can be discussed separately with our team." },
  { question: "How can our team get familiar with VeeVee?", answer: "Start with the patient experience to see the Input, Simulate, and Results journey. Then contact us to discuss how you would introduce VeeVee in your practice." },
  { question: "What does our practice need to get started?", answer: "Tell us about your practice and how you would like to introduce VeeVee to patients. We can discuss the setup, patient communications, and support that would fit your team." },
  { question: "Will our team automatically receive patient information?", answer: "This patient introduction does not promise automatic sharing with your practice. Discuss access, consent, and any integration requirements with our team before planning a connected workflow." },
  { question: "Does VeeVee replace our clinical guidance?", answer: "No. VeeVee is for entertainment and educational purposes and does not provide medical advice. Patients should discuss medical decisions with a licensed healthcare professional." },
];

const PARTNERSHIP_LABEL = "Bring VeeVee to Your Practice";
const PATIENT_LABEL = "See the Patient Experience";

export default function Providers() {
  const trackLink = (ctaText: string, destinationUrl: string, placement: string) => trackCtaClick({
    ctaName: destinationUrl === APP_LINKS.internal.contact ? "providers_contact" : "providers_patient_experience",
    ctaText, placement, destinationType: "internal", destinationUrl, pagePath: APP_LINKS.internal.providers,
  });

  return (
    <Stack spacing={0}>
      <Box as="section" aria-labelledby="providers-heading" position="relative" isolation="isolate" bg="bg.canvas"
        display="flex" flexDirection="column" justifyContent="center" w="full" maxW="1920px" mx="auto"
        aspectRatio={{ xl: 2 }}>
        <Box as="picture" display="block" position={{ base: "relative", xl: "absolute" }} inset={{ xl: 0 }}
          order={2} zIndex={{ xl: -1 }} w="full" aspectRatio={{ base: 1.2, md: 2 }} h={{ xl: "full" }}>
          <source media="(max-width: 1279px)" srcSet="/brand/2026/futuristic/provider-desktop-health-twin-v1-mobile.webp" />
          <Image ignoreFallback src="/brand/2026/futuristic/provider-desktop-health-twin-v1.webp"
            alt="Concept illustration of a physician talking with a digital Health Twin projected above her desk"
            w="full" h="full" objectFit="cover" objectPosition="right bottom"
            loading="eager" decoding="async" {...{ fetchpriority: "high" }} />
        </Box>
        <Box position="absolute" inset={0} zIndex={-1} pointerEvents="none" display={{ base: "none", xl: "block" }}
          bg="linear-gradient(90deg, rgba(3, 7, 37, 0.90) 0%, rgba(3, 7, 37, 0.75) 25%, rgba(3, 7, 37, 0.35) 39%, transparent 49%)" />
        <Container maxW="7xl" px={{ base: 4, md: 8, xl: 12 }} py={{ base: 10, md: 12 }}>
          <Stack spacing={{ base: 5, md: 6 }} maxW={{ base: "2xl", xl: "440px" }} position="relative" zIndex={1}>
            <Text fontSize={{ base: "xs", md: "sm" }} letterSpacing="0.16em" textTransform="uppercase" color="accent.soft">For clinics &amp; practices</Text>
            <Heading id="providers-heading" as="h1" fontSize={{ base: "4xl", md: "5xl", xl: "54px" }} lineHeight="1.08" letterSpacing="-0.04em">
              Your practice.{" "}<Box as="span" display="block" color="accent.soft">Their Health Twin.</Box>
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} lineHeight="1.65" color="text.muted" maxW="lg">
              Introduce patients to VeeVee, a free, personalized Health Twin to explore their wellness goals and prepare questions for your team.
            </Text>
            <Stack spacing={3} align={{ base: "stretch", sm: "flex-start" }}>
              <Button as={RouterLink} to={APP_LINKS.internal.contact} size="lg" borderRadius="full" px={{ base: 4, md: 7 }}
                whiteSpace="normal" height="auto" minH="52px" py={3}
                onClick={() => trackLink(PARTNERSHIP_LABEL, APP_LINKS.internal.contact, "providers_hero_contact")}>
                {PARTNERSHIP_LABEL}
              </Button>
              <Link as={RouterLink} to={APP_LINKS.internal.howItWorks} color="accent.soft" minH="44px" display="inline-flex" alignItems="center"
                justifyContent={{ base: "center", sm: "flex-start" }} textDecoration="underline" fontSize="sm"
                onClick={() => trackLink(PATIENT_LABEL, APP_LINKS.internal.howItWorks, "providers_hero_patient_experience")}>
                {PATIENT_LABEL} <Box as="span" ml={2} aria-hidden="true">→</Box>
              </Link>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxW="6xl" px={{ base: 4, md: 8 }} py={{ base: 12, md: 20 }}>
        <Stack spacing={{ base: 14, md: 20 }}>
          <Stack as="section" aria-labelledby="patient-experience-heading" spacing={7}>
            <Stack spacing={3} maxW="2xl">
              <Text fontSize="xs" letterSpacing="0.16em" textTransform="uppercase" color="accent.soft">The patient experience</Text>
              <Heading id="patient-experience-heading" as="h2" size="xl">Their story. A starting point for your conversation.</Heading>
              <Text color="text.muted" fontSize="lg">Give patients a way to explore what matters to them—and bring those questions back to your team.</Text>
            </Stack>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
              {PATIENT_JOURNEY.map((step, index) => (
                <Box key={step.label} bg="bg.surface" borderWidth="1px" borderColor="border.default" borderRadius="2xl" overflow="hidden">
                  <CampaignScene subject={step.subject} treatment={step.treatment} aspectRatio={5 / 4} />
                  <Stack p={6} spacing={3}>
                    <Text fontSize="xs" letterSpacing="0.12em" textTransform="uppercase" color="accent.soft">0{index + 1} / {step.label}</Text>
                    <Heading as="h3" size="md">{step.title}</Heading>
                    <Text color="text.muted">{step.detail}</Text>
                  </Stack>
                </Box>
              ))}
            </SimpleGrid>
          </Stack>

          <SimpleGrid as="section" aria-labelledby="practice-role-heading" columns={{ base: 1, lg: 2 }} gap={{ base: 7, lg: 14 }}>
            <Stack spacing={4}>
              <Text fontSize="xs" letterSpacing="0.16em" textTransform="uppercase" color="accent.soft">Your practice’s role</Text>
              <Heading id="practice-role-heading" as="h2" size="xl">Start with an introduction.</Heading>
              <Text color="text.muted" fontSize="lg">You know your patients. Introduce VeeVee in a way that fits your conversations, then let them explore their own goals.</Text>
              <Text color="text.muted">See the patient journey first, and talk with us about how it could fit your practice.</Text>
              <Link as={RouterLink} to={APP_LINKS.internal.howItWorks} color="accent.soft" textDecoration="underline" minH="44px" display="inline-flex" alignItems="center"
                onClick={() => trackLink(PATIENT_LABEL, APP_LINKS.internal.howItWorks, "providers_practice_patient_experience")}>
                {PATIENT_LABEL} <Box as="span" ml={2} aria-hidden="true">→</Box>
              </Link>
            </Stack>
            <Stack as="ol" listStyleType="none" m={0} p={0} spacing={6}>
              {PRACTICE_STEPS.map((step, index) => (
                <Stack as="li" key={step.title} direction="row" spacing={4} borderTopWidth="1px" borderColor="border.default" pt={5}>
                  <Text color="accent.soft" fontSize="sm" fontWeight="700" pt={1}>0{index + 1}</Text>
                  <Stack spacing={2}>
                    <Heading as="h3" size="md">{step.title}</Heading>
                    <Text color="text.muted">{step.detail}</Text>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </SimpleGrid>

          <Stack as="section" aria-labelledby="provider-questions-heading" spacing={5}>
            <Heading id="provider-questions-heading" as="h2" size="xl">A few things your team may ask.</Heading>
            <Accordion allowMultiple>
              {PROVIDER_FAQS.map((faq) => (
                <AccordionItem key={faq.question} borderColor="border.default">
                  <Heading as="h3" size="sm"><AccordionButton py={5} px={0} gap={4}>
                    <Box as="span" flex="1" textAlign="left" fontWeight="700">{faq.question}</Box><AccordionIcon />
                  </AccordionButton></Heading>
                  <AccordionPanel px={0} pb={5} color="text.muted" maxW="3xl">{faq.answer}</AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Stack>

          <Stack as="section" aria-labelledby="partnership-heading" align="center" spacing={5} textAlign="center"
            p={{ base: 6, md: 12 }} bg="bg.surface" borderWidth="1px" borderColor="border.default" borderRadius="2xl">
            <Text fontSize="xs" letterSpacing="0.16em" textTransform="uppercase" color="accent.soft">Let’s make the introduction</Text>
            <Heading id="partnership-heading" as="h2" size="xl">Bring VeeVee into your patient conversations.</Heading>
            <Text color="text.muted" maxW="2xl">Tell us about your practice, your patients, and how you would like to introduce VeeVee. Let’s discuss the setup and support that would fit your team.</Text>
            <Button as={RouterLink} to={APP_LINKS.internal.contact} size="lg" borderRadius="full" px={{ base: 4, md: 8 }}
              whiteSpace="normal" height="auto" minH="52px" py={3} w={{ base: "full", sm: "auto" }}
              onClick={() => trackLink(PARTNERSHIP_LABEL, APP_LINKS.internal.contact, "providers_bottom_cta")}>
              {PARTNERSHIP_LABEL}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Stack>
  );
}
