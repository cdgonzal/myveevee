import {
  Badge,
  Box,
  Button,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { trackCtaClick } from "../analytics/trackCtaClick";
import { trackEvent } from "../analytics/trackEvent";
import { APP_LINKS } from "../config/links";
import { runWellnessMirrorSimulation, type SimulationResult } from "../simulator/engine";
import { DEFAULT_SIMULATOR_INPUT, type SimulatorInput } from "../simulator/schema";

type FunnelStep = 0 | 1 | 2 | 3;

type UploadOption = {
  id: string;
  title: string;
  icon: string;
  micro: string;
  metrics: string[];
  input: SimulatorInput;
};

type EvolutionOption = {
  id: string;
  title: string;
  icon: string;
  micro: string;
  metrics: string[];
  apply: (input: SimulatorInput) => SimulatorInput;
};

const FUNNEL_STEPS = [
  { key: "data", label: "Data In", icon: "IN" },
  { key: "twin", label: "Twin", icon: "TW" },
  { key: "insights", label: "Insights", icon: "IQ" },
  { key: "decisions", label: "Decide", icon: "GO" },
] as const;

const UPLOAD_OPTIONS: UploadOption[] = [
  {
    id: "mri",
    title: "MRI Scan",
    icon: "MRI",
    micro: "Imaging upload",
    metrics: ["Pain", "Scan", "Priority"],
    input: {
      ...DEFAULT_SIMULATOR_INPUT,
      symptom: {
        description: "Persistent pain and pressure after a recent MRI review",
        durationDays: 16,
        severity: "high",
      },
      behaviorChange: {
        sleepHours: 5,
        exerciseDaysPerWeek: 0,
      },
      labs: {
        a1c: 8.3,
        systolicBp: 142,
        ldl: 132,
      },
      lifestyleEvent: {
        event: "MRI findings added to the twin for deeper review",
        timing: "recent",
      },
    },
  },
  {
    id: "health-record",
    title: "Health Record",
    icon: "REC",
    micro: "Full record import",
    metrics: ["Visits", "Meds", "History"],
    input: {
      ...DEFAULT_SIMULATOR_INPUT,
      symptom: {
        description: "Ongoing headaches and fatigue across recent visits",
        durationDays: 10,
        severity: "moderate",
      },
      medication: {
        currentlyTaking: ["Metformin", "Lisinopril"],
        adherencePercent: 72,
      },
      lifestyleEvent: {
        event: "Historical visit notes and medication history imported",
        timing: "recent",
      },
    },
  },
  {
    id: "injury-image",
    title: "Injury Image",
    icon: "IMG",
    micro: "Visual injury input",
    metrics: ["Swelling", "Triage", "Fast"],
    input: {
      ...DEFAULT_SIMULATOR_INPUT,
      profile: {
        ageRange: "18-34",
        state: "FL",
        hasChronicCondition: false,
      },
      insurance: {
        payer: "UnitedHealthcare",
        planType: "commercial",
        hasPcpAssigned: true,
      },
      symptom: {
        description: "Visible injury with swelling and worsening pain",
        durationDays: 3,
        severity: "high",
      },
      behaviorChange: {
        sleepHours: 6,
        exerciseDaysPerWeek: 1,
      },
      medication: {
        currentlyTaking: [],
        adherencePercent: 100,
      },
      labs: {
        systolicBp: 128,
      },
      lifestyleEvent: {
        event: "A new injury photo was added for same-day review",
        timing: "current",
      },
    },
  },
  {
    id: "lab-panel",
    title: "Lab Panel",
    icon: "LAB",
    micro: "Fresh biomarker data",
    metrics: ["A1C", "BP", "Trend"],
    input: {
      ...DEFAULT_SIMULATOR_INPUT,
      insurance: {
        payer: "Medicare",
        planType: "medicare",
        hasPcpAssigned: false,
      },
      symptom: {
        description: "Low energy after new lab results came back",
        durationDays: 12,
        severity: "moderate",
      },
      labs: {
        a1c: 8.6,
        systolicBp: 146,
        ldl: 145,
      },
      lifestyleEvent: {
        event: "New lab panel added to the digital twin",
        timing: "recent",
      },
    },
  },
];

const EVOLUTION_OPTIONS: EvolutionOption[] = [
  {
    id: "symptom-timeline",
    title: "Timeline",
    icon: "24H",
    micro: "Symptoms over time",
    metrics: ["+7 days", "Pattern", "Watch"],
    apply: (input) => ({
      ...input,
      symptom: {
        ...input.symptom,
        durationDays: input.symptom.durationDays + 7,
      },
      lifestyleEvent: {
        event: "Symptom timeline added to show progression over time",
        timing: "recent",
      },
    }),
  },
  {
    id: "sleep-routine",
    title: "Sleep",
    icon: "ZZ",
    micro: "Routine signal",
    metrics: ["Recovery", "Stress", "Rhythm"],
    apply: (input) => ({
      ...input,
      behaviorChange: {
        ...input.behaviorChange,
        sleepHours: Math.max(4, input.behaviorChange.sleepHours - 1),
      },
      lifestyleEvent: {
        event: "Sleep and routine changes connected to the twin",
        timing: "recent",
      },
    }),
  },
  {
    id: "medication-history",
    title: "Meds",
    icon: "RX",
    micro: "Adherence history",
    metrics: ["Refill", "Dose", "Adherence"],
    apply: (input) => ({
      ...input,
      medication: {
        currentlyTaking:
          input.medication.currentlyTaking.length > 0
            ? input.medication.currentlyTaking
            : ["Ibuprofen"],
        adherencePercent: Math.min(input.medication.adherencePercent, 58),
      },
    }),
  },
  {
    id: "care-goals",
    title: "Goals",
    icon: "AI",
    micro: "Long-view context",
    metrics: ["Chronic", "PCP", "Care path"],
    apply: (input) => ({
      ...input,
      profile: {
        ...input.profile,
        hasChronicCondition: true,
      },
      insurance: {
        ...input.insurance,
        hasPcpAssigned: true,
      },
    }),
  },
];

function cloneInput(input: SimulatorInput): SimulatorInput {
  return {
    profile: { ...input.profile },
    insurance: { ...input.insurance },
    symptom: { ...input.symptom },
    behaviorChange: { ...input.behaviorChange },
    medication: {
      ...input.medication,
      currentlyTaking: [...input.medication.currentlyTaking],
    },
    labs: { ...input.labs },
    lifestyleEvent: { ...input.lifestyleEvent },
  };
}

function MetricChip({ label }: { label: string }) {
  return (
    <Box
      px={3}
      py={1.5}
      borderRadius="full"
      bg="rgba(17, 119, 186, 0.10)"
      border="1px solid rgba(17, 119, 186, 0.16)"
    >
      <Text fontSize="xs" fontWeight="700" letterSpacing="0.04em">
        {label}
      </Text>
    </Box>
  );
}

function IconTile({
  icon,
  title,
  micro,
  metrics,
  isSelected,
  onClick,
  border,
  activeBorder,
  cardBg,
  activeCardBg,
}: {
  icon: string;
  title: string;
  micro: string;
  metrics: string[];
  isSelected: boolean;
  onClick: () => void;
  border: string;
  activeBorder: string;
  cardBg: string;
  activeCardBg: string;
}) {
  return (
    <Box
      borderWidth="1px"
      borderColor={isSelected ? activeBorder : border}
      borderRadius="3xl"
      bg={isSelected ? activeCardBg : cardBg}
      p={5}
      cursor="pointer"
      onClick={onClick}
      boxShadow={isSelected ? "0 18px 36px rgba(17, 119, 186, 0.16)" : "0 10px 24px rgba(6, 37, 76, 0.06)"}
    >
      <Stack spacing={4}>
        <Box
          w="64px"
          h="64px"
          borderRadius="2xl"
          bg={isSelected ? "accent.primary" : "rgba(17, 119, 186, 0.10)"}
          color={isSelected ? "white" : "accent.primary"}
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="lg"
          fontWeight="900"
          letterSpacing="0.08em"
        >
          {icon}
        </Box>
        <Box>
          <Heading as="h3" size="sm" mb={1}>
            {title}
          </Heading>
          <Text fontSize="sm" color="text.muted">
            {micro}
          </Text>
        </Box>
        <Stack direction="row" flexWrap="wrap" spacing={2}>
          {metrics.map((metric) => (
            <MetricChip key={`${title}-${metric}`} label={metric} />
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

function MetricCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "accent";
}) {
  return (
    <Box
      borderWidth="1px"
      borderColor={tone === "accent" ? "rgba(17, 119, 186, 0.36)" : "border.default"}
      borderRadius="2xl"
      bg={tone === "accent" ? "rgba(17, 119, 186, 0.10)" : "rgba(255, 255, 255, 0.72)"}
      p={4}
    >
      <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color="text.subtle" mb={2}>
        {label}
      </Text>
      <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="900" lineHeight="1">
        {value}
      </Text>
    </Box>
  );
}

export default function HealthTwinFunnel() {
  const [step, setStep] = useState<FunnelStep>(0);
  const [selectedUploadId, setSelectedUploadId] = useState<string | null>(null);
  const [selectedEvolutionIds, setSelectedEvolutionIds] = useState<string[]>([]);

  const pageGradient = useColorModeValue(
    "linear(to-b, #FFFFFF, #9CE7FF)",
    "linear(to-b, surface.900, surface.800)"
  );
  const border = useColorModeValue("border.default", "border.default");
  const muted = useColorModeValue("text.muted", "text.muted");
  const panelBg = useColorModeValue("rgba(255, 255, 255, 0.82)", "rgba(6, 37, 76, 0.70)");
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.92)", "rgba(6, 37, 76, 0.62)");
  const activeCardBg = useColorModeValue("rgba(17, 119, 186, 0.10)", "rgba(17, 119, 186, 0.20)");
  const stepCircleBg = useColorModeValue("#001A52", "#9CE7FF");
  const stepCircleColor = useColorModeValue("#FFFFFF", "#001A52");
  const activeBorder = useColorModeValue("#1177BA", "#9CE7FF");
  const detailsBg = useColorModeValue("rgba(255,255,255,0.68)", "rgba(6, 37, 76, 0.56)");
  const insightPanelBg = useColorModeValue(
    "linear-gradient(180deg, rgba(17,119,186,0.16) 0%, rgba(156,231,255,0.52) 100%)",
    "linear-gradient(180deg, rgba(17,119,186,0.24) 0%, rgba(6,37,76,0.80) 100%)"
  );
  const insightCardBg = useColorModeValue("rgba(255,255,255,0.88)", "rgba(10, 44, 88, 0.82)");
  const insightAccentBorder = useColorModeValue("rgba(17, 119, 186, 0.34)", "rgba(156, 231, 255, 0.42)");

  const selectedUpload = useMemo(
    () => UPLOAD_OPTIONS.find((option) => option.id === selectedUploadId) ?? null,
    [selectedUploadId]
  );

  const selectedEvolution = useMemo(
    () => EVOLUTION_OPTIONS.filter((option) => selectedEvolutionIds.includes(option.id)),
    [selectedEvolutionIds]
  );

  const simulatedInput = useMemo(() => {
    if (!selectedUpload) {
      return null;
    }

    return selectedEvolution.reduce((input, option) => option.apply(input), cloneInput(selectedUpload.input));
  }, [selectedUpload, selectedEvolution]);

  const result = useMemo(
    () => (simulatedInput ? runWellnessMirrorSimulation(simulatedInput) : null),
    [simulatedInput]
  );

  const canAdvance =
    (step === 0 && !!selectedUpload) ||
    (step === 1 && selectedEvolutionIds.length > 0) ||
    step === 2 ||
    step === 3;

  const nextButtonLabel =
    step === 0
      ? "Step 2"
      : step === 1
        ? "Step 3"
        : step === 2
          ? "Step 4"
          : "Go to VeeVee";

  const handleUploadSelect = (option: UploadOption) => {
    setSelectedUploadId(option.id);
    trackEvent("health_twin_funnel_select_data_in", { upload_type: option.id });
  };

  const handleEvolutionToggle = (option: EvolutionOption) => {
    setSelectedEvolutionIds((current) => {
      const exists = current.includes(option.id);
      const next = exists ? current.filter((id) => id !== option.id) : [...current, option.id].slice(-2);
      trackEvent("health_twin_funnel_select_evolution", {
        evolution_option: option.id,
        selected_count: next.length,
      });
      return next;
    });
  };

  const handleNext = () => {
    if (step === 3) {
      trackCtaClick({
        ctaName: "health_twin_funnel_go_make_your_own",
        ctaText: "Go make your own",
        placement: "health_twin_step_4",
        destinationType: "external",
        destinationUrl: APP_LINKS.external.authenticatedConsole,
        pagePath: APP_LINKS.internal.healthTwin,
      });
      window.location.href = APP_LINKS.external.authenticatedConsole;
      return;
    }

    const nextStep = (step + 1) as FunnelStep;
    setStep(nextStep);
    trackEvent("health_twin_funnel_step_advance", { from_step: step + 1, to_step: nextStep + 1 });
  };

  const handleBack = () => {
    if (step === 0) {
      return;
    }
    const previousStep = (step - 1) as FunnelStep;
    setStep(previousStep);
    trackEvent("health_twin_funnel_step_back", { from_step: step + 1, to_step: previousStep + 1 });
  };

  return (
    <Box as="main" minH="100vh" bgGradient={pageGradient} color="text.primary" py={{ base: 10, md: 20 }}>
      <Stack spacing={{ base: 8, md: 10 }} maxW="6xl" mx="auto" px={{ base: 6, md: 10 }}>
        <Box
          borderWidth="1px"
          borderColor={border}
          borderRadius="3xl"
          bg={panelBg}
          boxShadow="0 24px 50px rgba(6, 37, 76, 0.12)"
          p={{ base: 6, md: 8 }}
        >
          <Stack spacing={6}>
            <Badge alignSelf="flex-start" colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
              Health Twin
            </Badge>
            <Stack spacing={2}>
              <Heading as="h1" size={{ base: "lg", md: "xl" }} fontWeight="900">
                1. Data In
                <br />
                2. Twin
                <br />
                3. Insights
                <br />
                4. Better Decisions
              </Heading>
              <Text fontSize={{ base: "sm", md: "md" }} color={muted} maxW="2xl">
                Build the twin. Watch it evolve. See the signal.
              </Text>
            </Stack>

            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
              {FUNNEL_STEPS.map((funnelStep, index) => {
                const isActive = index === step;
                const isComplete = index < step;

                return (
                  <Box
                    key={funnelStep.key}
                    borderWidth="1px"
                    borderColor={isActive || isComplete ? activeBorder : border}
                    borderRadius="3xl"
                    bg={isActive ? activeCardBg : cardBg}
                    p={4}
                    textAlign="center"
                  >
                    <Stack spacing={3} align="center">
                      <Box
                        w={{ base: "52px", md: "60px" }}
                        h={{ base: "52px", md: "60px" }}
                        borderRadius="2xl"
                        bg={isActive || isComplete ? stepCircleBg : "rgba(17, 119, 186, 0.10)"}
                        color={isActive || isComplete ? stepCircleColor : "accent.primary"}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontWeight="900"
                        fontSize="sm"
                        letterSpacing="0.08em"
                      >
                        {funnelStep.icon}
                      </Box>
                      <Box>
                        <Text fontSize="xs" color={muted} fontWeight="700">
                          {index + 1}
                        </Text>
                        <Text fontWeight="800" fontSize="sm">
                          {funnelStep.label}
                        </Text>
                      </Box>
                    </Stack>
                  </Box>
                );
              })}
            </SimpleGrid>

            <Box
              as="details"
              bg={detailsBg}
              borderWidth="1px"
              borderColor={border}
              borderRadius="2xl"
              px={4}
              py={3}
            >
              <Box as="summary" cursor="pointer" fontWeight="700" color="accent.soft">
                Read more
              </Box>
              <Text mt={3} color={muted} fontSize="sm">
                This is a guided preview using sample health inputs. Choose a data type, add a little more context, and the twin will generate simulated health signals, recommendations, and decision support.
              </Text>
            </Box>
          </Stack>
        </Box>

        <Box
          borderWidth="1px"
          borderColor={step === 2 ? insightAccentBorder : border}
          borderRadius="3xl"
          bg={step === 2 ? insightPanelBg : panelBg}
          boxShadow="0 20px 42px rgba(6, 37, 76, 0.10)"
          p={{ base: 6, md: 8 }}
        >
          {step === 0 ? (
            <Stack spacing={6}>
              <Box>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="accent.soft" mb={2}>
                  Step 1
                </Text>
                <Heading as="h2" size="lg" mb={1}>
                  Choose your input
                </Heading>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {UPLOAD_OPTIONS.map((option) => (
                  <IconTile
                    key={option.id}
                    icon={option.icon}
                    title={option.title}
                    micro={option.micro}
                    metrics={option.metrics}
                    isSelected={option.id === selectedUploadId}
                    onClick={() => handleUploadSelect(option)}
                    border={border}
                    activeBorder={activeBorder}
                    cardBg={cardBg}
                    activeCardBg={activeCardBg}
                  />
                ))}
              </SimpleGrid>
            </Stack>
          ) : null}

          {step === 1 ? (
            <Stack spacing={6}>
              <Box>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="accent.soft" mb={2}>
                  Step 2
                </Text>
                <Heading as="h2" size="lg" mb={1}>
                  Evolve the twin
                </Heading>
                <Text fontSize="sm" color={muted}>
                  Pick up to 2
                </Text>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {EVOLUTION_OPTIONS.map((option) => (
                  <IconTile
                    key={option.id}
                    icon={option.icon}
                    title={option.title}
                    micro={option.micro}
                    metrics={option.metrics}
                    isSelected={selectedEvolutionIds.includes(option.id)}
                    onClick={() => handleEvolutionToggle(option)}
                    border={border}
                    activeBorder={activeBorder}
                    cardBg={cardBg}
                    activeCardBg={activeCardBg}
                  />
                ))}
              </SimpleGrid>
            </Stack>
          ) : null}

          {step === 2 && selectedUpload && result && simulatedInput ? (
            <Stack spacing={6}>
              <Box>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="accent.soft" mb={2}>
                  Step 3
                </Text>
                <Heading as="h2" size="lg" mb={1}>
                  Your best-version twin snapshot
                </Heading>
                <Text fontSize="sm" color={muted}>
                  Stronger patterns. Smarter momentum. Clearer next moves.
                </Text>
              </Box>

              <SimpleGrid columns={{ base: 2, md: 5 }} spacing={3}>
                <MetricCard label="Twin State" value={result.riskLevel.toUpperCase()} tone="accent" />
                <MetricCard label="Momentum" value={String(result.riskScore)} />
                <MetricCard label="Recovery" value={`${simulatedInput.behaviorChange.sleepHours}h`} />
                <MetricCard label="Consistency" value={`${simulatedInput.medication.adherencePercent}%`} />
                <MetricCard label="Pressure" value={simulatedInput.labs.systolicBp ? `${simulatedInput.labs.systolicBp}` : "--"} />
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Box borderWidth="1px" borderColor={insightAccentBorder} borderRadius="3xl" bg={insightCardBg} p={5}>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color="accent.soft" mb={3}>
                    Best signals
                  </Text>
                  <Stack spacing={2}>
                    {(result.riskSignals.length > 0 ? result.riskSignals : ["Lower-risk pattern"])
                      .slice(0, 3)
                      .map((signal) => (
                        <MetricChip key={signal} label={signal} />
                      ))}
                  </Stack>
                </Box>

                <Box borderWidth="1px" borderColor={insightAccentBorder} borderRadius="3xl" bg={insightCardBg} p={5}>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color="accent.soft" mb={3}>
                    Best next moves
                  </Text>
                  <Stack spacing={2}>
                    {result.recommendations.slice(0, 3).map((recommendation) => (
                      <MetricChip key={recommendation.id} label={recommendation.title} />
                    ))}
                  </Stack>
                </Box>

                <Box borderWidth="1px" borderColor={insightAccentBorder} borderRadius="3xl" bg={insightCardBg} p={5}>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color="accent.soft" mb={3}>
                    Keep getting better
                  </Text>
                  <Stack spacing={2}>
                    {result.followUpQuestions.slice(0, 3).map((question) => (
                      <MetricChip key={question} label={question} />
                    ))}
                  </Stack>
                </Box>
              </SimpleGrid>

              <Box
                as="details"
                bg={insightCardBg}
                borderWidth="1px"
                borderColor={insightAccentBorder}
                borderRadius="2xl"
                px={4}
                py={3}
              >
                <Box as="summary" cursor="pointer" fontWeight="700" color="accent.soft">
                  Read more
                </Box>
                <Text mt={3} color={muted} fontSize="sm">
                  {selectedUpload.title} plus {selectedEvolution.map((option) => option.title).join(" + ")} created this simulation result.
                </Text>
              </Box>
            </Stack>
          ) : null}

          {step === 3 ? (
            <Stack spacing={6}>
              <Box>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="accent.soft" mb={2}>
                  Step 4
                </Text>
                <Heading as="h2" size="lg" mb={1}>
                  Create your own Health Twin
                </Heading>
                <Text fontSize="sm" color={muted} maxW="2xl">
                  It takes seconds. It is free. Start now.
                </Text>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <IconTile
                  icon="YOU"
                  title="Make it yours"
                  micro="Your real health story"
                  metrics={["Personal", "Private", "Yours"]}
                  isSelected={false}
                  onClick={() => undefined}
                  border={border}
                  activeBorder={activeBorder}
                  cardBg={cardBg}
                  activeCardBg={activeCardBg}
                />
                <IconTile
                  icon="TWN"
                  title="Start free"
                  micro="No wait. No friction."
                  metrics={["FREE", "Fast", "Simple"]}
                  isSelected={false}
                  onClick={() => undefined}
                  border={border}
                  activeBorder={activeBorder}
                  cardBg={cardBg}
                  activeCardBg={activeCardBg}
                />
                <IconTile
                  icon="GO"
                  title="Do it now"
                  micro="Build your twin today"
                  metrics={["Seconds", "Now", "Go"]}
                  isSelected={false}
                  onClick={() => undefined}
                  border={border}
                  activeBorder={activeBorder}
                  cardBg={cardBg}
                  activeCardBg={activeCardBg}
                />
              </SimpleGrid>

              <Button
                as="a"
                href={APP_LINKS.external.authenticatedConsole}
                size="lg"
                borderRadius="full"
                px={10}
                fontWeight="800"
                alignSelf="flex-start"
                boxShadow="0 0 36px rgba(17, 119, 186, 0.35)"
              >
                Create my own Health Twin
              </Button>

              <Text fontSize="sm" fontWeight="800" color="accent.soft">
                FREE. Takes seconds. Start yours now.
              </Text>

              <Button
                as={RouterLink}
                to={APP_LINKS.internal.healthTwin}
                variant="ghost"
                alignSelf="flex-start"
                onClick={() => {
                  setStep(0);
                  setSelectedUploadId(null);
                  setSelectedEvolutionIds([]);
                  trackEvent("health_twin_funnel_restart");
                }}
              >
                Start over
              </Button>
            </Stack>
          ) : null}
        </Box>

        <Stack direction={{ base: "column", sm: "row" }} justify="space-between" spacing={3}>
          <Button variant="ghost" onClick={handleBack} isDisabled={step === 0}>
            Back
          </Button>
          {step < 3 ? (
            <Button
              onClick={handleNext}
              isDisabled={!canAdvance}
              borderRadius="full"
              px={8}
              fontWeight="800"
              boxShadow="0 0 28px rgba(17, 119, 186, 0.28)"
            >
              {nextButtonLabel}
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
}
