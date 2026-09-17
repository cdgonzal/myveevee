import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, Heading, SimpleGrid, Stack, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { trackCtaClick } from "../analytics/trackCtaClick";
import { APP_LINKS } from "../config/links";
import { HOSPITAL_VALUE_ROWS } from "./marketingContent";

const PROVIDER_BENEFITS = [
  { title: "A clearer care picture", detail: "Bring patient context, questions, and follow-up into a more connected conversation with patients and families." },
  { title: "Support for care workflows", detail: "Explore monitoring, documentation, and escalation workflows that fit how your team works." },
  { title: "Continuity after the visit", detail: "Help patients stay engaged with their health story and prepare for the next conversation with your team." },
];

export default function Providers() {
  const panelBg = useColorModeValue("white", "surface.800");
  const contact = () => trackCtaClick({ ctaName: "providers_contact", ctaText: "Discuss a Partnership",
    placement: "providers_bottom_cta", destinationType: "internal", destinationUrl: APP_LINKS.internal.contact,
    pagePath: APP_LINKS.internal.providers });
  return (
    <Stack spacing={{ base: 8, md: 10 }} maxW="5xl" mx="auto" py={{ base: 2, md: 6 }}>
      <Stack spacing={4} maxW="3xl">
        <Text fontSize="sm" letterSpacing="0.16em" textTransform="uppercase" color="accent.soft">For Providers</Text>
        <Heading as="h1" size={{ base: "xl", md: "2xl" }}>Connected care, from your team to their everyday life.</Heading>
        <Text fontSize="lg" color="text.muted">Explore VeeVee for clinics, hospitals, and care teams. Start with your workflow, your patients, and the outcomes you want to improve.</Text>
      </Stack>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
        {PROVIDER_BENEFITS.map((benefit) => (
          <Box key={benefit.title} p={6} bg={panelBg} borderWidth="1px" borderColor="border.default" borderRadius="2xl">
            <Heading as="h2" size="md" mb={3}>{benefit.title}</Heading>
            <Text color="text.muted">{benefit.detail}</Text>
          </Box>
        ))}
      </SimpleGrid>
      <Stack as="section" spacing={4}>
        <Heading as="h2" size="lg">Plan a rollout around your needs.</Heading>
        <Text color="text.muted">Review deployment, integrations, staffing, and success measures together before deciding what fits.</Text>
        <Accordion allowMultiple>
          <AccordionItem borderColor="border.default">
            <Heading as="h3" size="sm"><AccordionButton py={5}><Box as="span" flex="1" textAlign="left" fontWeight="700">Technology and deployment</Box><AccordionIcon /></AccordionButton></Heading>
            <AccordionPanel pb={5}>
              <Stack spacing={3} color="text.muted">
                <Text>VeeVee is designed for local processing of bedside video, timely signals, and workloads spanning multiple rooms. Deployment requirements depend on your environment and integrations.</Text>
                <Text>Discuss data handling, access, consent, and escalation paths with our team as part of the rollout. Monitoring supports your staff and their clinical judgment.</Text>
              </Stack>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem borderColor="border.default">
            <Heading as="h3" size="sm"><AccordionButton py={5}><Box as="span" flex="1" textAlign="left" fontWeight="700">Illustrative hospital economics</Box><AccordionIcon /></AccordionButton></Heading>
            <AccordionPanel pb={5}>
              <Stack spacing={4}>
                <Text color="text.muted">Use these examples to start a discussion about revenue support, staffing efficiency, and rollout costs. They are planning assumptions, not measured results or a quote.</Text>
                <TableContainer>
                  <Table size="sm" variant="simple">
                    <Thead><Tr><Th>Rollout</Th><Th isNumeric>Monthly cost</Th><Th isNumeric>New revenue</Th><Th isNumeric>Labor savings</Th><Th isNumeric>Net impact</Th></Tr></Thead>
                    <Tbody>{HOSPITAL_VALUE_ROWS.map((row) => (
                      <Tr key={row.rollout}><Td>{row.rollout}</Td><Td isNumeric>{row.monthlyCost}</Td><Td isNumeric>{row.revenue}</Td><Td isNumeric>{row.laborSavings}</Td><Td isNumeric>{row.netImpact}</Td></Tr>
                    ))}</Tbody>
                  </Table>
                </TableContainer>
                <Text fontSize="sm" color="text.muted">Actual results depend on patient mix, staffing, reimbursement, and rollout design. Your organization remains responsible for billing and clinical decisions.</Text>
              </Stack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Stack>
      <Stack align="center" spacing={4} textAlign="center" p={{ base: 6, md: 8 }} bg={panelBg} borderRadius="2xl">
        <Heading as="h2" size="lg">Let’s talk about your care setting.</Heading>
        <Text color="text.muted">Tell us about your team and the workflow you want to improve.</Text>
        <Button as={RouterLink} to={APP_LINKS.internal.contact} size="lg" borderRadius="full" px={8} onClick={contact}>Discuss a Partnership</Button>
      </Stack>
    </Stack>
  );
}
