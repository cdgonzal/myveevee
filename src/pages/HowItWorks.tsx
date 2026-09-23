import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Heading, Link as CLink, SimpleGrid, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { APP_LINKS } from "../config/links";
import { HEALTH_TWIN_FAQS, PATIENT_STORY_STEPS, PATIENT_STEPS } from "./marketingContent";
import { CampaignScene } from "../components/CampaignScene";
import { StartButton } from "../components/StartButton";

export default function HowItWorks() {
  const panelBg = "bg.surface";
  const isDark = useColorModeValue(false, true);
  return (
    <Stack spacing={{ base: 8, md: 10 }} maxW="5xl" mx="auto" py={{ base: 2, md: 6 }}>
      <Stack spacing={4} maxW="3xl">
        <Text fontSize="sm" letterSpacing="0.16em" textTransform="uppercase" color="accent.soft">How It Works</Text>
        <Heading as="h1" size={{ base: "xl", md: "2xl" }}>More of the life you want.</Heading>
        <Text fontSize="lg" color="text.muted">Your goals. VeeVee helps you find a way forward.</Text>
      </Stack>

      <SimpleGrid as="section" aria-label="How VeeVee helps you" columns={{ base: 1, md: 3 }} spacing={5}>
        {PATIENT_STEPS.map((step, index) => (
          <Box key={step.number} bg={panelBg} borderWidth="1px" borderColor="border.default" borderRadius="2xl" overflow="hidden">
            {isDark && <Box position="relative" aspectRatio={5 / 4}>
              <CampaignScene subject={(["input", "simulation", "results"] as const)[index]} treatment={(["parkInput", "home", "park"] as const)[index]}
                position="absolute" inset={0} w="100%" h="100%" />
            </Box>}
            <Box p={6}>
              <Text mb={4} bg="accent.primary" color="accent.on" borderRadius="full" w={10} h={10}
                display="flex" alignItems="center" justifyContent="center" fontWeight="800">{step.number}</Text>
              <Heading as="h2" size="md" mb={2}>{step.title}</Heading>
              <Text color="text.muted">{step.detail}</Text>
            </Box>
          </Box>
        ))}
      </SimpleGrid>

      <Stack align="center" spacing={3}>
        <StartButton placement="how_it_works_steps_start" w={{ base: "full", sm: "auto" }}>Start Now</StartButton>
        <Text fontSize="sm" color="text.muted">Your twin. Your simulation.</Text>
      </Stack>

      <Stack as="section" aria-labelledby="patient-story-heading" spacing={6} bg={panelBg}
        borderWidth="1px" borderColor="border.default" borderRadius="2xl" p={{ base: 6, md: 8 }}>
        <Stack spacing={3} maxW="3xl">
          <Text fontSize="xs" fontWeight="700" letterSpacing="0.16em" textTransform="uppercase" color="accent.soft">Illustrative example</Text>
          <Heading id="patient-story-heading" as="h2" size="lg">“I want the freedom to move again.”</Heading>
          <Text color="text.muted">— Liam</Text>
        </Stack>
        <SimpleGrid as="ol" listStyleType="none" m={0} p={0} columns={{ base: 1, md: 3 }} spacing={6}>
          {PATIENT_STORY_STEPS.map((step) => (
            <Stack as="li" key={step.number} spacing={3} borderTopWidth="2px" borderColor="accent.primary" pt={4}>
              <Heading as="h3" size="sm"><Box as="span" color="accent.primary">{step.number}.</Box> {step.title}</Heading>
              <Text color="text.muted">{step.detail}</Text>
            </Stack>
          ))}
        </SimpleGrid>
        <StartButton placement="how_it_works_story_start" alignSelf={{ base: "stretch", sm: "flex-start" }}>Start Now</StartButton>
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
