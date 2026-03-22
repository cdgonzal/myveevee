import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormHelperText,
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
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { APP_LINKS } from "../config/links";
import { runWellnessMirrorSimulation, type SimulationResult } from "../simulator/engine";
import {
  createSimulationAuditRecord,
  persistSimulationAuditRecord,
} from "../simulator/logging";
import {
  DEFAULT_SIMULATOR_INPUT,
  STARTER_SCENARIOS,
  type SimulatorInput,
  type SymptomSeverity,
} from "../simulator/schema";

interface QuickInput {
  payer: string;
  severity: SymptomSeverity;
  durationDays: number;
  sleepHours: number;
}

function quickInputToSimulatorInput(quick: QuickInput, base: SimulatorInput): SimulatorInput {
  return {
    ...base,
    insurance: {
      ...base.insurance,
      payer: quick.payer,
    },
    symptom: {
      ...base.symptom,
      severity: quick.severity,
      durationDays: quick.durationDays,
    },
    behaviorChange: {
      ...base.behaviorChange,
      sleepHours: quick.sleepHours,
    },
  };
}

export default function Simulator() {
  const pageGradient = useColorModeValue(
    "linear(to-b, #FFFFFF, #9CE7FF)",
    "linear(to-b, surface.900, surface.800)"
  );
  const border = useColorModeValue("border.default", "border.default");
  const muted = useColorModeValue("text.muted", "text.muted");
  const scenarioCardBg = useColorModeValue("rgba(255, 255, 255, 0.82)", "rgba(6, 37, 76, 0.62)");

  const [selectedId, setSelectedId] = useState(STARTER_SCENARIOS[0]?.id ?? "");
  const selectedScenario = useMemo(
    () => STARTER_SCENARIOS.find((scenario) => scenario.id === selectedId) ?? STARTER_SCENARIOS[0],
    [selectedId]
  );

  const [quickInput, setQuickInput] = useState<QuickInput>({
    payer: DEFAULT_SIMULATOR_INPUT.insurance.payer,
    severity: DEFAULT_SIMULATOR_INPUT.symptom.severity,
    durationDays: DEFAULT_SIMULATOR_INPUT.symptom.durationDays,
    sleepHours: DEFAULT_SIMULATOR_INPUT.behaviorChange.sleepHours,
  });
  const [simulatedInput, setSimulatedInput] = useState<SimulatorInput>(selectedScenario?.input ?? DEFAULT_SIMULATOR_INPUT);
  const [result, setResult] = useState<SimulationResult>(() =>
    runWellnessMirrorSimulation(selectedScenario?.input ?? DEFAULT_SIMULATOR_INPUT)
  );
  const [lastAuditRunId, setLastAuditRunId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputEventLastSentRef = useRef<Record<string, number>>({});

  const trackEvent = (eventName: string, params?: Record<string, string | number>) => {
    const gtag = (window as any).gtag;
    if (typeof gtag === "function") {
      gtag("event", eventName, params ?? {});
    }
  };

  const trackInputChange = (field: string) => {
    const now = Date.now();
    const last = inputEventLastSentRef.current[field] ?? 0;
    if (now - last < 800) return;
    inputEventLastSentRef.current[field] = now;
    trackEvent("wm_input_change", { field });
  };

  const runSimulation = async (input: SimulatorInput, source: string) => {
    setIsRunning(true);
    setErrorMessage(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 250));
      const nextResult = runWellnessMirrorSimulation(input);
      setSimulatedInput(input);
      setResult(nextResult);
      const auditRecord = createSimulationAuditRecord(input, nextResult, source);
      persistSimulationAuditRecord(auditRecord);
      setLastAuditRunId(auditRecord.runId);
      trackEvent("wm_run_simulation", { source, riskScore: nextResult.riskScore });
    } catch {
      setErrorMessage("Simulation failed. Please try again.");
      trackEvent("wm_run_simulation_error", { source });
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    trackEvent("wm_view");
  }, []);

  useEffect(() => {
    if (!selectedScenario) {
      return;
    }

    const nextQuick = {
      payer: selectedScenario.input.insurance.payer,
      severity: selectedScenario.input.symptom.severity,
      durationDays: selectedScenario.input.symptom.durationDays,
      sleepHours: selectedScenario.input.behaviorChange.sleepHours,
    };

    setQuickInput(nextQuick);
    const nextInput = quickInputToSimulatorInput(nextQuick, selectedScenario.input);
    void runSimulation(nextInput, "scenario");
  }, [selectedScenario]);

  const currentInput = useMemo(
    () => quickInputToSimulatorInput(quickInput, selectedScenario?.input ?? DEFAULT_SIMULATOR_INPUT),
    [quickInput, selectedScenario]
  );

  const handleRunPreview = () => {
    trackEvent("wm_quick_preview_start");
    void runSimulation(currentInput, "quick_preview");
  };

  return (
    <Box
      as="main"
      minH="100vh"
      bgGradient={pageGradient}
      color="text.primary"
      py={{ base: 10, md: 20 }}
      aria-label="VeeVee Simulator"
    >
      <Stack spacing={{ base: 8, md: 10 }} maxW="6xl" mx="auto" px={{ base: 6, md: 10 }}>
        <Stack spacing={3}>
          <Badge
            alignSelf="flex-start"
            colorScheme="blue"
            variant="subtle"
            px={3}
            py={1}
            borderRadius="full"
          >
            VeeVee Simulator® Preview
          </Badge>
          <Heading as="h1" size={{ base: "lg", md: "xl" }}>
            Try a simple what-if health scenario.
          </Heading>
          <Text color={muted} maxW="4xl">
            VeeVee Simulator® gives you a quick preview of what may matter, what questions to ask, and what next steps may help. It is a simple teaser for the fuller app experience.
          </Text>
        </Stack>

        <Card bg="bg.surface" borderWidth="1px" borderColor={border} borderRadius="xl">
          <CardBody>
            <Stack spacing={4}>
              <Heading as="h2" size="sm">
                Pick a life situation
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={3}>
                {STARTER_SCENARIOS.map((scenario) => (
                  <Box
                    key={scenario.id}
                    borderWidth="1px"
                    borderColor={selectedId === scenario.id ? "accent.primary" : border}
                    borderRadius="xl"
                    bg={scenarioCardBg}
                    p={4}
                  >
                    <Stack spacing={2}>
                      <Text fontWeight="700" fontSize="sm">
                        {scenario.title}
                      </Text>
                      <Text color={muted} fontSize="sm">
                        {scenario.summary}
                      </Text>
                      <Button
                        size="sm"
                        variant={selectedId === scenario.id ? "solid" : "outline"}
                        onClick={() => {
                          setSelectedId(scenario.id);
                          trackEvent("wm_start_scenario", { scenarioId: scenario.id });
                        }}
                      >
                        Choose
                      </Button>
                    </Stack>
                  </Box>
                ))}
              </SimpleGrid>
            </Stack>
          </CardBody>
        </Card>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} alignItems="stretch">
          <Card bg="bg.surface" borderWidth="1px" borderColor={border} borderRadius="xl">
            <CardBody>
              <Stack spacing={4}>
                <Heading as="h2" size="sm">
                  Adjust a few details
                </Heading>
                <Text color={muted} fontSize="sm">
                  Keep it simple. Change a few things and see how the preview responds.
                </Text>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <FormControl>
                    <FormLabel htmlFor="quick-payer" fontSize="sm">
                      Insurance payer
                    </FormLabel>
                    <Input
                      id="quick-payer"
                      value={quickInput.payer}
                      onChange={(e) => {
                        setQuickInput((prev) => ({ ...prev, payer: e.target.value }));
                        trackInputChange("quick.insurance.payer");
                      }}
                    />
                    <FormHelperText fontSize="xs">Optional, but helpful for benefits context</FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel htmlFor="quick-severity" fontSize="sm">
                      How does it feel?
                    </FormLabel>
                    <Select
                      id="quick-severity"
                      value={quickInput.severity}
                      onChange={(e) => {
                        setQuickInput((prev) => ({
                          ...prev,
                          severity: e.target.value as SymptomSeverity,
                        }));
                        trackInputChange("quick.symptom.severity");
                      }}
                    >
                      <option value="low">A little off</option>
                      <option value="moderate">Noticeable</option>
                      <option value="high">Hard to ignore</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel htmlFor="quick-duration" fontSize="sm">
                      How many days?
                    </FormLabel>
                    <NumberInput
                      min={1}
                      max={180}
                      value={quickInput.durationDays}
                      onChange={(_, value) => {
                        setQuickInput((prev) => ({
                          ...prev,
                          durationDays: Number.isFinite(value) ? value : 1,
                        }));
                        trackInputChange("quick.symptom.durationDays");
                      }}
                    >
                      <NumberInputField id="quick-duration" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel htmlFor="quick-sleep" fontSize="sm">
                      Sleep each night
                    </FormLabel>
                    <NumberInput
                      min={0}
                      max={12}
                      value={quickInput.sleepHours}
                      onChange={(_, value) => {
                        setQuickInput((prev) => ({
                          ...prev,
                          sleepHours: Number.isFinite(value) ? value : 0,
                        }));
                        trackInputChange("quick.behavior.sleepHours");
                      }}
                    >
                      <NumberInputField id="quick-sleep" />
                    </NumberInput>
                    <FormHelperText fontSize="xs">Hours of sleep per night</FormHelperText>
                  </FormControl>
                </Grid>

                <Button
                  alignSelf="flex-start"
                  isLoading={isRunning}
                  loadingText="Running"
                  aria-live="polite"
                  onClick={handleRunPreview}
                >
                  See my preview
                </Button>
              </Stack>
            </CardBody>
          </Card>

          <Card bg="bg.surface" borderWidth="1px" borderColor={border} borderRadius="xl">
            <CardBody>
              <Stack spacing={4}>
                <Heading as="h2" size="sm">
                  What VeeVee notices
                </Heading>
                <Text fontSize="sm">
                  Overall level: <b>{result.riskLevel}</b>
                </Text>
                <Text fontSize="sm" color={muted}>
                  Preview score: {result.riskScore}
                </Text>

                <Box>
                  <Text fontSize="sm" fontWeight="700" mb={2}>
                    Main signals
                  </Text>
                  <Stack spacing={2}>
                    {result.riskSignals.length ? (
                      result.riskSignals.slice(0, 3).map((signal) => (
                        <Text key={signal} fontSize="sm">
                          - {signal}
                        </Text>
                      ))
                    ) : (
                      <Text fontSize="sm" color={muted}>
                        Nothing urgent stands out in this preview.
                      </Text>
                    )}
                  </Stack>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="700" mb={2}>
                    What you may want to do next
                  </Text>
                  <Stack spacing={2}>
                    {result.recommendations.slice(0, 3).map((recommendation) => (
                      <Box key={recommendation.id} borderWidth="1px" borderColor={border} borderRadius="lg" px={3} py={2}>
                        <Text fontSize="sm" fontWeight="700">
                          {recommendation.title}
                        </Text>
                        <Text fontSize="sm" color={muted}>
                          {recommendation.rationale}
                        </Text>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </CardBody>
          </Card>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Card bg="bg.surface" borderWidth="1px" borderColor={border} borderRadius="xl">
            <CardBody>
              <Stack spacing={4}>
                <Heading as="h2" size="sm">
                  Questions you may want to ask
                </Heading>
                <Stack spacing={2}>
                  {result.followUpQuestions.map((question) => (
                    <Text key={question} fontSize="sm">
                      - {question}
                    </Text>
                  ))}
                </Stack>
              </Stack>
            </CardBody>
          </Card>

          <Card bg="bg.surface" borderWidth="1px" borderColor={border} borderRadius="xl">
            <CardBody>
              <Stack spacing={4}>
                <Heading as="h2" size="sm">
                  Teaser for the app
                </Heading>
                <Text color={muted} fontSize="sm">
                  The full VeeVee app goes further with your health profile, benefits, ongoing tracking, smarter recommendations, and the deeper simulator experience.
                </Text>
                <Text color={muted} fontSize="sm">
                  This preview is here to help you get the idea quickly without needing to fill out a big form.
                </Text>
                <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
                  <Button
                    as="a"
                    href={APP_LINKS.external.authenticatedConsole}
                    target="_blank"
                    rel="noopener noreferrer"
                    borderRadius="full"
                    px={8}
                    fontWeight="700"
                    onClick={() => trackEvent("wm_cta_click", { cta: "login" })}
                  >
                    Open the app
                  </Button>
                  <Button
                    as={RouterLink}
                    to={APP_LINKS.internal.whyVeeVee}
                    variant="outline"
                    borderRadius="full"
                    px={8}
                    fontWeight="700"
                    onClick={() => trackEvent("wm_cta_click", { cta: "explore_features" })}
                  >
                    Explore features
                  </Button>
                </Stack>
              </Stack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {errorMessage && (
          <Alert status="error" borderRadius="lg" role="alert">
            <AlertIcon />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Alert status="info" borderRadius="lg" variant="subtle">
          <AlertIcon />
          <AlertDescription fontSize="sm">
            VeeVee Simulator® is a planning and education tool. It is not medical diagnosis or treatment.
          </AlertDescription>
        </Alert>

        <Alert status="success" borderRadius="lg" variant="subtle" role="status">
          <AlertIcon />
          <AlertDescription fontSize="sm">
            Privacy comes first. Stored audit records redact free-text details.
            {lastAuditRunId ? ` Latest run ID: ${lastAuditRunId}.` : ""}
          </AlertDescription>
        </Alert>
      </Stack>
    </Box>
  );
}
