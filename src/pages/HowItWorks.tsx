import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, Heading, Link as CLink, SimpleGrid, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { trackCtaClick } from "../analytics/trackCtaClick";
import { APP_LINKS } from "../config/links";
import { HEALTH_TWIN_FAQS, PATIENT_STEPS } from "./marketingContent";

export default function HowItWorks() {
  const panelBg = useColorModeValue("white", "surface.800");
  return (
    <Stack spacing={{ base: 8, md: 10 }} maxW="5xl" mx="auto" py={{ base: 2, md: 6 }}>
      <Stack spacing={4} maxW="3xl">
        <Text fontSize="sm" letterSpacing="0.16em" textTransform="uppercase" color="accent.soft">How It Works</Text>
        <Heading as="h1" size={{ base: "xl", md: "2xl" }}>Your Health Twin, in 3 simple steps.</Heading>
        <Text fontSize="lg" color="text.muted">One place for your health story, with guidance to help you understand it and prepare for what comes next.</Text>
      </Stack>

      <SimpleGrid as="section" aria-label="The three steps" columns={{ base: 1, md: 3 }} spacing={5}>
        {PATIENT_STEPS.map((step) => (
          <Box key={step.number} p={6} bg={panelBg} borderWidth="1px" borderColor="border.default" borderRadius="2xl">
            <Text mb={4} bg="accent.primary" color="white" borderRadius="full" w={10} h={10}
              display="flex" alignItems="center" justifyContent="center" fontWeight="800">{step.number}</Text>
            <Heading as="h2" size="md" mb={3}>{step.title}</Heading>
            <Text color="text.muted">{step.detail}</Text>
          </Box>
        ))}
      </SimpleGrid>

      <Stack spacing={4} align="center" textAlign="center" bg={panelBg} borderRadius="2xl" p={{ base: 6, md: 8 }}>
        <Heading as="h2" size="lg">Ready to create your Health Twin?</Heading>
        <Text color="text.muted">Continue to VeeVee to create your free account.</Text>
        <Button as="a" href={APP_LINKS.external.authenticatedConsole} size="lg" borderRadius="full" px={8}
          onClick={() => trackCtaClick({ ctaName: "how_it_works_create_health_twin", ctaText: "Create a Health Twin",
            placement: "how_it_works_bottom_cta", destinationType: "external", destinationUrl: APP_LINKS.external.authenticatedConsole,
            pagePath: APP_LINKS.internal.howItWorks })}>
          Create a Health Twin
        </Button>
      </Stack>

      <Stack as="section" aria-labelledby="questions-heading" spacing={4}>
        <Heading id="questions-heading" as="h2" size="lg">A few things to know</Heading>
        <Accordion allowMultiple>
          {HEALTH_TWIN_FAQS.map((faq) => (
            <AccordionItem key={faq.question} borderColor="border.default">
              <Heading as="h3" size="sm">
                <AccordionButton py={5} px={2}><Box as="span" flex="1" textAlign="left" fontWeight="700">{faq.question}</Box><AccordionIcon /></AccordionButton>
              </Heading>
              <AccordionPanel px={2} pb={5} color="text.muted">{faq.answer}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
        <Text fontSize="sm" color="text.muted">
          <CLink as={RouterLink} to={APP_LINKS.internal.terms} textDecoration="underline">Terms &amp; Disclaimers</CLink>
          {" · "}<CLink as={RouterLink} to={APP_LINKS.internal.contact} textDecoration="underline">Contact our team</CLink>
        </Text>
      </Stack>

    </Stack>
  );
}
