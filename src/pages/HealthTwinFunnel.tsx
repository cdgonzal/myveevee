import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useMemo, useState, type KeyboardEvent } from "react";
import { Link as RouterLink } from "react-router-dom";
import { trackCtaClick } from "../analytics/trackCtaClick";
import { trackEvent } from "../analytics/trackEvent";
import { APP_LINKS } from "../config/links";
import { runWellnessMirrorSimulation, type SimulationResult } from "../simulator/engine";
import { DEFAULT_SIMULATOR_INPUT, type SimulatorInput } from "../simulator/schema";

type FunnelStep = 0 | 1 | 2 | 3;
type UploadVisualType = "mri" | "record" | "injury" | "lab";
type TileVisualType = UploadVisualType | "timeline" | "sleep" | "meds" | "goals";

type UploadOption = {
  id: string;
  title: string;
  icon: string;
  micro: string;
  whyMatters: string;
  metrics: string[];
  visualType: UploadVisualType;
  imageSrc: string;
  input: SimulatorInput;
};

type EvolutionOption = {
  id: string;
  uploadIds: string[];
  title: string;
  icon: string;
  micro: string;
  whyMatters: string;
  metrics: string[];
  apply: (input: SimulatorInput) => SimulatorInput;
};

type StepThreeTeaser = {
  headline: string;
  watch: string;
  good: string;
  next: string;
  metricLabel: string;
  metricValue: string;
};

const VEEVEE_NAVY = "#06254C";
const VEEVEE_BLUE = "#1177BA";
const VEEVEE_CYAN = "#36C5FF";
const VEEVEE_LIGHT = "#EFFBFF";
const VEEVEE_MUTED = "#496078";
const AVATAR_WEBM = "/avatar/health-twin-funnel-avatar.webm";
const AVATAR_MP4 = "/avatar/health-twin-funnel-avatar.mp4";
const AVATAR_POSTER = "/avatar/health-twin-funnel-avatar-poster.webp";

const HERO_FEATURE_CARDS = [
  { label: "Profile", mobileLabel: "Profile", copy: "At a glance", symbol: "P", color: VEEVEE_BLUE },
  { label: "Signals", mobileLabel: "Signals", copy: "What matters", symbol: "S", color: VEEVEE_CYAN },
  { label: "Goals", mobileLabel: "Goals", copy: "Your priority", symbol: "G", color: "#17318C" },
  { label: "Benefits", mobileLabel: "Benefits", copy: "What you gain", symbol: "B", color: "#00BFFF" },
  { label: "Plan", mobileLabel: "Plan", copy: "Next steps", symbol: "Plan", color: "#E26FFF" },
];

