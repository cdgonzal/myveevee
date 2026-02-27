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
  Textarea,
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

type FlowStep = "input" | "preview" | "full";

interface QuickInput {
  payer: string;
  severity: SymptomSeverity;
  durationDays: number;
  sleepHours: number;
}

function quickInputToSimulatorInput(quick: QuickInput): SimulatorInput {
  return {
    ...DEFAULT_SIMULATOR_INPUT,
    insurance: {
      ...DEFAULT_SIMULATOR_INPUT.insurance,
      payer: quick.payer,
    },
    symptom: {
      ...DEFAULT_SIMULATOR_INPUT.symptom,
      severity: quick.severity,
      durationDays: quick.durationDays,
      description: `Quick scenario: ${quick.severity} symptoms for ${quick.durationDays} days.`,
    },
    behaviorChange: {
      ...DEFAULT_SIMULATOR_INPUT.behaviorChange,
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
  const avatarBg = useColorModeValue("linear(to-b, #EAF8FF, #CFF0FF)", "linear(to-b, #011E48, #06254C)");

  const [flowStep, setFlowStep] = useState<FlowStep>("input");
  const [selectedId, setSelectedId] = useState(STARTER_SCENARIOS[0]?.id ?? "");
  const selectedScenario = useMemo(
    () => STARTER_SCENARIOS.find((scenario) => scenario.id === selectedId),
    [selectedId]
  );

  const [quickInput, setQuickInput] = useState<QuickInput>({
    payer: DEFAULT_SIMULATOR_INPUT.insurance.payer,
    severity: DEFAULT_SIMULATOR_INPUT.symptom.severity,
    durationDays: DEFAULT_SIMULATOR_INPUT.symptom.durationDays,
    sleepHours: DEFAULT_SIMULATOR_INPUT.behaviorChange.sleepHours,
  });

  const [draftInput, setDraftInput] = useState<SimulatorInput>(
    selectedScenario?.input ?? DEFAULT_SIMULATOR_INPUT
  );
  const [simulatedInput, setSimulatedInput] = useState<SimulatorInput>(
    selectedScenario?.input ?? DEFAULT_SIMULATOR_INPUT
  );
  const [result, setResult] = useState<SimulationResult>(() =>
    runWellnessMirrorSimulation(selectedScenario?.input ?? DEFAULT_SIMULATOR_INPUT)
  );
  const [lastAuditRunId, setLastAuditRunId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputEventLastSentRef = useRef<Record<string, number>>({});

  const inputTypes = Object.keys(draftInput);
  const outputs = [
    "Predicted twin-state updates",
    "Risk and priority signals",
    "Ranked recommended actions",
    "Follow-up questions",
    "Decision-step trace",
  ];

  const serializedInput = useMemo(
    () => JSON.stringify(simulatedInput, null, 2),
    [simulatedInput]
  );
  const serializedTrace = useMemo(
    () => JSON.stringify(result.decisionTrace, null, 2),
    [result.decisionTrace]
  );

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

  const applyScenario = (scenarioId: string) => {
    setSelectedId(scenarioId);
    const next =
      STARTER_SCENARIOS.find((scenario) => scenario.id === scenarioId)?.input ??
      DEFAULT_SIMULATOR_INPUT;
    setDraftInput(next);
    trackEvent("wm_start_scenario", { scenarioId });
    void runSimulation(next, "scenario");
  };

  const handleQuickPreview = () => {
    const input = quickInputToSimulatorInput(quickInput);
    setDraftInput(input);
    setFlowStep("preview");
    trackEvent("wm_quick_preview_start");
    void runSimulation(input, "quick_preview");
  };

  return (
    <Box
      as="main"
      minH="100vh"
      bgGradient={pageGradient}
      color="text.primary"
      py={{ base: 10, md: 20 }}
      aria-label="Wellness Mirror simulator"
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
            Wellness Mirror® Preview
          </Badge>
          <Heading as="h1" size={{ base: "lg", md: "xl" }}>
            Wellness Mirror® Scenario Explorer
          </Heading>
          <Text color={muted} maxW="4xl">
            Simple first: enter 4 inputs, get a quick preview, then open your full final report.
          </Text>
        </Stack>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} alignItems="stretch">
          <Card bg="bg.surface" borderWidth="1px" borderColor={border} borderRadius="xl">
            <CardBody>
              <Stack spacing={4}>
                <Heading as="h2" size="sm">
                  Step 1: Quick Check (4 inputs)
                </Heading>
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
                  </FormControl>

                  <FormControl>
                    <FormLabel htmlFor="quick-severity" fontSize="sm">
                      Symptom severity
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
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel htmlFor="quick-duration" fontSize="sm">
                      Symptom duration (days)
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
                      Sleep (hours/night)
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
                    <FormHelperText fontSize="xs">Fast preview input set</FormHelperText>
                  </FormControl>
                </Grid>

                <Button
                  alignSelf="flex-start"
                  isLoading={isRunning}
                  loadingText="Running"
                  aria-live="polite"
                  onClick={handleQuickPreview}
                >
                  Get preview
                </Button>
              </Stack>
            </CardBody>
          </Card>

          <Card bg="bg.surface" borderWidth="1px" borderColor={border} borderRadius="xl">
            <CardBody>
              <Stack spacing={4} h="100%">
                <Heading as="h2" size="sm">
                  Digital Twin Avatar (Placeholder)
                </Heading>
                <Text color={muted} fontSize="sm">
                  Reserved space for the upcoming full-body avatar and digital twin profile visualization.
                </Text>
                <Box
                  flex="1"
                  minH="260px"
                  borderRadius="xl"
                  bgGradient={avatarBg}
                  borderWidth="1px"
                  borderColor={border}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  position="relative"
                >
                  <Box textAlign="center">
                    <Box
                      w="52px"
                      h="52px"
                      borderRadius="full"
                      bg="rgba(25,37,134,0.85)"
                      mx="auto"
                      mb={2}
                    />
                    <Box
                      w="80px"
                      h="120px"
                      borderRadius="24px"
                      bg="rgba(25,37,134,0.78)"
                      mx="auto"
                    />
                    <Text fontSize="xs" color={muted} mt={3}>
                      Human digital twin canvas
                    </Text>
                  </Box>
                </Box>
              </Stack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {flowStep !== "input" && (
          <Card bg="bg.surface" borderWidth="1px" borderColor={border} borderRadius="xl">
            <CardBody>
              <Stack spacing={3}>
                <Heading as="h2" size="sm">
                  Step 2: Preview Results
                </Heading>
                <Text fontSize="sm">
                  Risk score: <b>{result.riskScore}</b> ({result.riskLevel})
                </Text>
                {result.riskSignals.length ? (
                  <Stack spacing={1}>
                    {result.riskSignals.slice(0, 3).map((signal) => (
                      <Text key={signal} fontSize="sm">
                        - {signal}
                      </Text>
                    ))}
                  </Stack>
                ) : (
                  <Text fontSize="sm" color={muted}>
                    No active risk signals for this quick preview.
                  </Text>
                )}

                <Box>
                  <Text fontSize="sm" fontWeight="700" mb={1}>
                    Top recommended actions:
                  </Text>
                  <Stack spacing={1}>
                    {result.recommendations.slice(0, 2).map((recommendation) => (
                      <Text key={recommendation.id} fontSize="sm">
                        - {recommendation.title}
                      </Text>
                    ))}
                  </Stack>
                </Box>

                <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
                  {flowStep !== "full" && (
                    <Button
                      onClick={() => {
                        setFlowStep("full");
                        trackEvent("wm_open_full_report");
                      }}
                    >
                      Step 3: See full final report
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFlowStep("input");
                      trackEvent("wm_back_to_quick");
                    }}
                  >
                    Edit quick inputs
                  </Button>
                </Stack>
              </Stack>
            </CardBody>
          </Card>
        )}

        {flowStep === "full" && (
          <>
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

            <Card bg="bg.surface" borderWidth="1px" borderColor={border} borderRadius="xl" as="section" aria-labelledby="scenario-input-heading">
              <CardBody>
                <Stack spacing={4}>
                  <Heading id="scenario-input-heading" as="h2" size="sm">Scenario input</Heading>
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                    <FormControl>
                      <FormLabel htmlFor="insurance-payer" fontSize="sm">Insurance payer</FormLabel>
                      <Input
                        id="insurance-payer"
                        value={draftInput.insurance.payer}
                        onChange={(e) => {
                          setDraftInput((prev) => ({
                            ...prev,
                            insurance: { ...prev.insurance, payer: e.target.value },
                          }));
                          trackInputChange("insurance.payer");
                        }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel htmlFor="profile-state" fontSize="sm">State</FormLabel>
                      <Input
                        id="profile-state"
                        value={draftInput.profile.state}
                        onChange={(e) => {
                          setDraftInput((prev) => ({
                            ...prev,
                            profile: { ...prev.profile, state: e.target.value.toUpperCase() },
                          }));
                          trackInputChange("profile.state");
                        }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel htmlFor="symptom-severity" fontSize="sm">Symptom severity</FormLabel>
                      <Select
                        id="symptom-severity"
                        value={draftInput.symptom.severity}
                        onChange={(e) => {
                          setDraftInput((prev) => ({
                            ...prev,
                            symptom: { ...prev.symptom, severity: e.target.value as SymptomSeverity },
                          }));
                          trackInputChange("symptom.severity");
                        }}
                      >
                        <option value="low">Low</option>
                        <option value="moderate">Moderate</option>
                        <option value="high">High</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel htmlFor="symptom-duration" fontSize="sm">Symptom duration (days)</FormLabel>
                      <NumberInput
                        min={1}
                        max={180}
                        value={draftInput.symptom.durationDays}
                        onChange={(_, value) => {
                          setDraftInput((prev) => ({
                            ...prev,
                            symptom: { ...prev.symptom, durationDays: Number.isFinite(value) ? value : 1 },
                          }));
                          trackInputChange("symptom.durationDays");
                        }}
                      >
                        <NumberInputField id="symptom-duration" />
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel htmlFor="med-adherence" fontSize="sm">Medication adherence (%)</FormLabel>
                      <NumberInput
                        min={0}
                        max={100}
                        value={draftInput.medication.adherencePercent}
                        onChange={(_, value) => {
                          setDraftInput((prev) => ({
                            ...prev,
                            medication: {
                              ...prev.medication,
                              adherencePercent: Number.isFinite(value) ? value : 0,
                            },
                          }));
                          trackInputChange("medication.adherencePercent");
                        }}
                      >
                        <NumberInputField id="med-adherence" />
                      </NumberInput>
                      <FormHelperText fontSize="xs">0 to 100%</FormHelperText>
                    </FormControl>

                    <FormControl>
                      <FormLabel htmlFor="sleep-hours" fontSize="sm">Sleep (hours/night)</FormLabel>
                      <NumberInput
                        min={0}
                        max={12}
                        value={draftInput.behaviorChange.sleepHours}
                        onChange={(_, value) => {
                          setDraftInput((prev) => ({
                            ...prev,
                            behaviorChange: {
                              ...prev.behaviorChange,
                              sleepHours: Number.isFinite(value) ? value : 0,
                            },
                          }));
                          trackInputChange("behaviorChange.sleepHours");
                        }}
                      >
                        <NumberInputField id="sleep-hours" />
                      </NumberInput>
                    </FormControl>
                  </Grid>

                  <FormControl>
                    <FormLabel htmlFor="symptom-description" fontSize="sm">Symptom description</FormLabel>
                    <Textarea
                      id="symptom-description"
                      value={draftInput.symptom.description}
                      onChange={(e) => {
                        setDraftInput((prev) => ({
                          ...prev,
                          symptom: { ...prev.symptom, description: e.target.value },
                        }));
                        trackInputChange("symptom.description");
                      }}
                      rows={3}
                    />
                  </FormControl>

                  <Button
                    alignSelf="flex-start"
                    isLoading={isRunning}
                    loadingText="Running"
                    aria-live="polite"
                    onClick={() => {
                      void runSimulation(draftInput, "manual");
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
                      {result.riskSignals.length ? (
                        result.riskSignals.map((signal) => (
                          <Text key={signal} fontSize="sm">- {signal}</Text>
                        ))
                      ) : (
                        <Text fontSize="sm" color={muted}>No active risk signals for this scenario.</Text>
                      )}
                    </Stack>
                  </Stack>
                </CardBody>
              </Card>

              <Card bg="bg.surface" borderWidth="1px" borderColor={border} borderRadius="xl">
                <CardBody>
                  <Stack spacing={3}>
                    <Heading as="h2" size="sm">Twin-state updates</Heading>
                    {result.twinStateUpdates.length ? (
                      result.twinStateUpdates.map((update) => (
                        <Box key={`${update.field}-${update.summary}`} borderWidth="1px" borderColor={border} borderRadius="md" px={3} py={2}>
                          <Text fontSize="sm"><b>{update.field}</b> ({update.direction})</Text>
                          <Text fontSize="sm" color={muted}>{update.summary}</Text>
                        </Box>
                      ))
                    ) : (
                      <Text fontSize="sm" color={muted}>No state deltas detected for this run.</Text>
                    )}
                  </Stack>
                </CardBody>
              </Card>
            </SimpleGrid>

            <Card bg="bg.surface" borderWidth="1px" borderColor={border} borderRadius="xl">
              <CardBody>
                <Stack spacing={3}>
                  <Heading as="h2" size="sm">Ranked recommended actions</Heading>
                  {result.recommendations.length ? (
                    result.recommendations.map((recommendation) => (
                      <Box key={recommendation.id} borderWidth="1px" borderColor={border} borderRadius="md" px={3} py={2}>
                        <Text fontSize="sm">
                          <b>{recommendation.title}</b> (priority {recommendation.priority})
                        </Text>
                        <Text fontSize="sm" color={muted}>{recommendation.rationale}</Text>
                        <Text fontSize="sm" color={muted}>{recommendation.coverageNote}</Text>
                      </Box>
                    ))
                  ) : (
                    <Text fontSize="sm" color={muted}>No actions generated yet.</Text>
                  )}
                </Stack>
              </CardBody>
            </Card>

            <Card bg="bg.surface" borderWidth="1px" borderColor={border} borderRadius="xl">
              <CardBody>
                <Stack spacing={3}>
                  <Heading as="h2" size="sm">Follow-up questions</Heading>
                  {result.followUpQuestions.length ? (
                    result.followUpQuestions.map((question) => (
                      <Text key={question} fontSize="sm">- {question}</Text>
                    ))
                  ) : (
                    <Text fontSize="sm" color={muted}>No follow-up questions for this run.</Text>
                  )}
                </Stack>
              </CardBody>
            </Card>

            <Card bg="bg.surface" borderWidth="1px" borderColor={border} borderRadius="xl">
              <CardBody>
                <Stack spacing={3}>
                  <Heading as="h2" size="sm">Under The Hood</Heading>
                  <Text color={muted} fontSize="sm">
                    This page exposes pipeline versions, rule hits, coverage constraints, and reasoning steps used to rank actions.
                  </Text>
                  <Text color={muted} fontSize="sm">
                    {result.pipelineVersion} | {result.policyVersion} | {result.guardrailVersion} | {result.coverageVersion}
                  </Text>
                  <Box as="pre" fontSize="xs" borderWidth="1px" borderColor={border} borderRadius="md" p={3} overflowX="auto">
                    {serializedInput}
                  </Box>
                  <Box as="pre" fontSize="xs" borderWidth="1px" borderColor={border} borderRadius="md" p={3} overflowX="auto">
                    {serializedTrace}
                  </Box>
                </Stack>
              </CardBody>
            </Card>
          </>
        )}

        {errorMessage && (
          <Alert status="error" borderRadius="lg" role="alert">
            <AlertIcon />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Alert status="info" borderRadius="lg" variant="subtle">
          <AlertIcon />
          <AlertDescription fontSize="sm">
            Wellness Mirror is a planning and education tool. It is not medical diagnosis or treatment.
          </AlertDescription>
        </Alert>

        <Alert status="success" borderRadius="lg" variant="subtle" role="status">
          <AlertIcon />
          <AlertDescription fontSize="sm">
            Audit logging enabled with redaction. Free-text inputs are excluded from stored records.
            {lastAuditRunId ? ` Latest run ID: ${lastAuditRunId}.` : ""}
          </AlertDescription>
        </Alert>

        <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
          <Button
            as={RouterLink}
            to={APP_LINKS.internal.whyVeeVee}
            borderRadius="full"
            px={8}
            fontWeight="700"
            onClick={() => trackEvent("wm_cta_click", { cta: "explore_features" })}
          >
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
            onClick={() => trackEvent("wm_cta_click", { cta: "login" })}
          >
            Log in
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
