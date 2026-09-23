import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, Container, Heading, Image, Link, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { trackCtaClick } from "../analytics/trackCtaClick";
import { APP_LINKS } from "../config/links";

const PROVIDER_BENEFITS = [
  { title: "See the bigger picture", detail: "Bring patient information and updates together." },
  { title: "Understand what’s changed", detail: "Follow the patient’s story over time." },
  { title: "Focus on the conversation", detail: "Come prepared with useful context." },
];

const PROVIDER_FAQS = [
  { question: "Who is VeeVee for?", answer: "VeeVee connects the patient’s Health Twin story with the conversations they have with their care team. Contact us to learn more about VeeVee for your clinic or practice." },
  { question: "How can our practice learn more?", answer: "Use the short inquiry form to tell us about your practice. Our team will follow up to discuss your questions and next steps." },
  { question: "Does VeeVee replace our care team?", answer: "No. VeeVee supports more informed conversations. Patients should continue to discuss medical decisions with a licensed healthcare professional." },
];

const PARTNERSHIP_LABEL = "Connect With Our Team";
const PROVIDER_CONTACT = `${APP_LINKS.internal.contact}?topic=providers`;
const PATIENT_LABEL = "See the Patient Experience";

export default function Providers() {
  const trackLink = (ctaText: string, destinationUrl: string, placement: string) => trackCtaClick({
    ctaName: destinationUrl === PROVIDER_CONTACT ? "providers_contact" : "providers_patient_experience",
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
              More context.{" "}<Box as="span" display="block" color="accent.soft">Better conversations.</Box>
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} lineHeight="1.65" color="text.muted" maxW="lg">
              VeeVee is designed to bring patient updates into a clearer view, helping your team prepare for more informed conversations.
            </Text>
            <Stack spacing={3} align={{ base: "stretch", sm: "flex-start" }}>
              <Button as={RouterLink} to={PROVIDER_CONTACT} size="lg" borderRadius="full" px={{ base: 4, md: 7 }}
                whiteSpace="normal" height="auto" minH="52px" py={3}
                onClick={() => trackLink(PARTNERSHIP_LABEL, PROVIDER_CONTACT, "providers_hero_contact")}>
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
          <Stack as="section" aria-labelledby="provider-benefits-heading" spacing={7}>
            <Stack spacing={3} maxW="2xl">
              <Text fontSize="xs" letterSpacing="0.16em" textTransform="uppercase" color="accent.soft">The patient story, in perspective</Text>
              <Heading id="provider-benefits-heading" as="h2" size="xl">A clearer view of the person in front of you.</Heading>
              <Text color="text.muted" fontSize="lg">Patient updates are part of a bigger story. VeeVee is designed to help bring that story into focus.</Text>
            </Stack>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
              {PROVIDER_BENEFITS.map((benefit, index) => (
                <Stack key={benefit.title} p={6} spacing={4} bg="bg.surface" borderWidth="1px" borderColor="border.default" borderRadius="2xl">
                  <Text fontSize="xs" letterSpacing="0.12em" color="accent.soft">0{index + 1}</Text>
                  <Heading as="h3" size="md">{benefit.title}</Heading>
                  <Text color="text.muted">{benefit.detail}</Text>
                </Stack>
              ))}
            </SimpleGrid>
          </Stack>

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
            p={{ base: 6, md: 12 }} bg="bg.canvas"
            bgImage="linear-gradient(rgba(3, 7, 37, 0.72), rgba(3, 7, 37, 0.72)), url('/brand/2026/futuristic/future-examination-room.webp')"
            bgSize="cover" bgPosition={{ base: "65% center", md: "center" }} bgRepeat="no-repeat"
            borderWidth="1px" borderColor="border.default" borderRadius="2xl">
            <Text fontSize="xs" letterSpacing="0.16em" textTransform="uppercase" color="accent.soft">Let’s connect</Text>
            <Heading id="partnership-heading" as="h2" size="xl">Explore VeeVee for your practice.</Heading>
            <Text color="text.muted" maxW="2xl">Tell us a little about your practice. Our team will follow up to answer your questions and discuss next steps.</Text>
            <Button as={RouterLink} to={PROVIDER_CONTACT} size="lg" borderRadius="full" px={{ base: 4, md: 8 }}
              whiteSpace="normal" height="auto" minH="52px" py={3} w={{ base: "full", sm: "auto" }}
              onClick={() => trackLink(PARTNERSHIP_LABEL, PROVIDER_CONTACT, "providers_bottom_cta")}>
              {PARTNERSHIP_LABEL}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Stack>
  );
}