const FUNNEL_STEPS = [
  {
    key: "data",
    label: "Data In",
    stepLabel: "Step One",
    subtitle: "Choose one health signal and watch the twin start fast.",
  },
  {
    key: "twin",
    label: "Health Twin",
    stepLabel: "Step Two",
    subtitle: "Choose the outcome you want most right now.",
  },
  {
    key: "insights",
    label: "Recommendations",
    stepLabel: "Step Three",
    subtitle: "Preview the strongest signals and move toward your best next step.",
  },
  {
    key: "decisions",
    label: "Personalize",
    stepLabel: "Step Four",
    subtitle: "Create your own Health Twin in seconds. Free and personalized.",
  },
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
    imageSrc: "/images/health-twin/cards/step-1-mri-scan.webp",
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
    imageSrc: "/images/health-twin/cards/step-1-health-record.webp",
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
    imageSrc: "/images/health-twin/cards/step-1-injury-image.webp",
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
    imageSrc: "/images/health-twin/cards/step-1-lab-panel.webp",
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
    id: "mri-reduce-pain",
    uploadIds: ["mri"],
    title: "Reduce pain",
    icon: "01",
    micro: "Priority focus",
    whyMatters: "Turn scan context into a clearer pain-reduction plan.",
    metrics: ["Pain", "Relief", "Next step"],
    apply: (input) => ({
      ...input,
      symptom: { ...input.symptom, severity: "high", durationDays: input.symptom.durationDays + 3 },
      lifestyleEvent: { event: "User focused the twin on reducing pain after imaging", timing: "current" },
    }),
  },
  {
    id: "mri-move-better",
    uploadIds: ["mri"],
    title: "Move better",
    icon: "02",
    micro: "Mobility focus",
    whyMatters: "Connect scan findings to recovery, range of motion, and activity.",
    metrics: ["Mobility", "Recovery", "Activity"],
    apply: (input) => ({
      ...input,
      behaviorChange: { ...input.behaviorChange, exerciseDaysPerWeek: Math.max(1, input.behaviorChange.exerciseDaysPerWeek) },
      lifestyleEvent: { event: "User focused the twin on mobility after imaging", timing: "current" },
    }),
  },
  {
    id: "mri-avoid-surprises",
    uploadIds: ["mri"],
    title: "Avoid surprises",
    icon: "03",
    micro: "Risk focus",
    whyMatters: "Spot what might need follow-up before it becomes urgent.",
    metrics: ["Risk", "Watch", "Follow-up"],
    apply: (input) => ({
      ...input,
      insurance: { ...input.insurance, hasPcpAssigned: true },
      lifestyleEvent: { event: "User focused the twin on imaging follow-up risk", timing: "current" },
    }),
  },
  {
    id: "record-organize-meds",
    uploadIds: ["health-record"],
    title: "Organize meds",
    icon: "01",
    micro: "Medication focus",
    whyMatters: "Make medications, refills, and adherence easier to understand.",
    metrics: ["Meds", "Refill", "Adherence"],
    apply: (input) => ({
      ...input,
      medication: { ...input.medication, adherencePercent: Math.min(input.medication.adherencePercent, 68) },
      lifestyleEvent: { event: "User focused the twin on medication organization", timing: "current" },
    }),
  },
  {
    id: "record-find-gaps",
    uploadIds: ["health-record"],
    title: "Find care gaps",
    icon: "02",
    micro: "Care focus",
    whyMatters: "Surface missing follow-ups, stale history, and loose ends.",
    metrics: ["Gaps", "Visits", "History"],
    apply: (input) => ({
      ...input,
      profile: { ...input.profile, hasChronicCondition: true },
      lifestyleEvent: { event: "User focused the twin on finding care gaps", timing: "current" },
    }),
  },
  {
    id: "record-next-visit",
    uploadIds: ["health-record"],
    title: "Plan next visit",
    icon: "03",
    micro: "Question focus",
    whyMatters: "Turn the record into better questions for the next appointment.",
    metrics: ["Questions", "PCP", "Plan"],
    apply: (input) => ({
      ...input,
      insurance: { ...input.insurance, hasPcpAssigned: true },
      lifestyleEvent: { event: "User focused the twin on the next visit", timing: "current" },
    }),
  },
  {
    id: "injury-heal-faster",
    uploadIds: ["injury-image"],
    title: "Heal faster",
    icon: "01",
    micro: "Recovery focus",
    whyMatters: "Focus the twin on recovery pace and what helps healing.",
    metrics: ["Recovery", "Rest", "Progress"],
    apply: (input) => ({
      ...input,
      behaviorChange: { ...input.behaviorChange, sleepHours: Math.max(7, input.behaviorChange.sleepHours) },
      lifestyleEvent: { event: "User focused the twin on faster injury recovery", timing: "current" },
    }),
  },
  {
    id: "injury-reduce-swelling",
    uploadIds: ["injury-image"],
    title: "Reduce swelling",
    icon: "02",
    micro: "Symptom focus",
    whyMatters: "Track visible change and what may need attention.",
    metrics: ["Swelling", "Pain", "Trend"],
    apply: (input) => ({
      ...input,
      symptom: { ...input.symptom, severity: "moderate", durationDays: input.symptom.durationDays + 2 },
      lifestyleEvent: { event: "User focused the twin on swelling and symptom change", timing: "current" },
    }),
  },
  {
    id: "injury-get-help",
    uploadIds: ["injury-image"],
    title: "Know when to get help",
    icon: "03",
    micro: "Triage focus",
    whyMatters: "Clarify when watchful waiting is not enough.",
    metrics: ["Triage", "Urgency", "Care"],
    apply: (input) => ({
      ...input,
      symptom: { ...input.symptom, severity: "high" },
      lifestyleEvent: { event: "User focused the twin on injury triage", timing: "current" },
    }),
  },
  {
    id: "labs-lower-a1c",
    uploadIds: ["lab-panel"],
    title: "Lower A1C",
    icon: "01",
    micro: "Metabolic focus",
    whyMatters: "Turn lab numbers into a clearer blood sugar goal.",
    metrics: ["A1C", "Trend", "Food"],
    apply: (input) => ({
      ...input,
      labs: { ...input.labs, a1c: input.labs.a1c ?? 8.1 },
      lifestyleEvent: { event: "User focused the twin on lowering A1C", timing: "current" },
    }),
  },
  {
    id: "labs-blood-pressure",
    uploadIds: ["lab-panel"],
    title: "Improve blood pressure",
    icon: "02",
    micro: "Heart focus",
    whyMatters: "Connect pressure, routine, and follow-up into one target.",
    metrics: ["BP", "Heart", "Routine"],
    apply: (input) => ({
      ...input,
      labs: { ...input.labs, systolicBp: input.labs.systolicBp ?? 142 },
      lifestyleEvent: { event: "User focused the twin on blood pressure", timing: "current" },
    }),
  },
  {
    id: "labs-more-energy",
    uploadIds: ["lab-panel"],
    title: "Feel more energy",
    icon: "03",
    micro: "Daily focus",
    whyMatters: "Connect labs to sleep, routine, and day-to-day momentum.",
    metrics: ["Energy", "Sleep", "Weight"],
    apply: (input) => ({
      ...input,
      behaviorChange: { ...input.behaviorChange, sleepHours: Math.max(7, input.behaviorChange.sleepHours) },
      lifestyleEvent: { event: "User focused the twin on energy and routine", timing: "current" },
    }),
  },
];

