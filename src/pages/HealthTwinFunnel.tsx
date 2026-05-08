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
  summary: string;
  detail: string;
  input: SimulatorInput;
};

type EvolutionOption = {
  id: string;
  title: string;
  icon: string;
  summary: string;
  apply: (input: SimulatorInput) => SimulatorInput;
};

const FUNNEL_STEPS = [
  { key: "data", label: "Data In" },
  { key: "twin", label: "Your Twin Evolves" },
  { key: "insights", label: "Insights & Simulations" },
  { key: "decisions", label: "Better Decisions" },
] as const;

const UPLOAD_OPTIONS: UploadOption[] = [
  {
    id: "mri",
    title: "MRI Scan",
    icon: "🧠",
    summary: "Simulate bringing in imaging that adds more clinical context to the twin.",
    detail: "Imaging suggests a more serious pattern that should be reviewed soon.",
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
    icon: "📄",
    summary: "Simulate importing a broader medical record history into one place.",
    detail: "A fuller record gives the twin more longitudinal context to work from.",
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
    icon: "🩹",
    summary: "Simulate uploading a photo of an injury or physical change that needs a quick read.",
    detail: "An injury image can push the twin toward faster triage-style guidance.",
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
    icon: "🧪",
    summary: "Simulate feeding in fresh lab results that change the picture over time.",
    detail: "Lab trend data helps the twin spot issues that are easy to miss day to day.",
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
    title: "Symptoms over time",
    icon: "📈",
    summary: "Show how the issue has been changing instead of treating it like a one-time event.",
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
    title: "Sleep and routine",
    icon: "😴",
    summary: "Add daily behavior patterns that can shape recovery, stress, and symptom load.",
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
    title: "Medication history",
    icon: "💊",
    summary: "Add adherence and treatment history so the twin can model likely care friction.",
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
    title: "Care goals and history",
    icon: "🎯",
    summary: "Add background context about long-term goals and existing conditions.",
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

function resultNarrative(upload: UploadOption, evolutionTitles: string[], result: SimulationResult): string {
  const evolutionText =
    evolutionTitles.length === 0 ? "basic personal context" : evolutionTitles.join(", ").toLowerCase();

  if (result.riskLevel === "urgent" || result.riskLevel === "high") {
    return `${upload.title} plus ${evolutionText} pushed this twin toward faster follow-up, stronger triage signals, and clearer next actions.`;
  }

  if (result.riskLevel === "moderate") {
    return `${upload.title} plus ${evolutionText} gave the twin enough depth to surface practical next steps and a steadier follow-up plan.`;
  }

  return `${upload.title} plus ${evolutionText} created a lower-risk picture with coaching-oriented insights and clearer decision support.`;
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
      ? "Continue to Twin Evolution"
      : step === 1
        ? "See Insights & Simulations"
        : step === 2
          ? "Continue to Better Decisions"
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
        <Box borderWidth="1px" borderColor={border} borderRadius="3xl" bg={panelBg} boxShadow="0 24px 50px rgba(6, 37, 76, 0.12)" p={{ base: 6, md: 8 }}>
          <Stack spacing={4}>
            <Badge alignSelf="flex-start" colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
              Health Twin Funnel
            </Badge>
            <Heading as="h1" size={{ base: "lg", md: "xl" }} fontWeight="800">
              Create a Health Twin in four guided steps.
            </Heading>
            <Text color={muted} maxW="4xl" fontSize={{ base: "md", md: "lg" }}>
              This is a simulated marketing walkthrough: bring in sample health data, evolve the twin with a little more context, see the resulting insights, and then decide if you want the real VeeVee experience.
            </Text>
          </Stack>
        </Box>

        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
          {FUNNEL_STEPS.map((funnelStep, index) => {
            const isActive = index === step;
            const isComplete = index < step;

            return (
              <Box
                key={funnelStep.key}
                borderWidth="1px"
                borderColor={isActive || isComplete ? activeBorder : border}
                borderRadius="2xl"
                bg={isActive ? activeCardBg : cardBg}
                p={4}
              >
                <Stack direction="row" spacing={3} align="center">
                  <Box
                    w="36px"
                    h="36px"
                    borderRadius="full"
                    bg={isActive || isComplete ? stepCircleBg : "transparent"}
                    color={isActive || isComplete ? stepCircleColor : muted}
                    border="1px solid"
                    borderColor={isActive || isComplete ? stepCircleBg : border}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontWeight="800"
                    fontSize="sm"
                  >
                    {index + 1}
                  </Box>
                  <Text fontWeight="700" fontSize="sm">
                    {funnelStep.label}
                  </Text>
                </Stack>
              </Box>
            );
          })}
        </SimpleGrid>

        <Box borderWidth="1px" borderColor={border} borderRadius="3xl" bg={panelBg} boxShadow="0 20px 42px rgba(6, 37, 76, 0.10)" p={{ base: 6, md: 8 }}>
          {step === 0 ? (
            <Stack spacing={6}>
              <Box>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="accent.soft" mb={2}>
                  Step 1 of 4
                </Text>
                <Heading as="h2" size="lg" mb={2}>
                  What kind of health data do you want to bring in?
                </Heading>
                <Text color={muted}>
                  Pick one sample asset to simulate an upload into the twin.
                </Text>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {UPLOAD_OPTIONS.map((option) => {
                  const isSelected = option.id === selectedUploadId;

                  return (
                    <Box
                      key={option.id}
                      borderWidth="1px"
                      borderColor={isSelected ? activeBorder : border}
                      borderRadius="2xl"
                      bg={isSelected ? activeCardBg : cardBg}
                      p={5}
                      cursor="pointer"
                      onClick={() => handleUploadSelect(option)}
                    >
                      <Stack spacing={3}>
                        <Text fontSize="3xl">{option.icon}</Text>
                        <Heading as="h3" size="sm">
                          {option.title}
                        </Heading>
                        <Text fontSize="sm" color={muted}>
                          {option.summary}
                        </Text>
                        <Text fontSize="sm" color="text.primary">
                          {option.detail}
                        </Text>
                      </Stack>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </Stack>
          ) : null}

          {step === 1 ? (
            <Stack spacing={6}>
              <Box>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="accent.soft" mb={2}>
                  Step 2 of 4
                </Text>
                <Heading as="h2" size="lg" mb={2}>
                  What else helps your twin understand you better?
                </Heading>
                <Text color={muted}>
                  Select up to two context layers that make the twin evolve beyond the first upload.
                </Text>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {EVOLUTION_OPTIONS.map((option) => {
                  const isSelected = selectedEvolutionIds.includes(option.id);

                  return (
                    <Box
                      key={option.id}
                      borderWidth="1px"
                      borderColor={isSelected ? activeBorder : border}
                      borderRadius="2xl"
                      bg={isSelected ? activeCardBg : cardBg}
                      p={5}
                      cursor="pointer"
                      onClick={() => handleEvolutionToggle(option)}
                    >
                      <Stack spacing={3}>
                        <Text fontSize="3xl">{option.icon}</Text>
                        <Heading as="h3" size="sm">
                          {option.title}
                        </Heading>
                        <Text fontSize="sm" color={muted}>
                          {option.summary}
                        </Text>
                        <Text fontSize="xs" color="accent.soft" fontWeight="700">
                          {isSelected ? "Selected" : "Tap to add"}
                        </Text>
                      </Stack>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </Stack>
          ) : null}

          {step === 2 && selectedUpload && result ? (
            <Stack spacing={6}>
              <Box>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="accent.soft" mb={2}>
                  Step 3 of 4
                </Text>
                <Heading as="h2" size="lg" mb={2}>
                  Your simulated twin results are in.
                </Heading>
                <Text color={muted}>
                  {resultNarrative(
                    selectedUpload,
                    selectedEvolution.map((option) => option.title),
                    result
                  )}
                </Text>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Box borderWidth="1px" borderColor={activeBorder} borderRadius="2xl" bg={cardBg} p={5}>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="accent.soft" mb={2}>
                    Twin status
                  </Text>
                  <Heading as="h3" size="sm" mb={3}>
                    Risk level: {result.riskLevel}
                  </Heading>
                  <Text fontSize="sm" color={muted}>
                    Risk score {result.riskScore}. The twin is prioritizing what needs attention first.
                  </Text>
                </Box>

                <Box borderWidth="1px" borderColor={border} borderRadius="2xl" bg={cardBg} p={5}>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="accent.soft" mb={2}>
                    Insights
                  </Text>
                  <Stack spacing={2}>
                    {(result.riskSignals.length > 0 ? result.riskSignals : ["The twin is watching a lower-risk pattern right now."])
                      .slice(0, 3)
                      .map((signal) => (
                        <Text key={signal} fontSize="sm" color={muted}>
                          {signal}
                        </Text>
                      ))}
                  </Stack>
                </Box>

                <Box borderWidth="1px" borderColor={border} borderRadius="2xl" bg={cardBg} p={5}>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="accent.soft" mb={2}>
                    Simulation direction
                  </Text>
                  <Stack spacing={2}>
                    {result.twinStateUpdates.slice(0, 3).map((update) => (
                      <Text key={update.field} fontSize="sm" color={muted}>
                        {update.summary}
                      </Text>
                    ))}
                  </Stack>
                </Box>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box borderWidth="1px" borderColor={border} borderRadius="2xl" bg={cardBg} p={5}>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="accent.soft" mb={3}>
                    Recommended next moves
                  </Text>
                  <Stack spacing={3}>
                    {result.recommendations.slice(0, 3).map((recommendation) => (
                      <Box key={recommendation.id}>
                        <Text fontWeight="700" fontSize="sm">
                          {recommendation.title}
                        </Text>
                        <Text fontSize="sm" color={muted}>
                          {recommendation.rationale}
                        </Text>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                <Box borderWidth="1px" borderColor={border} borderRadius="2xl" bg={cardBg} p={5}>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="accent.soft" mb={3}>
                    Better questions to ask
                  </Text>
                  <Stack spacing={3}>
                    {result.followUpQuestions.slice(0, 3).map((question) => (
                      <Text key={question} fontSize="sm" color={muted}>
                        {question}
                      </Text>
                    ))}
                  </Stack>
                </Box>
              </SimpleGrid>
            </Stack>
          ) : null}

          {step === 3 ? (
            <Stack spacing={6}>
              <Box>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="accent.soft" mb={2}>
                  Step 4 of 4
                </Text>
                <Heading as="h2" size="lg" mb={2}>
                  Want better decisions? Go make your own.
                </Heading>
                <Text color={muted} maxW="3xl">
                  You just previewed what happens when VeeVee turns sample data into a living twin. The next step is to create one built around your real records, history, and care decisions.
                </Text>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Box borderWidth="1px" borderColor={border} borderRadius="2xl" bg={cardBg} p={5}>
                  <Heading as="h3" size="sm" mb={2}>
                    Bring in what is real
                  </Heading>
                  <Text fontSize="sm" color={muted}>
                    Use your actual health records, habits, and care details instead of sample assets.
                  </Text>
                </Box>
                <Box borderWidth="1px" borderColor={border} borderRadius="2xl" bg={cardBg} p={5}>
                  <Heading as="h3" size="sm" mb={2}>
                    See a richer twin
                  </Heading>
                  <Text fontSize="sm" color={muted}>
                    Build a more complete picture that evolves with more context over time.
                  </Text>
                </Box>
                <Box borderWidth="1px" borderColor={border} borderRadius="2xl" bg={cardBg} p={5}>
                  <Heading as="h3" size="sm" mb={2}>
                    Make clearer next moves
                  </Heading>
                  <Text fontSize="sm" color={muted}>
                    Turn that richer twin into better guidance, better questions, and better decisions.
                  </Text>
                </Box>
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
                Go make your own
              </Button>

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
              fontWeight="700"
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
