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

const PAYER_OPTIONS = ["Aetna", "Blue Cross Blue Shield", "Cigna", "Medicare", "UnitedHealthcare"] as const;

const PAYER_INSIGHTS: Record<string, { headline: string; value: string; note: string }> = {
  Aetna: {
    headline: "Telehealth, preventive care, and care navigation are often part of commercial plan value.",
    value: "$25-$75",
    note: "Illustrative support value based on common plan patterns.",
  },
  "Blue Cross Blue Shield": {
    headline: "PCP and specialist network access is often one of the biggest sources of plan value.",
    value: "$20-$60",
    note: "Illustrative care-navigation value based on common plan patterns.",
  },
  Cigna: {
    headline: "Virtual care and wellness coaching may be available depending on the plan.",
    value: "$20-$65",
    note: "Illustrative support value based on common plan patterns.",
  },
  Medicare: {
    headline: "Primary care, annual wellness visits, and chronic care support may help lower near-term costs.",
    value: "$0-$50",
    note: "Illustrative out-of-pocket reduction based on common plan patterns.",
  },
  UnitedHealthcare: {
    headline: "Urgent care, telehealth, and care management support may be available depending on network.",
    value: "$20-$70",
    note: "Illustrative convenience value based on common plan patterns.",
  },
};

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

function StepBadge({
  number,
  bg,
  color,
}: {
  number: string;
  bg: string;
  color: string;
}) {
  return (
    <Box
      w="34px"
      h="34px"
      borderRadius="full"
      bg={bg}
      color={color}
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontWeight="800"
      fontSize="sm"
    >
      {number}
    </Box>
  );
}