const STEP_THREE_TEASERS: Record<string, StepThreeTeaser> = {
  "mri-reduce-pain": {
    headline: "Your scan focus points to pain relief first.",
    watch: "Pain plus imaging context should not sit without a follow-up plan.",
    good: "You already gave the twin a concrete signal to organize around.",
    next: "Build your real twin so it can connect pain, activity, records, and care options.",
    metricLabel: "Main Goal",
    metricValue: "Relief",
  },
  "mri-move-better": {
    headline: "Your twin is reading this as a mobility goal.",
    watch: "Limited movement can slow recovery if it is not tracked clearly.",
    good: "A movement goal makes progress easier to measure week by week.",
    next: "Create your twin to connect scan context with mobility, sleep, and routine.",
    metricLabel: "Main Goal",
    metricValue: "Mobility",
  },
  "mri-avoid-surprises": {
    headline: "Your twin is prioritizing follow-up risk.",
    watch: "Imaging findings can be easy to forget once symptoms change.",
    good: "You are turning the scan into a watchlist, not just a file.",
    next: "Create your twin to keep follow-up questions and care timing in one place.",
    metricLabel: "Main Goal",
    metricValue: "Follow-up",
  },
  "record-organize-meds": {
    headline: "Your record focus points to medication clarity.",
    watch: "Medication history and adherence can quietly change the whole picture.",
    good: "Your records give the twin a strong starting point.",
    next: "Create your twin to connect medications, refills, symptoms, and benefits.",
    metricLabel: "Main Goal",
    metricValue: "Meds",
  },
  "record-find-gaps": {
    headline: "Your twin is looking for care gaps.",
    watch: "Missed follow-ups and old history can hide what matters now.",
    good: "A full record can reveal patterns that single visits miss.",
    next: "Create your twin to turn loose ends into a clear care checklist.",
    metricLabel: "Main Goal",
    metricValue: "Gaps",
  },
  "record-next-visit": {
    headline: "Your record can help you show up more prepared.",
    watch: "Appointments are easier to waste when questions are not ready.",
    good: "You have enough context to make the next visit more useful.",
    next: "Create your twin to generate a sharper next-visit plan.",
    metricLabel: "Main Goal",
    metricValue: "Visit",
  },
  "injury-heal-faster": {
    headline: "Your twin is focused on recovery speed.",
    watch: "Healing can stall when rest, pain, and progress are not tracked together.",
    good: "A clear recovery goal gives the twin a simple target.",
    next: "Create your twin to monitor recovery signals and keep momentum visible.",
    metricLabel: "Main Goal",
    metricValue: "Recovery",
  },
  "injury-reduce-swelling": {
    headline: "Your twin is watching visible change.",
    watch: "Swelling that worsens or lingers deserves attention.",
    good: "A photo gives the twin a concrete baseline to compare against.",
    next: "Create your twin to connect visual change, pain, and timing.",
    metricLabel: "Main Goal",
    metricValue: "Swelling",
  },
  "injury-get-help": {
    headline: "Your twin is treating this as a triage question.",
    watch: "High pain, swelling, or fast change should not be ignored.",
    good: "You are asking the right question early: when to get help.",
    next: "Create your twin to clarify urgency and next-step questions.",
    metricLabel: "Main Goal",
    metricValue: "Triage",
  },
  "labs-lower-a1c": {
    headline: "Your lab focus points to metabolic progress.",
    watch: "Elevated A1C needs a plan, not just a number on a report.",
    good: "Lab data gives the twin a measurable baseline.",
    next: "Create your twin to connect A1C, food, routine, and follow-up.",
    metricLabel: "Main Goal",
    metricValue: "A1C",
  },
  "labs-blood-pressure": {
    headline: "Your twin is focused on blood pressure.",
    watch: "High pressure can be easy to miss until it becomes urgent.",
    good: "Blood pressure is measurable, trackable, and actionable.",
    next: "Create your twin to connect BP, sleep, medication, and routines.",
    metricLabel: "Main Goal",
    metricValue: "BP",
  },
  "labs-more-energy": {
    headline: "Your twin is focused on daily energy.",
    watch: "Low energy can connect to labs, sleep, medication, or routine.",
    good: "You chose a real-life outcome, not just a lab number.",
    next: "Create your twin to connect the signals behind your energy.",
    metricLabel: "Main Goal",
    metricValue: "Energy",
  },
};

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

