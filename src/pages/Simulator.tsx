import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  useColorModeValue,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { APP_LINKS } from "../config/links";
import { runWellnessMirrorSimulation, type SimulationResult } from "../simulator/engine";
import {
  DEFAULT_SIMULATOR_INPUT,
  STARTER_SCENARIOS,
  type SimulatorInput,
  type SymptomSeverity,
} from "../simulator/schema";

export default function Simulator() {
  const pageGradient = useColorModeValue(
    "linear(to-b, #FFFFFF, #9CE7FF)",
    "linear(to-b, surface.900, surface.800)"
  );
  const border = useColorModeValue("border.default", "border.default");
  const muted = useColorModeValue("text.muted", "text.muted");

  const [selectedId, setSelectedId] = useState(STARTER_SCENARIOS[0]?.id ?? "");
  const selectedScenario = useMemo(
    () => STARTER_SCENARIOS.find((scenario) => scenario.id === selectedId),
    [selectedId]
  );

  const [draftInput, setDraftInput] = useState<SimulatorInput>(selectedScenario?.input ?? DEFAULT_SIMULATOR_INPUT);
  const [simulatedInput, setSimulatedInput] = useState<SimulatorInput>(selectedScenario?.input ?? DEFAULT_SIMULATOR_INPUT);
  const [result, setResult] = useState<SimulationResult>(() =>
    runWellnessMirrorSimulation(selectedScenario?.input ?? DEFAULT_SIMULATOR_INPUT)
  );

  const inputTypes = Object.keys(draftInput);
  const outputs = [
    "Predicted twin-state updates",
    "Risk and priority signals",
    "Ranked recommended actions",
    "Follow-up questions",
    "Decision-step trace",
  ];

  const applyScenario = (scenarioId: string) => {
    setSelectedId(scenarioId);
    const next = STARTER_SCENARIOS.find((scenario) => scenario.id === scenarioId)?.input ?? DEFAULT_SIMULATOR_INPUT;
    setDraftInput(next);
    setSimulatedInput(next);
    setResult(runWellnessMirrorSimulation(next));
  };

  return (
    <Box as="main" minH="100vh" bgGradient={pageGradient} color="text.primary" py={{ base: 10, md: 20 }}>
      <Stack spacing={{ base: 8, md: 10 }} maxW="6xl" mx="auto" px={{ base: 6, md: 10 }}>
        <Stack spacing={3}>
          <Badge alignSelf="flex-start" colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
            Wellness Mirror® Preview
          </Badge>
          <Heading as="h1" size={{ base: "lg", md: "xl" }}>
            Wellness Mirror® Scenario Explorer
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
                  {inputTypes.map((item) => (
                    <Box key={item} fontSize="sm" borderWidth="1px" borderColor={border} borderRadius="md" px={3} py={2}>
                      {item[0].toUpperCase() + item.slice(1)}
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
                  {outputs.map((item) => (
                    <Text key={item} fontSize="sm">- {item}</Text>
                  ))}
                </Stack>
              </Stack>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Card bg="bg.surface" borderWidth="1px" borderColor={border} borderRadius="xl">
          <CardBody>
            <Stack spacing={4}>
              <Heading as="h2" size="sm">Starter scenarios</Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                {STARTER_SCENARIOS.map((scenario) => (
                  <Box key={scenario.id} borderWidth="1px" borderColor={border} borderRadius="lg" p={3}>
                    <Stack spacing={2}>
                      <Text fontWeight="700" fontSize="sm">{scenario.title}</Text>
                      <Text color={muted} fontSize="sm">{scenario.summary}</Text>
                      <Button
                        size="sm"
                        variant={selectedId === scenario.id ? "solid" : "outline"}
                        onClick={() => applyScenario(scenario.id)}
                      >
                        Use scenario
                      </Button>
                    </Stack>
                  </Box>
                ))}
              </SimpleGrid>
            </Stack>
          </CardBody>
        </Card>

        <Card bg="bg.surface" borderWidth="1px" borderColor={border} borderRadius="xl">
          <CardBody>
            <Stack spacing={4}>
              <Heading as="h2" size="sm">Scenario input</Heading>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                <FormControl>
                  <FormLabel fontSize="sm">Insurance payer</FormLabel>
                  <Input
                    value={draftInput.insurance.payer}
                    onChange={(e) =>
                      setDraftInput((prev) => ({
                        ...prev,
                        insurance: { ...prev.insurance, payer: e.target.value },
                      }))
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">State</FormLabel>
                  <Input
                    value={draftInput.profile.state}
                    onChange={(e) =>
                      setDraftInput((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, state: e.target.value.toUpperCase() },
                      }))
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Symptom severity</FormLabel>
                  <Select
                    value={draftInput.symptom.severity}
                    onChange={(e) =>
                      setDraftInput((prev) => ({
                        ...prev,
                        symptom: { ...prev.symptom, severity: e.target.value as SymptomSeverity },
                      }))
                    }
                  >
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Symptom duration (days)</FormLabel>
                  <NumberInput
                    min={1}
                    max={180}
                    value={draftInput.symptom.durationDays}
                    onChange={(_, value) =>
                      setDraftInput((prev) => ({
                        ...prev,
                        symptom: { ...prev.symptom, durationDays: Number.isFinite(value) ? value : 1 },
                      }))
                    }
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Medication adherence (%)</FormLabel>
                  <NumberInput
                    min={0}
                    max={100}
                    value={draftInput.medication.adherencePercent}
                    onChange={(_, value) =>
                      setDraftInput((prev) => ({
                        ...prev,
                        medication: {
                          ...prev.medication,
                          adherencePercent: Number.isFinite(value) ? value : 0,
                        },
                      }))
                    }
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Sleep (hours/night)</FormLabel>
                  <NumberInput
                    min={0}
                    max={12}
                    value={draftInput.behaviorChange.sleepHours}
                    onChange={(_, value) =>
                      setDraftInput((prev) => ({
                        ...prev,
                        behaviorChange: {
                          ...prev.behaviorChange,
                          sleepHours: Number.isFinite(value) ? value : 0,
                        },
                      }))
                    }
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </Grid>

              <FormControl>
                <FormLabel fontSize="sm">Symptom description</FormLabel>
                <Textarea
                  value={draftInput.symptom.description}
                  onChange={(e) =>
                    setDraftInput((prev) => ({
                      ...prev,
                      symptom: { ...prev.symptom, description: e.target.value },
                    }))
                  }
                  rows={3}
                />
              </FormControl>

              <Button
                alignSelf="flex-start"
                onClick={() => {
                  setSimulatedInput(draftInput);
                  setResult(runWellnessMirrorSimulation(draftInput));
                }}
              >
                Run simulation preview
              </Button>
            </Stack>
          </CardBody>
        </Card>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Card bg="bg.surface" borderWidth="1px" borderColor={border} borderRadius="xl">
            <CardBody>
              <Stack spacing={3}>
                <Heading as="h2" size="sm">Risk summary</Heading>
                <Text fontSize="sm">
                  Risk score: <b>{result.riskScore}</b> ({result.riskLevel})
                </Text>
                <Stack spacing={1}>
                  {result.riskSignals.map((signal) => (
                    <Text key={signal} fontSize="sm">- {signal}</Text>
                  ))}
                </Stack>
              </Stack>
            </CardBody>
          </Card>

          <Card bg="bg.surface" borderWidth="1px" borderColor={border} borderRadius="xl">
            <CardBody>
              <Stack spacing={3}>
                <Heading as="h2" size="sm">Twin-state updates</Heading>
                {result.twinStateUpdates.map((update) => (
                  <Box key={`${update.field}-${update.summary}`} borderWidth="1px" borderColor={border} borderRadius="md" px={3} py={2}>
                    <Text fontSize="sm"><b>{update.field}</b> ({update.direction})</Text>
                    <Text fontSize="sm" color={muted}>{update.summary}</Text>
                  </Box>
                ))}
              </Stack>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Card bg="bg.surface" borderWidth="1px" borderColor={border} borderRadius="xl">
          <CardBody>
            <Stack spacing={3}>
              <Heading as="h2" size="sm">Ranked recommended actions</Heading>
              {result.recommendations.map((recommendation) => (
                <Box key={recommendation.id} borderWidth="1px" borderColor={border} borderRadius="md" px={3} py={2}>
                  <Text fontSize="sm">
                    <b>{recommendation.title}</b> (priority {recommendation.priority})
                  </Text>
                  <Text fontSize="sm" color={muted}>{recommendation.rationale}</Text>
                  <Text fontSize="sm" color={muted}>{recommendation.coverageNote}</Text>
                </Box>
              ))}
            </Stack>
          </CardBody>
        </Card>

        <Card bg="bg.surface" borderWidth="1px" borderColor={border} borderRadius="xl">
          <CardBody>
            <Stack spacing={3}>
              <Heading as="h2" size="sm">Follow-up questions</Heading>
              {result.followUpQuestions.map((question) => (
                <Text key={question} fontSize="sm">- {question}</Text>
              ))}
            </Stack>
          </CardBody>
        </Card>

        <Card bg="bg.surface" borderWidth="1px" borderColor={border} borderRadius="xl">
          <CardBody>
            <Stack spacing={3}>
              <Heading as="h2" size="sm">Under The Hood</Heading>
              <Text color={muted} fontSize="sm">
                This page will expose pipeline versions, rule hits, coverage constraints, and reasoning steps used to rank actions.
              </Text>
              <Text color={muted} fontSize="sm">
                {result.pipelineVersion} | {result.policyVersion} | {result.guardrailVersion} | {result.coverageVersion}
              </Text>
              <Box as="pre" fontSize="xs" borderWidth="1px" borderColor={border} borderRadius="md" p={3} overflowX="auto">
                {JSON.stringify(simulatedInput, null, 2)}
              </Box>
              <Box as="pre" fontSize="xs" borderWidth="1px" borderColor={border} borderRadius="md" p={3} overflowX="auto">
                {JSON.stringify(result.decisionTrace, null, 2)}
              </Box>
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
            target="_blank"
            rel="noopener noreferrer"
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
