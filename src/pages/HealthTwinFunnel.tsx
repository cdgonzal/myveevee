import {
  Badge,
  Box,
  Button,
  Grid,
  Heading,
  HStack,
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
  whyMatters: string;
  metrics: string[];
  visualType: "mri" | "record" | "injury" | "lab";
  input: SimulatorInput;
};

type EvolutionOption = {
  id: string;
  title: string;
  icon: string;
  micro: string;
  whyMatters: string;
  metrics: string[];
  visualType: "timeline" | "sleep" | "meds" | "goals";
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
    whyMatters: "Shows structure, pressure points, and what needs deeper review fast.",
    metrics: ["Pain", "Scan", "Priority"],
    visualType: "mri",
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
    whyMatters: "Connects visits, medications, and history into one timeline.",
    metrics: ["Visits", "Meds", "History"],
    visualType: "record",
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
    whyMatters: "Helps the twin spot severity, swelling, and same-day triage needs.",
    metrics: ["Swelling", "Triage", "Fast"],
    visualType: "injury",
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
    whyMatters: "Turns common U.S. lab results into risk and trend signals.",
    metrics: ["A1C", "BP", "Trend"],
    visualType: "lab",
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
    whyMatters: "Shows whether a symptom is fading, worsening, or repeating.",
    metrics: ["+7 days", "Pattern", "Watch"],
    visualType: "timeline",
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
    whyMatters: "Adds recovery and stress context the twin can actually use.",
    metrics: ["Recovery", "Stress", "Rhythm"],
    visualType: "sleep",
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
    whyMatters: "Shows whether missed doses may be changing the picture.",
    metrics: ["Refill", "Dose", "Adherence"],
    visualType: "meds",
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
    whyMatters: "Anchors the twin to where care should go next, not just today.",
    metrics: ["Chronic", "PCP", "Care path"],
    visualType: "goals",
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
      px={2.5}
      py={1.5}
      borderRadius="full"
      bg="rgba(17, 119, 186, 0.10)"
      border="1px solid rgba(17, 119, 186, 0.16)"
    >
      <Text fontSize="10px" fontWeight="800" letterSpacing="0.08em" textTransform="uppercase">
        {label}
      </Text>
    </Box>
  );
}