function TileVisual({
  visualType,
  isSelected,
  imageSrc,
  imageAlt,
}: {
  visualType: TileVisualType;
  isSelected: boolean;
  imageSrc?: string;
  imageAlt: string;
}) {
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
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={imageAlt}
          w="100%"
          h="100%"
          objectFit="cover"
          loading="lazy"
        />
      ) : null}

      {imageSrc ? (
        <Box
          position="absolute"
          inset={0}
          bg={isSelected ? "rgba(23,49,140,0.06)" : "rgba(255,255,255,0.02)"}
          pointerEvents="none"
        />
      ) : null}

      {!imageSrc && visualType === "mri" ? (
        <>
          <Box position="absolute" inset="18px 26px 18px 22px" borderRadius="24px" bg="rgba(255,255,255,0.74)" />
          <Box position="absolute" left="26px" top="44px" w="90px" h="58px" borderRadius="22px" bg="#123C9B" />
          <Box position="absolute" left="68px" top="54px" w="36px" h="36px" borderRadius="full" bg="white" />
          <Box position="absolute" left="122px" top="58px" w="70px" h="10px" borderRadius="full" bg="rgba(23,49,140,0.24)" />
          <Box position="absolute" left="130px" top="74px" w="58px" h="8px" borderRadius="full" bg="rgba(54,197,255,0.32)" />
        </>
      ) : null}

      {!imageSrc && visualType === "record" ? (
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

      {!imageSrc && visualType === "injury" ? (
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

      {!imageSrc && visualType === "lab" ? (
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
  imageSrc,
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
  visualType: UploadOption["visualType"];
  imageSrc?: string;
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
        <TileVisual visualType={visualType} isSelected={isSelected} imageSrc={imageSrc} imageAlt={`${title} preview`} />
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

function FocusTile({
  option,
  isSelected,
  isDimmed,
  onClick,
  border,
  activeBorder,
  cardBg,
  activeCardBg,
}: {
  option: EvolutionOption;
  isSelected: boolean;
  isDimmed: boolean;
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
      borderRadius="24px"
      bg={isSelected ? activeCardBg : cardBg}
      p={{ base: 4, md: 5 }}
      cursor="pointer"
      onClick={onClick}
      boxShadow={isSelected ? "0 18px 34px rgba(17, 119, 186, 0.16)" : "0 10px 22px rgba(6, 37, 76, 0.05)"}
      opacity={isDimmed ? 0.42 : 1}
      transform={isSelected ? "translateY(-2px)" : "none"}
      transition="opacity 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease"
    >
      <HStack align="flex-start" spacing={4}>
        <Box
          w="42px"
          h="42px"
          borderRadius="full"
          bgGradient={isSelected ? "linear-gradient(135deg, #17318C 0%, #36C5FF 100%)" : undefined}
          bg={isSelected ? undefined : "rgba(17,119,186,0.08)"}
          color={isSelected ? "white" : "accent.soft"}
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="sm"
          fontWeight="900"
          flexShrink={0}
        >
          {option.icon}
        </Box>
        <Stack spacing={2} flex="1">
          <Box>
            <Text fontSize="10px" fontWeight="900" letterSpacing="0.14em" textTransform="uppercase" color="accent.soft" mb={1}>
              {option.micro}
            </Text>
            <Heading as="h3" size="sm">
              {option.title}
            </Heading>
          </Box>
          <Text fontSize="sm" color="text.muted" lineHeight="1.4">
            {option.whyMatters}
          </Text>
          <HStack spacing={2} flexWrap="wrap">
            {option.metrics.map((metric) => (
              <MetricChip key={`${option.id}-${metric}`} label={metric} />
            ))}
          </HStack>
        </Stack>
      </HStack>
    </Box>
  );
}

function RecommendationStep({
  number,
  label,
  body,
}: {
  number: number;
  label: string;
  body: string;
}) {
  return (
    <HStack align="flex-start" spacing={4}>
      <Flex
        align="center"
        justify="center"
        boxSize={{ base: "34px", md: "38px" }}
        borderRadius="full"
        bg="rgba(17,119,186,0.12)"
        color={VEEVEE_BLUE}
        fontWeight="900"
        flexShrink={0}
      >
        {number}
      </Flex>
      <Box flex="1" minW={0}>
        <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" fontWeight="900" color="accent.soft" mb={1}>
          {label}
        </Text>
        <Text fontSize={{ base: "sm", md: "md" }} color="text.primary" lineHeight="1.45" fontWeight="700">
          {body}
        </Text>
      </Box>
    </HStack>
  );
}

function DesktopProgressBar({ currentStep }: { currentStep: FunnelStep }) {
  const progressPercent = (currentStep / (FUNNEL_STEPS.length - 1)) * 100;
  const progressRailPercent = progressPercent * 0.88;

  return (
    <Box px={{ md: 2, lg: 4 }} pt={2} pb={1}>
      <Box position="relative">
        <Box
          position="absolute"
          top="19px"
          left="6%"
          right="6%"
          h="3px"
          borderRadius="full"
          bg="rgba(23, 49, 140, 0.12)"
        />
        <Box
          position="absolute"
          top="19px"
          left="6%"
          w={`${progressRailPercent}%`}
          h="3px"
          borderRadius="full"
          bgGradient="linear-gradient(90deg, #17318C 0%, #36C5FF 100%)"
          transition="width 180ms ease"
        />
        <HStack position="relative" zIndex={1} justify="space-between" align="flex-start" spacing={0}>
          {FUNNEL_STEPS.map((funnelStep, index) => {
            const isActive = index === currentStep;
            const isComplete = index < currentStep;
            const isOn = isActive || isComplete;

            return (
              <Stack key={funnelStep.key} align="center" spacing={2} flex="1" minW={0}>
                <Box
                  w="42px"
                  h="42px"
                  borderRadius="full"
                  bgGradient={isOn ? "linear-gradient(135deg, #17318C 0%, #36C5FF 100%)" : undefined}
                  bg={isOn ? undefined : "rgba(255,255,255,0.96)"}
                  border="2px solid"
                  borderColor={isOn ? "transparent" : "rgba(23, 49, 140, 0.18)"}
                  boxShadow={isActive ? "0 12px 26px rgba(54, 197, 255, 0.26)" : "0 8px 18px rgba(6, 37, 76, 0.05)"}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="sm" fontWeight="900" color={isOn ? "white" : "#17318C"} letterSpacing="0">
                    {index + 1}
                  </Text>
                </Box>
                <Box textAlign="center" maxW="150px">
                  <Text fontSize="10px" fontWeight="900" color="#17318C" opacity={isOn ? 0.78 : 0.46}>
                    {funnelStep.stepLabel}
                  </Text>
                  <Text fontSize="sm" fontWeight="850" lineHeight="1.1" color={isOn ? "text.primary" : "text.muted"}>
                    {funnelStep.label}
                  </Text>
                </Box>
              </Stack>
            );
          })}
        </HStack>
      </Box>
    </Box>
  );
}

function MobileJourneyStep({
  stepNumber,
  stepLabel,
  label,
  isActive,
  isComplete,
}: {
  stepNumber: number;
  stepLabel: string;
  label: string;
  isActive: boolean;
  isComplete: boolean;
}) {
  const isOn = isActive || isComplete;

  return (
    <HStack align="stretch" spacing={3.5}>
      <Stack align="center" spacing={0} flexShrink={0}>
        <Box
          w="40px"
          h="40px"
          borderRadius="full"
          bgGradient={isOn ? "linear-gradient(135deg, #17318C 0%, #36C5FF 100%)" : undefined}
          bg={isOn ? undefined : "rgba(255,255,255,0.96)"}
          border="2px solid"
          borderColor={isOn ? "transparent" : "rgba(23, 49, 140, 0.18)"}
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow={isActive ? "0 12px 26px rgba(54, 197, 255, 0.26)" : "0 8px 18px rgba(6, 37, 76, 0.05)"}
        >
          <Text fontSize="sm" fontWeight="900" color={isOn ? "white" : "#17318C"} letterSpacing="0">
            {stepNumber}
          </Text>
        </Box>
        {stepNumber < 4 ? (
          <Box
            w="3px"
            flex="1"
            minH="18px"
            borderRadius="full"
            bg={isComplete ? "linear-gradient(180deg, #17318C 0%, #36C5FF 100%)" : "rgba(23,49,140,0.12)"}
          />
        ) : null}
      </Stack>

      <Box
        flex="1"
        borderBottom={stepNumber < 4 ? "1px solid rgba(23, 49, 140, 0.08)" : "0"}
        pb={stepNumber < 4 ? 4 : 0}
        pt={0.5}
      >
        <Text fontSize="10px" fontWeight="900" color="#17318C" opacity={isOn ? 0.78 : 0.46} mb={1}>
          {stepLabel}
        </Text>
        <Text fontSize="sm" fontWeight="850" lineHeight="1.1" color={isOn ? "text.primary" : "text.muted"}>
          {label}
        </Text>
      </Box>
    </HStack>
  );
}

function HealthTwinHeroVisual() {
  return (
    <Box w="100%" maxW={{ base: "360px", md: "760px", lg: "600px" }} mx="auto" position="relative" minH={{ base: "380px", md: "520px", lg: "500px" }}>
      <HeroFeatureOrbit />
      <Box
        position="absolute"
        left="50%"
        top={{ base: "18px", md: "4px" }}
        transform="translateX(-50%)"
        w={{ base: "174px", md: "270px", lg: "250px", xl: "270px" }}
        h={{ base: "310px", md: "480px", lg: "444px", xl: "480px" }}
        borderRadius={{ base: "28px", md: "34px" }}
        bg="#101827"
        p={{ base: "8px", md: "10px" }}
        boxShadow="0 30px 70px rgba(6,37,76,0.24)"
        zIndex={2}
      >
        <Box position="absolute" top="10px" left="50%" transform="translateX(-50%)" w="88px" h="20px" bg="#101827" borderBottomRadius="16px" zIndex={3} />
        <Box h="100%" borderRadius="26px" bg="linear-gradient(180deg, #EAF8FF, #FFFFFF)" overflow="hidden" position="relative">
          <Box
            as="video"
            position="absolute"
            inset={0}
            w="100%"
            h="100%"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={AVATAR_POSTER}
            objectFit="cover"
          >
            <source src={AVATAR_WEBM} type="video/webm" />
            <source src={AVATAR_MP4} type="video/mp4" />
          </Box>
          <Box position="absolute" inset={0} bg="linear-gradient(180deg, rgba(241,251,255,0.18), rgba(255,255,255,0.02) 48%, rgba(6,37,76,0.12))" />
          <Flex
            position="absolute"
            left={{ base: 3, md: 4 }}
            right={{ base: 3, md: 4 }}
            top={{ base: "38px", md: "54px" }}
            align="center"
            justify="space-between"
            gap={2}
            bg="rgba(255,255,255,0.78)"
            border="1px solid rgba(255,255,255,0.78)"
            borderRadius="14px"
            px={{ base: 2.5, md: 3 }}
            py={{ base: 2, md: 2.5 }}
            boxShadow="0 12px 28px rgba(6,37,76,0.12)"
            backdropFilter="blur(10px)"
          >
            <Stack spacing={0} align="flex-start">
              <Text fontSize="xs" color={VEEVEE_MUTED} fontWeight="900">Health Twin</Text>
              <Text fontSize={{ base: "lg", md: "2xl" }} lineHeight="1" fontWeight="900" color={VEEVEE_NAVY}>85<Text as="span" fontSize="xs" color={VEEVEE_MUTED}>/100</Text></Text>
            </Stack>
            <Text fontSize="xs" color="#168A52" fontWeight="900">Strong</Text>
          </Flex>

          <Flex
            position="absolute"
            left={{ base: 3, md: 4 }}
            right={{ base: 3, md: 4 }}
            bottom={{ base: 4, md: 5 }}
            align="center"
            gap={{ base: 2, md: 3 }}
            bg="rgba(255,255,255,0.76)"
            border="1px solid rgba(255,255,255,0.78)"
            borderRadius="14px"
            px={{ base: 2.5, md: 3 }}
            py={{ base: 2, md: 2.5 }}
            boxShadow="0 12px 28px rgba(6,37,76,0.12)"
            backdropFilter="blur(10px)"
          >
              <Flex boxSize={{ base: "28px", md: "34px" }} borderRadius="full" bg={VEEVEE_NAVY} color="white" align="center" justify="center" fontWeight="900">
                +
              </Flex>
              <Stack spacing={0} align="flex-start" flex="1" minW={0}>
                <Text fontSize="xs" color={VEEVEE_MUTED} fontWeight="800">Top Priority</Text>
                <Text fontSize={{ base: "xs", md: "sm" }} lineHeight="1.1" fontWeight="900" color={VEEVEE_NAVY}>Pick your focus</Text>
              </Stack>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}

function HeroFeatureOrbit() {
  return (
    <Box position="absolute" inset={0} pointerEvents="none" zIndex={1}>
      <Box position="absolute" left={{ base: 0, md: 8 }} top={{ base: "22%", md: "22%" }}>
        <HeroFeatureCard {...HERO_FEATURE_CARDS[0]} />
      </Box>
      <Box position="absolute" left={{ base: 2, md: 0 }} top={{ base: "45%", md: "46%" }}>
        <HeroFeatureCard {...HERO_FEATURE_CARDS[1]} />
      </Box>
      <Box position="absolute" left={{ base: 8, md: 14 }} bottom={{ base: "10%", md: "12%" }}>
        <HeroFeatureCard {...HERO_FEATURE_CARDS[2]} />
      </Box>
      <Box position="absolute" right={{ base: 0, md: 8 }} top={{ base: "35%", md: "34%" }}>
        <HeroFeatureCard {...HERO_FEATURE_CARDS[3]} />
      </Box>
      <Box position="absolute" right={{ base: 8, md: 4 }} bottom={{ base: "18%", md: "20%" }}>
        <HeroFeatureCard {...HERO_FEATURE_CARDS[4]} />
      </Box>
    </Box>
  );
}

function HeroFeatureCard({
  label,
  mobileLabel,
  symbol,
  color,
}: {
  label: string;
  mobileLabel: string;
  copy: string;
  symbol: string;
  color: string;
}) {
  return (
    <Flex
      align="center"
      gap={{ base: 2, md: 3 }}
      bg="rgba(255,255,255,0.72)"
      borderRadius={{ base: "12px", md: "14px" }}
      p={{ base: 1.25, md: 3 }}
      w={{ base: "82px", md: "132px" }}
      minH={{ base: "40px", md: "58px" }}
      boxShadow={{ base: "0 8px 18px rgba(6,37,76,0.08)", md: "0 12px 28px rgba(6,37,76,0.10)" }}
      border="1px solid rgba(17,119,186,0.08)"
      backdropFilter="blur(10px)"
    >
      <Flex
        boxSize={{ base: "26px", md: "38px" }}
        borderRadius="full"
        bg={`${color}1F`}
        color={color}
        align="center"
        justify="center"
        flex="0 0 auto"
      >
        <Text fontSize={{ base: "12px", md: "18px" }} lineHeight="1" fontWeight="900">
          {symbol}
        </Text>
      </Flex>
      <Stack spacing={0} align="flex-start" textAlign="left">
        <Text display={{ base: "block", md: "none" }} fontSize="10px" lineHeight="1.05" fontWeight="900" color={VEEVEE_NAVY}>
          {mobileLabel}
        </Text>
        <Text display={{ base: "none", md: "block" }} fontSize="sm" lineHeight="1.05" fontWeight="900" color={VEEVEE_NAVY}>
          {label}
        </Text>
      </Stack>
    </Flex>
  );
}

type HealthTwinFunnelProps = {
  conversionOnly?: boolean;
};

export default function HealthTwinFunnel({ conversionOnly = false }: HealthTwinFunnelProps) {
  const [step, setStep] = useState<FunnelStep>(0);
  const [selectedUploadId, setSelectedUploadId] = useState<string | null>(null);
  const [selectedEvolutionIds, setSelectedEvolutionIds] = useState<string[]>([]);

  const border = useColorModeValue("border.default", "border.default");
  const muted = useColorModeValue("text.muted", "text.muted");
  const panelBg = useColorModeValue("rgba(255, 255, 255, 0.82)", "rgba(6, 37, 76, 0.70)");
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.92)", "rgba(6, 37, 76, 0.62)");
  const activeCardBg = useColorModeValue("rgba(17, 119, 186, 0.10)", "rgba(17, 119, 186, 0.20)");
  const activeBorder = useColorModeValue("#1177BA", "#9CE7FF");
  const heroSurface = useColorModeValue("rgba(255,255,255,0.74)", "rgba(255,255,255,0.06)");
  const heroBorder = useColorModeValue("rgba(23, 49, 140, 0.14)", "rgba(156, 231, 255, 0.16)");
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

  const availableEvolutionOptions = useMemo(
    () =>
      selectedUpload
        ? EVOLUTION_OPTIONS.filter((option) => option.uploadIds.includes(selectedUpload.id))
        : [],
    [selectedUpload]
  );

  const selectedEvolution = useMemo(
    () => availableEvolutionOptions.filter((option) => selectedEvolutionIds.includes(option.id)),
    [availableEvolutionOptions, selectedEvolutionIds]
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
  const selectedFocus = selectedEvolution[0] ?? null;
  const stepThreeTeaser = selectedFocus
    ? STEP_THREE_TEASERS[selectedFocus.id] ?? {
        headline: `${selectedUpload?.title ?? "Your input"} is now focused on ${selectedFocus.title.toLowerCase()}.`,
        watch: "One signal is useful, but your real twin can connect more context.",
        good: "You picked a clear outcome, which makes the next step easier.",
        next: "Create your twin to turn this preview into a personalized plan.",
        metricLabel: "Main Goal",
        metricValue: selectedFocus.title,
      }
    : null;
  const activeFunnelStep = FUNNEL_STEPS[step];
  const showConversion = conversionOnly || step === 3;
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
    setSelectedEvolutionIds([]);
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

  const handleConversionClick = () => {
    trackCtaClick({
      ctaName: "health_twin_funnel_create_from_step_4_visual",
      ctaText: "Create My Health Twin",
      placement: "health_twin_step_4_visual",
      destinationType: "external",
      destinationUrl: APP_LINKS.external.authenticatedConsole,
      pagePath: conversionOnly ? APP_LINKS.internal.healthTwinCreate : APP_LINKS.internal.healthTwin,
    });
    window.location.href = APP_LINKS.external.authenticatedConsole;
  };

  const handleConversionKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handleConversionClick();
  };

  const handleStepThreeForward = () => {
    if (step !== 2 || !canAdvance) {
      return;
    }

    handleNext();
  };

  const handleStepThreeKeyDown = (event: KeyboardEvent) => {
    if (step !== 2 || (event.key !== "Enter" && event.key !== " ")) {
      return;
    }

    event.preventDefault();
    handleStepThreeForward();
  };

  return (
    <Box
      as="main"
      minH="100vh"
      bg={VEEVEE_LIGHT}
      color={VEEVEE_NAVY}
      overflow="hidden"
      cursor={step === 2 ? "pointer" : "default"}
      role={step === 2 ? "link" : undefined}
      tabIndex={step === 2 ? 0 : undefined}
      aria-label={step === 2 ? "Continue to Step 4" : undefined}
      onClick={step === 2 ? handleStepThreeForward : undefined}
      onKeyDown={step === 2 ? handleStepThreeKeyDown : undefined}
      _focusVisible={step === 2 ? { outline: "4px solid", outlineColor: VEEVEE_BLUE, outlineOffset: "-4px" } : undefined}
    >
      <Box position="absolute" inset={0} bg="linear-gradient(160deg, rgba(239,251,255,0.98), rgba(255,255,255,0.96) 52%, rgba(54,197,255,0.18))" />
      <Stack spacing={{ base: 5, md: 7 }} position="relative" maxW="1160px" mx="auto" px={{ base: 5, md: 8 }} py={{ base: 4, md: 10 }}>
        {showConversion ? (
          <Box
            role="link"
            tabIndex={0}
            aria-label="Continue to VeeVee"
            cursor="pointer"
            onClick={handleConversionClick}
            onKeyDown={handleConversionKeyDown}
            _hover={{ textDecoration: "none" }}
          >
            <Flex align="center" gap={{ base: 3, md: 4 }} mb={{ base: 1, md: 2 }}>
              <Image src="/brand/2026/icon.svg" alt="VeeVee icon" h={{ base: "44px", md: "58px" }} w="auto" objectFit="contain" />
              <Stack spacing={0}>
                <Image src="/brand/2026/wordmark.svg" alt="VeeVee" h={{ base: "12px", md: "15px" }} w="auto" objectFit="contain" />
                <Text color={VEEVEE_MUTED} fontWeight="800" fontSize={{ base: "sm", md: "md" }}>
                  Create your free Health Twin
                </Text>
              </Stack>
            </Flex>

            <Flex
              direction={{ base: "column", lg: "row" }}
              align={{ base: "center", lg: "center" }}
              justify="space-between"
              gap={{ base: 4, md: 7, lg: 12 }}
            >
              <Stack
                spacing={{ base: 3, md: 6, lg: 6 }}
                align={{ base: "center", lg: "flex-start" }}
                textAlign={{ base: "center", lg: "left" }}
                flex="1"
                maxW={{ base: "780px", lg: "540px" }}
              >
                <Badge
                  bg={VEEVEE_NAVY}
                  color="white"
                  borderRadius="full"
                  px={{ base: 5, md: 6 }}
                  py={{ base: 2.5, md: 3 }}
                  fontSize={{ base: "sm", md: "md" }}
                  letterSpacing="0.04em"
                >
                  Your Health Twin
                </Badge>

                <Stack spacing={{ base: 3, md: 4 }} align={{ base: "center", lg: "flex-start" }}>
                  <Heading
                    as="h1"
                    fontFamily="Georgia, 'Times New Roman', serif"
                    fontSize={{ base: "48px", md: "8xl", lg: "6xl", xl: "7xl" }}
                    lineHeight={{ base: "0.88", md: "0.84", lg: "0.9" }}
                    letterSpacing="0"
                    maxW={{ base: "390px", md: "780px", lg: "500px" }}
                    color={VEEVEE_NAVY}
                  >
                    Create your digital twin.
                  </Heading>
                  <Text
                    fontSize={{ base: "xl", md: "2xl" }}
                    lineHeight="1.18"
                    color={VEEVEE_NAVY}
                    maxW={{ base: "360px", md: "620px", lg: "460px" }}
                    fontWeight="800"
                  >
                    Get a warm, personal experience that shapes itself around your health story.
                  </Text>
                </Stack>

                <Button
                  bg={VEEVEE_BLUE}
                  color="white"
                  borderRadius="full"
                  minH={{ base: "66px", md: "76px" }}
                  w={{ base: "100%", md: "auto" }}
                  minW={{ base: "100%", md: "520px", lg: "420px" }}
                  maxW={{ base: "520px", md: "none" }}
                  px={{ base: 8, md: 14, lg: 12 }}
                  fontSize={{ base: "xl", md: "3xl", lg: "2xl", xl: "3xl" }}
                  fontWeight="900"
                  boxShadow="0 22px 46px rgba(17,119,186,0.34)"
                  _hover={{ bg: "#006FA2", textDecoration: "none", transform: "translateY(-1px)" }}
                >
                  Create My Health Twin
                </Button>

                <Text fontSize={{ base: "sm", md: "lg" }} color={VEEVEE_MUTED} fontWeight="900">
                  Free to start. Takes less than a minute.
                </Text>
              </Stack>

              <Box flex="1" w="100%" maxW={{ base: "760px", lg: "560px", xl: "600px" }}>
                <HealthTwinHeroVisual />
              </Box>
            </Flex>
          </Box>
        ) : (
          <Box
            borderWidth="1px"
            borderColor={heroBorder}
            borderRadius="3xl"
            bg="rgba(255,255,255,0.78)"
            boxShadow="0 18px 44px rgba(6, 37, 76, 0.08)"
            p={{ base: 5, md: 8 }}
            overflow="hidden"
            position="relative"
          >
            <Stack spacing={{ base: 5, md: 7 }} position="relative">
              <Badge alignSelf="flex-start" bg={VEEVEE_NAVY} color="white" px={3} py={1} borderRadius="full">
                HEALTH TWIN
              </Badge>

              <Stack spacing={2} maxW="760px">
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="accent.soft" fontWeight="900">
                  {activeFunnelStep.stepLabel}
                </Text>
                <Heading as="h1" size={{ base: "lg", md: "2xl" }} fontWeight="900" lineHeight="0.96" color={VEEVEE_NAVY}>
                  {activeFunnelStep.label}
                </Heading>
                <Text fontSize={{ base: "sm", md: "lg" }} color={muted} maxW="680px">
                  {activeFunnelStep.subtitle}
                </Text>
              </Stack>

              <Box display={{ base: "none", md: "block" }} bg={heroSurface} border="1px solid" borderColor={heroBorder} borderRadius="2xl" px={5} py={5}>
                <DesktopProgressBar currentStep={step} />
              </Box>

              <Box display={{ base: "block", md: "none" }} bg={heroSurface} border="1px solid" borderColor={heroBorder} borderRadius="2xl" px={4} py={4}>
                <Stack spacing={0}>
                  <MobileJourneyStep
                    stepNumber={step + 1}
                    stepLabel={activeFunnelStep.stepLabel}
                    label={activeFunnelStep.label}
                    isActive
                    isComplete={false}
                  />
                </Stack>
              </Box>
            </Stack>
          </Box>
        )}

        {!showConversion ? (
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
                    imageSrc={option.imageSrc}
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
                  What outcome matters most?
                </Heading>
                <Text fontSize="sm" color={muted}>
                  Pick one focus. Your Health Twin does the rest.
                </Text>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                {availableEvolutionOptions.map((option) => (
                  <FocusTile
                    key={option.id}
                    option={option}
                    isSelected={selectedEvolutionIds.includes(option.id)}
                    isDimmed={selectedEvolutionIds.length > 0 && !selectedEvolutionIds.includes(option.id)}
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

          {step === 2 && selectedUpload && selectedFocus && stepThreeTeaser && result && simulatedInput ? (
            <Stack spacing={5}>
              <Box>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="accent.soft" mb={2}>
                  Step 3
                </Text>
                <Heading as="h2" size="lg" mb={1}>
                  Your first recommendation
                </Heading>
                <Text fontSize="sm" color={muted}>
                  Based on {selectedUpload.title} and your goal: {selectedFocus.title}.
                </Text>
              </Box>

              <Box borderWidth="1px" borderColor={insightAccentBorder} borderRadius="3xl" bg={insightCardBg} p={{ base: 5, md: 6 }}>
                <Stack spacing={{ base: 5, md: 6 }}>
                  <Stack spacing={2}>
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="accent.soft" fontWeight="900">
                      First recommendation
                    </Text>
                    <Heading as="h3" size={{ base: "md", md: "lg" }} lineHeight="1.1">
                    {stepThreeTeaser.headline}
                    </Heading>
                  </Stack>

                  <Stack spacing={4}>
                    <RecommendationStep number={1} label="What to watch" body={stepThreeTeaser.watch} />
                    <RecommendationStep number={2} label="Why this is useful" body={stepThreeTeaser.good} />
                    <RecommendationStep number={3} label="Next move" body={stepThreeTeaser.next} />
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          ) : null}

        </Box>
        ) : null}

        {!showConversion ? (
        <Stack direction={{ base: "column", sm: "row" }} justify="flex-end" spacing={3}>
          {step === 2 ? (
            <Button
              onClick={(event) => {
                event.stopPropagation();
                handleNext();
              }}
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
        ) : null}
      </Stack>
    </Box>
  );
}
