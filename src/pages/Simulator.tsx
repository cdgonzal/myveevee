import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { APP_LINKS } from "../config/links";

const INPUT_TYPES = [
  "Profile",
  "Insurance",
  "Symptoms",
  "Behavior change",
  "Medication",
  "Lab values",
  "Lifestyle events",
];

const OUTPUTS = [
  "Predicted twin-state updates",
  "Risk and priority signals",
  "Ranked recommended actions",
  "Follow-up questions",
  "Decision-step trace",
];

export default function Simulator() {
  const pageGradient = useColorModeValue(
    "linear(to-b, #FFFFFF, #9CE7FF)",
    "linear(to-b, surface.900, surface.800)"
  );
  const border = useColorModeValue("border.default", "border.default");
  const muted = useColorModeValue("text.muted", "text.muted");

  return (
    <Box as="main" minH="100vh" bgGradient={pageGradient} color="text.primary" py={{ base: 10, md: 20 }}>
      <Stack spacing={{ base: 8, md: 10 }} maxW="6xl" mx="auto" px={{ base: 6, md: 10 }}>
        <Stack spacing={3}>
          <Badge alignSelf="flex-start" colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
            Simulator Preview
          </Badge>
          <Heading as="h1" size={{ base: "lg", md: "xl" }}>
            Scenario Explorer (What-If Engine)
          </Heading>
          <Text color={muted} maxW="4xl">
            Run a health or benefits scenario, see predicted changes to your Digital Twin, and inspect how decisions are made.
          </Text>
        </Stack>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Card bg="bg.surface" borderWidth="1px" borderColor={border} borderRadius="xl">
            <CardBody>
              <Stack spacing={4}>
                <Heading as="h2" size="sm">Inputs captured</Heading>
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                  {INPUT_TYPES.map((item) => (
                    <Box key={item} fontSize="sm" borderWidth="1px" borderColor={border} borderRadius="md" px={3} py={2}>
                      {item}
                    </Box>
                  ))}
                </SimpleGrid>
              </Stack>
            </CardBody>
          </Card>

          <Card bg="bg.surface" borderWidth="1px" borderColor={border} borderRadius="xl">
            <CardBody>
              <Stack spacing={4}>
                <Heading as="h2" size="sm">Outputs returned</Heading>
                <Stack spacing={2}>
                  {OUTPUTS.map((item) => (
                    <Text key={item} fontSize="sm">• {item}</Text>
                  ))}
                </Stack>
              </Stack>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Card bg="bg.surface" borderWidth="1px" borderColor={border} borderRadius="xl">
          <CardBody>
            <Stack spacing={3}>
              <Heading as="h2" size="sm">Under The Hood</Heading>
              <Text color={muted} fontSize="sm">
                This page will expose pipeline versions, rule hits, coverage constraints, and reasoning steps used to rank actions.
              </Text>
              <Text color={muted} fontSize="sm">
                Current status: scaffold complete. Next step is wiring the input form and simulation engine contract.
              </Text>
            </Stack>
          </CardBody>
        </Card>

        <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
          <Button as={RouterLink} to={APP_LINKS.internal.whyVeeVee} borderRadius="full" px={8} fontWeight="700">
            Explore Features
          </Button>
          <Button
            as="a"
            href={APP_LINKS.external.authenticatedConsole}
            isExternal
            variant="outline"
            borderRadius="full"
            px={8}
            fontWeight="700"
          >
            Log in
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