function TileVisual({ visualType, isSelected }: { visualType: UploadOption["visualType"] | EvolutionOption["visualType"]; isSelected: boolean }) {
  const shellBg = isSelected
    ? "linear-gradient(135deg, rgba(23,49,140,0.18) 0%, rgba(54,197,255,0.22) 100%)"
    : "linear-gradient(135deg, rgba(17,119,186,0.08) 0%, rgba(54,197,255,0.10) 100%)";

  return (
    <Box
      h="148px"
      borderRadius="24px"
      bg={shellBg}
      border="1px solid rgba(17, 119, 186, 0.10)"
      position="relative"
      overflow="hidden"
    >
      {visualType === "mri" ? (
        <>
          <Box position="absolute" inset="18px 26px 18px 22px" borderRadius="24px" bg="rgba(255,255,255,0.74)" />
          <Box position="absolute" left="26px" top="44px" w="90px" h="58px" borderRadius="22px" bg="#123C9B" />
          <Box position="absolute" left="68px" top="54px" w="36px" h="36px" borderRadius="full" bg="white" />
          <Box position="absolute" left="122px" top="58px" w="70px" h="10px" borderRadius="full" bg="rgba(23,49,140,0.24)" />
          <Box position="absolute" left="130px" top="74px" w="58px" h="8px" borderRadius="full" bg="rgba(54,197,255,0.32)" />
        </>
      ) : null}

      {visualType === "record" ? (
        <>
          <Box position="absolute" left="36px" top="18px" w="88px" h="112px" borderRadius="20px" bg="white" boxShadow="0 12px 24px rgba(6,37,76,0.08)" />
          <Box position="absolute" left="52px" top="38px" w="44px" h="10px" borderRadius="full" bg="#36C5FF" />
          <Box position="absolute" left="52px" top="58px" w="56px" h="8px" borderRadius="full" bg="rgba(23,49,140,0.22)" />
          <Box position="absolute" left="52px" top="74px" w="46px" h="8px" borderRadius="full" bg="rgba(23,49,140,0.22)" />
          <Box position="absolute" left="52px" top="90px" w="52px" h="8px" borderRadius="full" bg="rgba(23,49,140,0.22)" />
          <Box position="absolute" right="28px" top="34px" w="54px" h="54px" borderRadius="18px" bg="#17318C" />
          <Box position="absolute" right="42px" top="46px" w="26px" h="8px" borderRadius="full" bg="white" />
          <Box position="absolute" right="51px" top="37px" w="8px" h="26px" borderRadius="full" bg="white" />
        </>
      ) : null}

      {visualType === "injury" ? (
        <>
          <Box position="absolute" left="24px" top="16px" w="176px" h="116px" borderRadius="28px" bg="linear-gradient(180deg, #F4D7C2 0%, #EBC2A8 100%)" />
          <Box position="absolute" left="78px" top="46px" w="52px" h="52px" borderRadius="full" bg="radial-gradient(circle at 50% 50%, rgba(108,23,32,0.75) 0%, rgba(158,31,43,0.56) 44%, rgba(214,81,92,0.24) 72%, rgba(255,255,255,0) 100%)" />
          <Box position="absolute" right="18px" bottom="18px" px={2.5} py={1.5} borderRadius="full" bg="rgba(255,255,255,0.82)" border="1px solid rgba(23,49,140,0.10)">
            <Text fontSize="10px" fontWeight="900" letterSpacing="0.12em" textTransform="uppercase" color="accent.soft">
              Triage View
            </Text>
          </Box>
        </>
      ) : null}

      {visualType === "lab" ? (
        <>
          <Box position="absolute" left="26px" top="22px" w="164px" h="104px" borderRadius="24px" bg="white" boxShadow="0 12px 24px rgba(6,37,76,0.08)" />
          <Box position="absolute" left="46px" bottom="34px" w="18px" h="30px" borderRadius="10px 10px 4px 4px" bg="#36C5FF" />
          <Box position="absolute" left="74px" bottom="34px" w="18px" h="52px" borderRadius="10px 10px 4px 4px" bg="#17318C" />
          <Box position="absolute" left="102px" bottom="34px" w="18px" h="40px" borderRadius="10px 10px 4px 4px" bg="#61D6FF" />
          <Box position="absolute" left="132px" bottom="34px" w="18px" h="60px" borderRadius="10px 10px 4px 4px" bg="#0C1E63" />
          <Box position="absolute" right="24px" top="18px" px={2.5} py={1.5} borderRadius="18px" bg="rgba(54,197,255,0.16)">
            <Text fontSize="10px" fontWeight="900" color="accent.soft">
              A1C 8.6
            </Text>
          </Box>
        </>
      ) : null}

      {visualType === "timeline" ? (
        <>
          <Box position="absolute" inset="18px" borderRadius="24px" bg="rgba(255,255,255,0.76)" />
          <Box position="absolute" left="34px" bottom="36px" w="150px" h="2px" bg="rgba(23,49,140,0.18)" />
          <Box position="absolute" left="46px" bottom="46px" w="18px" h="18px" borderRadius="full" bg="#36C5FF" />
          <Box position="absolute" left="92px" bottom="58px" w="18px" h="18px" borderRadius="full" bg="#17318C" />
          <Box position="absolute" left="138px" bottom="70px" w="18px" h="18px" borderRadius="full" bg="#61D6FF" />
          <Box position="absolute" left="58px" bottom="54px" w="46px" h="3px" bg="#17318C" transform="rotate(14deg)" transformOrigin="left center" />
          <Box position="absolute" left="104px" bottom="66px" w="46px" h="3px" bg="#36C5FF" transform="rotate(14deg)" transformOrigin="left center" />
        </>
      ) : null}

      {visualType === "sleep" ? (
        <>
          <Box position="absolute" inset="18px" borderRadius="24px" bg="linear-gradient(180deg, rgba(12,30,99,0.96) 0%, rgba(37,80,170,0.90) 100%)" />
          <Box position="absolute" left="42px" top="38px" w="38px" h="38px" borderRadius="full" bg="#F6E6A9" />
          <Box position="absolute" left="56px" top="38px" w="38px" h="38px" borderRadius="full" bg="#2450AA" />
          <Box position="absolute" right="52px" top="34px" w="6px" h="6px" borderRadius="full" bg="white" />
          <Box position="absolute" right="68px" top="52px" w="5px" h="5px" borderRadius="full" bg="white" />
          <Box position="absolute" right="44px" top="64px" w="4px" h="4px" borderRadius="full" bg="white" />
          <Box position="absolute" left="36px" bottom="30px" w="130px" h="24px" borderRadius="16px 16px 10px 10px" bg="rgba(255,255,255,0.18)" />
        </>
      ) : null}

      {visualType === "meds" ? (
        <>
          <Box position="absolute" left="34px" top="28px" w="52px" h="76px" borderRadius="16px" bg="white" boxShadow="0 10px 20px rgba(6,37,76,0.08)" />
          <Box position="absolute" left="42px" top="20px" w="36px" h="16px" borderRadius="10px 10px 6px 6px" bg="#17318C" />
          <Box position="absolute" left="108px" top="42px" w="34px" h="18px" borderRadius="full" bg="#36C5FF" />
          <Box position="absolute" left="130px" top="42px" w="34px" h="18px" borderRadius="full" bg="#17318C" />
          <Box position="absolute" left="108px" top="74px" w="58px" h="10px" borderRadius="full" bg="rgba(23,49,140,0.20)" />
          <Box position="absolute" left="108px" top="92px" w="44px" h="10px" borderRadius="full" bg="rgba(54,197,255,0.22)" />
        </>
      ) : null}

      {visualType === "goals" ? (
        <>
          <Box position="absolute" left="48px" top="24px" w="92px" h="92px" borderRadius="full" border="10px solid rgba(23,49,140,0.16)" />
          <Box position="absolute" left="70px" top="46px" w="48px" h="48px" borderRadius="full" border="8px solid #36C5FF" />
          <Box position="absolute" right="36px" top="54px" w="42px" h="42px" borderRadius="16px" bg="#17318C" />
          <Box position="absolute" right="50px" top="72px" w="14px" h="8px" borderBottom="4px solid white" borderLeft="4px solid white" transform="rotate(-45deg)" />
        </>
      ) : null}
    </Box>
  );
}