export default function Simulator() {
  const pageGradient = useColorModeValue(
    "linear(to-b, #FFFFFF, #9CE7FF)",
    "linear(to-b, surface.900, surface.800)"
  );
  const border = useColorModeValue("border.default", "border.default");
  const muted = useColorModeValue("text.muted", "text.muted");
  const scenarioCardBg = useColorModeValue("rgba(255, 255, 255, 0.82)", "rgba(6, 37, 76, 0.62)");
  const stepBg = useColorModeValue("rgba(255, 255, 255, 0.84)", "rgba(6, 37, 76, 0.72)");
  const outputBg = useColorModeValue("rgba(17, 119, 186, 0.08)", "rgba(17, 119, 186, 0.14)");
  const outputCardBg = useColorModeValue("rgba(255, 255, 255, 0.94)", "rgba(2, 26, 54, 0.88)");
  const stepBadgeBg = useColorModeValue("#001A52", "#9CE7FF");
  const stepBadgeColor = useColorModeValue("#FFFFFF", "#001A52");
  const outputBorder = useColorModeValue("#1177BA", "#9CE7FF");

  const [selectedId, setSelectedId] = useState(STARTER_SCENARIOS[0]?.id ?? "");
  const selectedScenario = useMemo(
    () => STARTER_SCENARIOS.find((scenario) => scenario.id === selectedId) ?? STARTER_SCENARIOS[0],
    [selectedId]
  );

  const [quickInput, setQuickInput] = useState<QuickInput>({
    payer: "Aetna",
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
      payer: "Aetna",
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
  const payerInsight = PAYER_INSIGHTS[simulatedInput.insurance.payer] ?? PAYER_INSIGHTS.Aetna;

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
      aria-label="VeeVee Simulator®"
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

        <Card bg={stepBg} borderWidth="1px" borderColor={border} borderRadius="2xl" boxShadow="0 16px 34px rgba(6, 37, 76, 0.10)">
          <CardBody>
            <Stack spacing={4}>
              <Stack spacing={3}>
                <StepBadge number="1" bg={stepBadgeBg} color={stepBadgeColor} />
                <Box>
                  <Heading as="h2" size="sm" mb={1}>
                    Pick a scenario
                  </Heading>
                  <Text fontSize="sm" color={muted}>
                    Start with the life situation that feels closest to what you want to explore.
                  </Text>
                </Box>
              </Stack>

              <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={3}>
                {STARTER_SCENARIOS.map((scenario) => (
                  <Box
                    key={scenario.id}
                    borderWidth="1px"
                    borderColor={selectedId === scenario.id ? outputBorder : border}
                    borderRadius="xl"
                    bg={selectedId === scenario.id ? outputBg : scenarioCardBg}
                    p={4}
                    boxShadow={selectedId === scenario.id ? "0 0 0 1px rgba(17, 119, 186, 0.25)" : "none"}
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

        <SimpleGrid columns={{ base: 1, lg: "minmax(0, 0.95fr) minmax(0, 1.05fr)" }} spacing={6} alignItems="stretch">
          <Card bg={stepBg} borderWidth="1px" borderColor={border} borderRadius="2xl" boxShadow="0 16px 34px rgba(6, 37, 76, 0.10)">
            <CardBody>
              <Stack spacing={4}>
                <Stack spacing={3}>
                  <StepBadge number="2" bg={stepBadgeBg} color={stepBadgeColor} />
                  <Box>
                    <Heading as="h2" size="sm" mb={1}>
                      Change the parameters
                    </Heading>
                    <Text color={muted} fontSize="sm">
                      Adjust a few details and make the scenario feel more like your situation.
                    </Text>
                  </Box>
                </Stack>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <FormControl>
                    <FormLabel htmlFor="quick-payer" fontSize="sm">
                      Insurance payer
                    </FormLabel>
                    <Select
                      id="quick-payer"
                      value={quickInput.payer}
                      onChange={(e) => {
                        setQuickInput((prev) => ({ ...prev, payer: e.target.value }));
                        trackInputChange("quick.insurance.payer");
                      }}
                    >
                      {PAYER_OPTIONS.map((payer) => (
                        <option key={payer} value={payer}>
                          {payer}
                        </option>
                      ))}
                    </Select>
                    <FormHelperText fontSize="xs">Helpful for benefits context</FormHelperText>
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

                <Box
                  borderWidth="1px"
                  borderColor={border}
                  borderRadius="xl"
                  bg={scenarioCardBg}
                  px={4}
                  py={3}
                >
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color="accent.soft" mb={1}>
                    Current setup
                  </Text>
                  <Text fontSize="sm" color={muted}>
                    {quickInput.severity === "low"
                      ? "A little off"
                      : quickInput.severity === "moderate"
                        ? "Noticeable"
                        : "Hard to ignore"}{" "}
                    symptoms for {quickInput.durationDays} day{quickInput.durationDays === 1 ? "" : "s"}, about {quickInput.sleepHours} hours of sleep, payer: {quickInput.payer || "Not added"}.
                  </Text>
                </Box>

                <Button
                  alignSelf="flex-start"
                  isLoading={isRunning}
                  loadingText="Running"
                  aria-live="polite"
                  onClick={handleRunPreview}
                >
                  Update my outcome
                </Button>
              </Stack>
            </CardBody>
          </Card>

          <Card
            bg={outputBg}
            borderWidth="2px"
            borderColor={outputBorder}
            borderRadius="2xl"
            boxShadow="0 20px 42px rgba(17, 119, 186, 0.16)"
          >
            <CardBody>
              <Stack spacing={4}>
                <Stack spacing={3}>
                  <StepBadge number="3" bg={stepBadgeBg} color={stepBadgeColor} />
                  <Box>
                    <Heading as="h2" size="sm" mb={1}>
                      Here is your outcome
                    </Heading>
                    <Text color={muted} fontSize="sm">
                      A quick read on what VeeVee notices, what it predicts, and what you may want to do next.
                    </Text>
                  </Box>
                </Stack>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Box borderWidth="1px" borderColor={outputBorder} borderRadius="xl" bg={outputCardBg} px={4} py={3}>
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color="accent.soft" mb={1}>
                      Overall outcome
                    </Text>
                    <Text fontSize="sm">
                      Level: <b>{result.riskLevel}</b>
                    </Text>
                    <Text fontSize="sm" color={muted}>
                      Preview score: {result.riskScore}
                    </Text>
                  </Box>
                  <Box borderWidth="1px" borderColor={outputBorder} borderRadius="xl" bg={outputCardBg} px={4} py={3}>
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color="accent.soft" mb={1}>
                      Based on these inputs
                    </Text>
                    <Text fontSize="sm" color={muted}>
                      {simulatedInput.symptom.durationDays} day symptoms, {simulatedInput.behaviorChange.sleepHours} hours of sleep, payer {simulatedInput.insurance.payer}.
                    </Text>
                  </Box>
                  <Box borderWidth="1px" borderColor={outputBorder} borderRadius="xl" bg={outputCardBg} px={4} py={3}>
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color="accent.soft" mb={1}>
                      Benefits snapshot
                    </Text>
                    <Text fontSize="sm" fontWeight="700" mb={1}>
                      {simulatedInput.insurance.payer}: {payerInsight.value}
                    </Text>
                    <Text fontSize="sm" color={muted} mb={2}>
                      {payerInsight.headline}
                    </Text>
                    <Text fontSize="xs" color={muted}>
                      {payerInsight.note} Actual benefits depend on your specific plan.
                    </Text>
                  </Box>
                </SimpleGrid>

                <Box>
                  <Text fontSize="sm" fontWeight="700" mb={2}>
                    What VeeVee notices
                  </Text>
                  <Stack spacing={2}>
                    {result.riskSignals.length ? (
                      result.riskSignals.slice(0, 3).map((signal) => (
                        <Box key={signal} borderWidth="1px" borderColor={outputBorder} borderRadius="lg" bg={outputCardBg} px={3} py={2}>
                          <Text fontSize="sm">{signal}</Text>
                        </Box>
                      ))
                    ) : (
                      <Box borderWidth="1px" borderColor={outputBorder} borderRadius="lg" bg={outputCardBg} px={3} py={2}>
                        <Text fontSize="sm" color={muted}>
                          Nothing urgent stands out in this preview.
                        </Text>
                      </Box>
                    )}
                  </Stack>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="700" mb={2}>
                    Predictions, actions, and next steps
                  </Text>
                  <Stack spacing={2}>
                    {result.recommendations.slice(0, 3).map((recommendation) => (
                      <Box key={recommendation.id} borderWidth="1px" borderColor={outputBorder} borderRadius="lg" bg={outputCardBg} px={3} py={2}>
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
          <Card bg={outputBg} borderWidth="1px" borderColor={outputBorder} borderRadius="2xl">
            <CardBody>
              <Stack spacing={4}>
                <Heading as="h2" size="sm">
                  Questions you may want to ask
                </Heading>
                <Stack spacing={2}>
                  {result.followUpQuestions.map((question) => (
                    <Box key={question} borderWidth="1px" borderColor={outputBorder} borderRadius="lg" bg={outputCardBg} px={3} py={2}>
                      <Text fontSize="sm">{question}</Text>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </CardBody>
          </Card>

          <Card bg={stepBg} borderWidth="1px" borderColor={border} borderRadius="2xl">
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