function IconTile({
  title,
  micro,
  whyMatters,
  metrics,
  isSelected,
  isDimmed,
  onClick,
  border,
  activeBorder,
  cardBg,
  activeCardBg,
  visualType,
}: {
  title: string;
  micro: string;
  whyMatters: string;
  metrics: string[];
  isSelected: boolean;
  isDimmed?: boolean;
  onClick: () => void;
  border: string;
  activeBorder: string;
  cardBg: string;
  activeCardBg: string;
  visualType: UploadOption["visualType"] | EvolutionOption["visualType"];
}) {
  return (
    <Box
      borderWidth="1px"
      borderColor={isSelected ? activeBorder : border}
      borderRadius="32px"
      bg={isSelected ? activeCardBg : cardBg}
      p={{ base: 4, md: 5 }}
      cursor="pointer"
      onClick={onClick}
      boxShadow={isSelected ? "0 22px 44px rgba(17, 119, 186, 0.18)" : "0 12px 26px rgba(6, 37, 76, 0.06)"}
      position="relative"
      overflow="hidden"
      opacity={isDimmed ? 0.42 : 1}
      transform={isSelected ? "translateY(-2px)" : "none"}
      transition="opacity 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease"
    >
      <Stack spacing={4} position="relative">
        <HStack justify="space-between" align="flex-start">
          <Box>
            <Text fontSize="10px" fontWeight="900" letterSpacing="0.14em" textTransform="uppercase" color="accent.soft" mb={2}>
              {micro}
            </Text>
            <Heading as="h3" size="sm" mb={0}>
              {title}
            </Heading>
          </Box>
          <Box
            w="24px"
            h="24px"
            borderRadius="md"
            border="2px solid"
            borderColor={isSelected ? "accent.primary" : "rgba(23, 49, 140, 0.18)"}
            bg={isSelected ? "accent.primary" : "white"}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            boxShadow={isSelected ? "0 10px 18px rgba(54, 197, 255, 0.22)" : "none"}
          >
            {isSelected ? <Text fontSize="xs" fontWeight="900" color="white">✓</Text> : null}
          </Box>
        </HStack>
        <TileVisual visualType={visualType} isSelected={isSelected} />
        <Text fontSize="sm" color="text.muted" lineHeight="1.45">
          {whyMatters}
        </Text>
        <HStack spacing={2} flexWrap="wrap">
          {metrics.map((metric) => (
            <MetricChip key={`${title}-${metric}`} label={metric} />
          ))}
        </HStack>
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

function JourneyNode({
  stepNumber,
  icon,
  label,
  isActive,
  isComplete,
}: {
  stepNumber: number;
  icon: string;
  label: string;
  isActive: boolean;
  isComplete: boolean;
}) {
  const isOn = isActive || isComplete;

  return (
    <HStack
      spacing={2}
      minW="fit-content"
      px={{ base: 2.5, md: 3 }}
      py={{ base: 2, md: 2.5 }}
      borderRadius="full"
      bg={isOn ? "rgba(255,255,255,0.94)" : "rgba(255,255,255,0.56)"}
      border="1px solid rgba(23, 49, 140, 0.10)"
      boxShadow={isActive ? "0 14px 28px rgba(54, 197, 255, 0.22)" : "0 8px 18px rgba(6, 37, 76, 0.06)"}
      flexShrink={0}
    >
      <Box
        w={{ base: "34px", md: "38px" }}
        h={{ base: "34px", md: "38px" }}
        borderRadius="full"
        bgGradient={isOn ? "linear-gradient(135deg, #17318C 0%, #36C5FF 100%)" : undefined}
        bg={isOn ? undefined : "rgba(255,255,255,0.78)"}
        border="1px solid rgba(23, 49, 140, 0.08)"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="900" color={isOn ? "white" : "#17318C"} letterSpacing="0.04em">
          {icon}
        </Text>
      </Box>
      <Box>
        <Text fontSize="10px" lineHeight="1" fontWeight="800" color="#17318C" opacity={0.7} mb={1}>
          {stepNumber}
        </Text>
        <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="800" lineHeight="1">
          {label}
        </Text>
      </Box>
    </HStack>
  );
}

function MobileJourneyStep({
  stepNumber,
  icon,
  label,
  isActive,
  isComplete,
}: {
  stepNumber: number;
  icon: string;
  label: string;
  isActive: boolean;
  isComplete: boolean;
}) {
  const isOn = isActive || isComplete;

  return (
    <HStack align="stretch" spacing={3}>
      <Stack align="center" spacing={1} flexShrink={0}>
        <Box
          w="34px"
          h="34px"
          borderRadius="full"
          bgGradient={isOn ? "linear-gradient(135deg, #17318C 0%, #36C5FF 100%)" : undefined}
          bg={isOn ? undefined : "rgba(255,255,255,0.76)"}
          border="1px solid rgba(23, 49, 140, 0.10)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow={isActive ? "0 10px 22px rgba(54, 197, 255, 0.22)" : "none"}
        >
          <Text fontSize="xs" fontWeight="900" color={isOn ? "white" : "#17318C"} letterSpacing="0.04em">
            {isComplete ? "✓" : stepNumber}
          </Text>
        </Box>
        {stepNumber < 4 ? <Box w="1px" flex="1" minH="18px" bg={isComplete ? "rgba(23,49,140,0.28)" : "rgba(23,49,140,0.10)"} /> : null}
      </Stack>

      <Box
        flex="1"
        borderRadius="22px"
        border="1px solid rgba(23, 49, 140, 0.10)"
        bg={isActive ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.58)"}
        px={3.5}
        py={isActive ? 3 : 2.5}
      >
        <Text fontSize="10px" fontWeight="900" letterSpacing="0.14em" textTransform="uppercase" color="accent.soft" mb={1}>
          {icon}
        </Text>
        <Text fontSize="sm" fontWeight="800" lineHeight="1.1">
          {label}
        </Text>
        {isActive ? (
          <Text fontSize="xs" color="text.muted" mt={1.5}>
            Active now
          </Text>
        ) : null}
      </Box>
    </HStack>
  );
}

export default function HealthTwinFunnel() {
  const [step, setStep] = useState<FunnelStep>(0);
  const [selectedUploadId, setSelectedUploadId] = useState<string | null>(null);
  const [selectedEvolutionIds, setSelectedEvolutionIds] = useState<string[]>([]);
  const [avatarVideoFailed, setAvatarVideoFailed] = useState(false);
  const [avatarStillFailed, setAvatarStillFailed] = useState(false);

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
  const heroBg = useColorModeValue(
    "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(230,247,255,0.96) 52%, rgba(205,240,255,0.92) 100%)",
    "linear-gradient(135deg, rgba(8,23,54,0.98) 0%, rgba(13,34,73,0.96) 52%, rgba(16,58,106,0.92) 100%)"
  );
  const heroOrbBg = useColorModeValue(
    "radial-gradient(circle at 50% 50%, rgba(54,197,255,0.95) 0%, rgba(23,49,140,0.90) 48%, rgba(23,49,140,0.18) 72%, rgba(255,255,255,0) 100%)",
    "radial-gradient(circle at 50% 50%, rgba(54,197,255,0.88) 0%, rgba(14,45,103,0.94) 42%, rgba(16,69,140,0.24) 72%, rgba(255,255,255,0) 100%)"
  );
  const heroSurface = useColorModeValue("rgba(255,255,255,0.74)", "rgba(255,255,255,0.06)");
  const heroBorder = useColorModeValue("rgba(23, 49, 140, 0.14)", "rgba(156, 231, 255, 0.16)");
  const insightPanelBg = useColorModeValue(
    "linear-gradient(180deg, rgba(17,119,186,0.16) 0%, rgba(156,231,255,0.52) 100%)",
    "linear-gradient(180deg, rgba(17,119,186,0.24) 0%, rgba(6,37,76,0.80) 100%)"
  );
  const insightCardBg = useColorModeValue("rgba(255,255,255,0.88)", "rgba(10, 44, 88, 0.82)");
  const insightAccentBorder = useColorModeValue("rgba(17, 119, 186, 0.34)", "rgba(156, 231, 255, 0.42)");
  const conversionPanelBg = useColorModeValue(
    "linear-gradient(135deg, rgba(9,30,102,0.98) 0%, rgba(23,49,140,0.96) 36%, rgba(54,197,255,0.92) 100%)",
    "linear-gradient(135deg, rgba(9,30,102,0.98) 0%, rgba(23,49,140,0.96) 36%, rgba(54,197,255,0.88) 100%)"
  );
  const conversionCardBg = useColorModeValue("rgba(255,255,255,0.14)", "rgba(255,255,255,0.08)");
  const conversionBorder = useColorModeValue("rgba(255,255,255,0.24)", "rgba(156, 231, 255, 0.22)");

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
    window.setTimeout(() => {
      setStep(1);
      trackEvent("health_twin_funnel_step_advance", { from_step: 1, to_step: 2, auto_advanced: true });
    }, 160);
  };

  const handleEvolutionToggle = (option: EvolutionOption) => {
    setSelectedEvolutionIds([option.id]);
    trackEvent("health_twin_funnel_select_evolution", {
      evolution_option: option.id,
      selected_count: 1,
    });
    window.setTimeout(() => {
      setStep(2);
      trackEvent("health_twin_funnel_step_advance", { from_step: 2, to_step: 3, auto_advanced: true });
    }, 160);
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
      <Stack spacing={{ base: 5, md: 6 }} maxW="6xl" mx="auto" px={{ base: 6, md: 10 }}>
        <Box
          borderWidth="1px"
          borderColor={heroBorder}
          borderRadius="3xl"
          bgGradient={heroBg}
          boxShadow="0 30px 70px rgba(6, 37, 76, 0.12)"
          p={{ base: 5, md: 6 }}
          overflow="hidden"
          position="relative"
        >
          <Box
            position="absolute"
            top="-80px"
            right="-40px"
            w={{ base: "240px", md: "360px" }}
            h={{ base: "240px", md: "360px" }}
            borderRadius="full"
            bg={heroOrbBg}
            opacity={0.96}
            pointerEvents="none"
          />
          <Box
            position="absolute"
            bottom="-120px"
            left="-80px"
            w={{ base: "220px", md: "320px" }}
            h={{ base: "220px", md: "320px" }}
            borderRadius="full"
            bg="radial-gradient(circle at 50% 50%, rgba(54,197,255,0.18) 0%, rgba(255,255,255,0) 68%)"
            pointerEvents="none"
          />

          <Grid templateColumns={{ base: "1fr", lg: "minmax(0,1.05fr) minmax(320px,0.95fr)" }} gap={{ base: 4, lg: 6 }} position="relative">
            <Stack spacing={4}>
              <Badge alignSelf="flex-start" colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
                HEALTH TWIN
              </Badge>
              <Stack spacing={1.5}>
                <Heading as="h1" size={{ base: "md", md: "xl" }} fontWeight="900" maxW="3xl" lineHeight="0.96">
                  Build your Health Twin.
                </Heading>
                <Text fontSize={{ base: "sm", md: "md" }} color={muted} maxW="2xl">
                  <Text as="span" color="accent.primary" fontWeight="900">
                    4 fast steps.
                  </Text>{" "}
                  <Text as="span" color="accent.soft" fontWeight="800">
                    More signal. Less guessing.
                  </Text>
                </Text>
              </Stack>

              <Box
                bg={heroSurface}
                border="1px solid"
                borderColor={heroBorder}
                borderRadius={{ base: "28px", md: "full" }}
                px={{ base: 3, md: 4 }}
                py={{ base: 2, md: 3 }}
                backdropFilter="blur(14px)"
              >
                <Stack spacing={2}>
                  <Stack spacing={2.5} display={{ base: "flex", md: "none" }}>
                    {FUNNEL_STEPS.map((funnelStep, index) => (
                      <MobileJourneyStep
                        key={funnelStep.key}
                        stepNumber={index + 1}
                        icon={funnelStep.icon}
                        label={funnelStep.label}
                        isActive={index === step}
                        isComplete={index < step}
                      />
                    ))}
                  </Stack>
                  <HStack
                    display={{ base: "none", md: "flex" }}
                    spacing={{ base: 2, md: 3 }}
                    justify={{ base: "flex-start", md: "space-between" }}
                    align="center"
                    overflowX={{ base: "auto", md: "visible" }}
                    pb={{ base: 1, md: 0 }}
                  >
                    {FUNNEL_STEPS.map((funnelStep, index) => (
                      <JourneyNode
                        key={funnelStep.key}
                        stepNumber={index + 1}
                        icon={funnelStep.icon}
                        label={funnelStep.label}
                        isActive={index === step}
                        isComplete={index < step}
                      />
                    ))}
                  </HStack>
                  <Text fontSize="xs" color={muted} pl={{ base: 1, md: 2 }}>
                    Guided preview with sample inputs and simulated signals.
                  </Text>
                </Stack>
              </Box>
            </Stack>

            <Box
              display={{ base: "none", lg: "block" }}
              minH="100%"
              borderRadius="3xl"
              border="1px solid"
              borderColor="rgba(23, 49, 140, 0.10)"
              bg="rgba(255,255,255,0.14)"
              backdropFilter="blur(14px)"
              p={4}
              overflow="hidden"
            >
              <Box
                position="relative"
                minH="320px"
                borderRadius="32px"
                bg="linear-gradient(135deg, rgba(223,245,255,0.92) 0%, rgba(196,235,255,0.84) 48%, rgba(155,214,255,0.74) 100%)"
                border="1px solid rgba(54,197,255,0.16)"
                sx={{
                  "@keyframes heroAvatarFloat": {
                    "0%": { transform: "translate(-50%, -50%) translateY(0px)" },
                    "50%": { transform: "translate(-50%, -50%) translateY(-10px)" },
                    "100%": { transform: "translate(-50%, -50%) translateY(0px)" },
                  },
                  "@keyframes heroAvatarSwapA": {
                    "0%": { opacity: 1 },
                    "42%": { opacity: 1 },
                    "50%": { opacity: 0 },
                    "92%": { opacity: 0 },
                    "100%": { opacity: 1 },
                  },
                  "@keyframes heroAvatarSwapB": {
                    "0%": { opacity: 0 },
                    "42%": { opacity: 0 },
                    "50%": { opacity: 1 },
                    "92%": { opacity: 1 },
                    "100%": { opacity: 0 },
                  },
                }}
              >
                <Box
                  position="absolute"
                  inset="0"
                  bg="radial-gradient(circle at 50% 40%, rgba(255,255,255,0.64) 0%, rgba(255,255,255,0.12) 44%, rgba(255,255,255,0) 72%)"
                />
                <Box
                  position="absolute"
                  left="50%"
                  bottom="22px"
                  transform="translateX(-50%)"
                  w="190px"
                  h="28px"
                  borderRadius="full"
                  bg="radial-gradient(circle at 50% 50%, rgba(54,197,255,0.26) 0%, rgba(54,197,255,0.12) 48%, rgba(255,255,255,0) 100%)"
                />

                {!avatarVideoFailed ? (
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    animation="heroAvatarFloat 6s ease-in-out infinite"
                  >
                    <Box
                      position="relative"
                      w="250px"
                      h="290px"
                      overflow="hidden"
                    >
                      <Box
                        as="video"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        w="100%"
                        h="100%"
                        objectFit="contain"
                        onLoadedData={() => {
                          setAvatarVideoFailed(false);
                          console.log("[HealthTwinHero] avatar video loaded", {
                            sources: ["/avatar/hero-avatar-2.webm", "/avatar/hero-avatar-2.mp4"],
                          });
                        }}
                        onCanPlay={() => {
                          console.log("[HealthTwinHero] avatar video can play", {
                            sources: ["/avatar/hero-avatar-2.webm", "/avatar/hero-avatar-2.mp4"],
                          });
                        }}
                        onError={(event) => {
                          setAvatarVideoFailed(true);
                          console.error("[HealthTwinHero] avatar video failed", {
                            sources: ["/avatar/hero-avatar-2.webm", "/avatar/hero-avatar-2.mp4"],
                            error: event.currentTarget.error,
                          });
                        }}
                      >
                        <source src="/avatar/hero-avatar-2.webm" type="video/webm" />
                        <source src="/avatar/hero-avatar-2.mp4" type="video/mp4" />
                      </Box>
                    </Box>
                  </Box>
                ) : !avatarStillFailed ? (
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    animation="heroAvatarFloat 6s ease-in-out infinite"
                  >
                    <Box
                      position="relative"
                      w="250px"
                      h="290px"
                      overflow="hidden"
                    >
                      <Box
                        as="img"
                        src="/images/marketing/hero-avatar-a.png"
                        alt="Health twin avatar"
                        position="absolute"
                        inset="0"
                        w="100%"
                        h="100%"
                        objectFit="contain"
                        animation="heroAvatarSwapA 4.8s ease-in-out infinite"
                        onLoad={() => {
                          setAvatarStillFailed(false);
                          console.log("[HealthTwinHero] avatar still loaded", {
                            src: "/images/marketing/hero-avatar-a.png",
                          });
                        }}
                        onError={() => {
                          setAvatarStillFailed(true);
                          console.error("[HealthTwinHero] avatar still failed", {
                            src: "/images/marketing/hero-avatar-a.png",
                          });
                        }}
                      />
                      <Box
                        as="img"
                        src="/images/marketing/hero-avatar-b.png"
                        alt="Health twin avatar alternate"
                        position="absolute"
                        inset="0"
                        w="100%"
                        h="100%"
                        objectFit="contain"
                        animation="heroAvatarSwapB 4.8s ease-in-out infinite"
                        onLoad={() => {
                          setAvatarStillFailed(false);
                          console.log("[HealthTwinHero] avatar still loaded", {
                            src: "/images/marketing/hero-avatar-b.png",
                          });
                        }}
                        onError={() => {
                          setAvatarStillFailed(true);
                          console.error("[HealthTwinHero] avatar still failed", {
                            src: "/images/marketing/hero-avatar-b.png",
                          });
                        }}
                      />
                    </Box>
                  </Box>
                ) : null}

                {avatarVideoFailed && avatarStillFailed ? (
                  <Stack
                    position="absolute"
                    inset="0"
                    align="center"
                    justify="center"
                    spacing={3}
                  >
                    <Text fontSize="xs" fontWeight="900" letterSpacing="0.16em" textTransform="uppercase" color="accent.soft">
                      Avatar Fallback
                    </Text>
                    <Box
                      w="140px"
                      h="140px"
                      borderRadius="full"
                      bg="linear-gradient(135deg, #17318C 0%, #36C5FF 100%)"
                      boxShadow="0 24px 48px rgba(54,197,255,0.20)"
                    />
                  </Stack>
                ) : null}
              </Box>
            </Box>
          </Grid>
        </Box>

        <Box
          borderWidth="1px"
          borderColor={step === 2 ? insightAccentBorder : step === 3 ? conversionBorder : border}
          borderRadius="3xl"
          bg={step === 2 ? insightPanelBg : step === 3 ? conversionPanelBg : panelBg}
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
                  Pick the first thing to upload
                </Heading>
                <Text fontSize="sm" color={muted}>
                  One tap and you move on
                </Text>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {UPLOAD_OPTIONS.map((option) => (
                  <IconTile
                    key={option.id}
                    title={option.title}
                    micro={option.micro}
                    whyMatters={option.whyMatters}
                    metrics={option.metrics}
                    isSelected={option.id === selectedUploadId}
                    isDimmed={!!selectedUploadId && option.id !== selectedUploadId}
                    onClick={() => handleUploadSelect(option)}
                    border={border}
                    activeBorder={activeBorder}
                    cardBg={cardBg}
                    activeCardBg={activeCardBg}
                    visualType={option.visualType}
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
                  Add one thing that sharpens it
                </Heading>
                <Text fontSize="sm" color={muted}>
                  One tap and keep moving
                </Text>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {EVOLUTION_OPTIONS.map((option) => (
                  <IconTile
                    key={option.id}
                    title={option.title}
                    micro={option.micro}
                    whyMatters={option.whyMatters}
                    metrics={option.metrics}
                    isSelected={selectedEvolutionIds.includes(option.id)}
                    isDimmed={selectedEvolutionIds.length > 0 && !selectedEvolutionIds.includes(option.id)}
                    onClick={() => handleEvolutionToggle(option)}
                    border={border}
                    activeBorder={activeBorder}
                    cardBg={cardBg}
                    activeCardBg={activeCardBg}
                    visualType={option.visualType}
                  />
                ))}
              </SimpleGrid>
            </Stack>
          ) : null}

          {step === 2 && selectedUpload && result && simulatedInput ? (
            <Stack spacing={5}>
              <Box>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="accent.soft" mb={2}>
                  Step 3
                </Text>
                <Heading as="h2" size="lg" mb={1}>
                  Teaser snapshot
                </Heading>
                <Text fontSize="sm" color={muted}>
                  A glimpse only. The full story is next.
                </Text>
              </Box>

              <SimpleGrid columns={{ base: 2, md: 5 }} spacing={3}>
                <MetricCard label="Twin State" value={result.riskLevel.toUpperCase()} tone="accent" />
                <MetricCard label="Momentum" value={String(result.riskScore)} />
                <MetricCard label="Recovery" value={`${simulatedInput.behaviorChange.sleepHours}h`} />
                <MetricCard label="Consistency" value={`${simulatedInput.medication.adherencePercent}%`} />
                <MetricCard label="Pressure" value={simulatedInput.labs.systolicBp ? `${simulatedInput.labs.systolicBp}` : "--"} />
              </SimpleGrid>

              <Box borderWidth="1px" borderColor={insightAccentBorder} borderRadius="3xl" bg={insightCardBg} p={5}>
                <Stack spacing={4}>
                  <HStack spacing={2} flexWrap="wrap">
                    {(result.riskSignals.length > 0 ? result.riskSignals : ["Lower-risk pattern"])
                      .slice(0, 2)
                      .map((signal) => (
                        <MetricChip key={signal} label={signal} />
                      ))}
                    {result.recommendations.slice(0, 1).map((recommendation) => (
                      <MetricChip key={recommendation.id} label={recommendation.title} />
                    ))}
                  </HStack>
                  <Heading as="h3" size="md">
                    Want the deeper readout?
                  </Heading>
                  <Text fontSize="sm" color={muted}>
                    See what more data, more context, and your real twin can unlock.
                  </Text>
                  <Button
                    variant="link"
                    color="accent.primary"
                    fontWeight="900"
                    w="fit-content"
                    onClick={() => {
                      setStep(3);
                      trackEvent("health_twin_funnel_step_advance", { from_step: 3, to_step: 4, teaser_click: true });
                    }}
                  >
                    Get more info
                  </Button>
                </Stack>
              </Box>
            </Stack>
          ) : null}

          {step === 3 ? (
            <Stack spacing={5} align={{ base: "stretch", md: "flex-start" }}>
              <Box>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="whiteAlpha.800" mb={2}>
                  Step 4
                </Text>
                <Heading as="h2" size={{ base: "lg", md: "xl" }} mb={2} color="white" lineHeight="0.98">
                  Create your own Health Twin
                </Heading>
                <Text fontSize={{ base: "sm", md: "md" }} color="whiteAlpha.900" maxW="2xl">
                  FREE, FREE, FREE. Secure and Personalized to You.
                </Text>
              </Box>
              <Button
                as="a"
                href={APP_LINKS.external.authenticatedConsole}
                size="lg"
                borderRadius="full"
                px={10}
                fontWeight="900"
                alignSelf="flex-start"
                bg="white"
                color="#17318C"
                _hover={{ bg: "whiteAlpha.900" }}
                boxShadow="0 20px 40px rgba(6, 37, 76, 0.24)"
              >
                Create my own Health Twin
              </Button>

            </Stack>
          ) : null}
        </Box>

        <Stack direction={{ base: "column", sm: "row" }} justify="space-between" spacing={3}>
          <Button variant="ghost" onClick={handleBack} isDisabled={step === 0}>
            Back
          </Button>
          {step === 2 ? (
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
