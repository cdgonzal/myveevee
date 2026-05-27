import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { APP_LINKS } from "../config/links";

type ToolLink = {
  label: string;
  to: string;
  primary?: boolean;
};

type ToolCard = {
  eyebrow: string;
  title: string;
  description: string;
  status: "Live" | "Private" | "Ops";
  links: ToolLink[];
};

const CUSTOMER_TOOLS: ToolCard[] = [
  {
    eyebrow: "SWCA Rewards",
    title: "SWCA Funnel",
    description: "Reward intake, spin wheel, reward certificate, and Health Twin CTA flow.",
    status: "Live",
    links: [
      { label: "Start Rewards", to: APP_LINKS.internal.swcaRewards, primary: true },
      { label: "Intake", to: APP_LINKS.internal.swcaIntake },
      { label: "Wheel", to: APP_LINKS.internal.swcaWheel },
      { label: "End Funnel", to: APP_LINKS.internal.swcaFunnel },
      { label: "Visual Variant", to: APP_LINKS.internal.swcaFunnelVisual },
    ],
  },
  {
    eyebrow: "Expo Activation",
    title: "Twin Card Funnel",
    description: "SWCA Medical Summit flow for name, email, goal, consent, photo, avatar, and print-ready card.",
    status: "Live",
    links: [
      { label: "Start Twin Card", to: APP_LINKS.internal.twinCard, primary: true },
      { label: "Staff View", to: APP_LINKS.internal.twinCardAdmin },
      { label: "Dashboard", to: APP_LINKS.internal.twinDashboard },
    ],
  },
  {
    eyebrow: "SWCA Onboarding",
    title: "VeeVee Status Tracker",
    description: "Internal onboarding brief for SWCA status, pilot rules, and the active patient tracker.",
    status: "Private",
    links: [
      { label: "Open Tracker", to: APP_LINKS.internal.swcaBrief, primary: true },
      { label: "Provider Hub", to: APP_LINKS.internal.swcaHub },
    ],
  },
];

const ADMIN_TOOLS: ToolCard[] = [
  {
    eyebrow: "Campaign Ops",
    title: "SWCA Admin Dashboard",
    description: "Passcode-backed reporting for reward submissions, contact methods, message status, and CSV export.",
    status: "Ops",
    links: [
      { label: "Open Admin", to: APP_LINKS.internal.swcaAdmin, primary: true },
      { label: "Rewards", to: APP_LINKS.internal.swcaRewards },
    ],
  },
  {
    eyebrow: "Expo Ops",
    title: "Twin Dashboard",
    description: "PIN-gated run review, raw/generated image QA, print-ready cards, and print-count tracking.",
    status: "Ops",
    links: [
      { label: "Open Dashboard", to: APP_LINKS.internal.twinDashboard, primary: true },
      { label: "Twin Card Funnel", to: APP_LINKS.internal.twinCard },
    ],
  },
  {
    eyebrow: "Project Ops",
    title: "SWCA Onboarding Brief",
    description: "Current SWCA onboarding status tracker and internal project review page.",
    status: "Private",
    links: [
      { label: "Open Brief", to: APP_LINKS.internal.swcaBrief, primary: true },
      { label: "Provider Hub", to: APP_LINKS.internal.swcaHub },
    ],
  },
];

const SUPPORT_TOOLS: ToolCard[] = [
  {
    eyebrow: "Core Site",
    title: "Health Twin Funnel",
    description: "Public guided preview for the standard VeeVee Health Twin account creation path.",
    status: "Live",
    links: [
      { label: "Open Funnel", to: APP_LINKS.internal.healthTwin, primary: true },
      { label: "Create", to: APP_LINKS.internal.healthTwinCreate },
    ],
  },
  {
    eyebrow: "Diagnostics",
    title: "Avatar Playback Test",
    description: "Hidden browser playback check for VeeVee avatar video assets.",
    status: "Private",
    links: [
      { label: "Open Test", to: APP_LINKS.internal.avatarPlaybackTest, primary: true },
    ],
  },
];

export default function Tools() {
  return (
    <Stack spacing={{ base: 8, md: 10 }}>
      <ToolsHero />
      <ToolSection title="Active Tools" description="Customer and event flows currently wired into myveevee.com." tools={CUSTOMER_TOOLS} />
      <ToolSection title="Admin Views" description="Operational dashboards and internal status surfaces." tools={ADMIN_TOOLS} />
      <ToolSection title="Supporting Tools" description="Shared VeeVee utilities and diagnostics." tools={SUPPORT_TOOLS} />
    </Stack>
  );
}

function ToolsHero() {
  const panelBg = useColorModeValue("rgba(255,255,255,0.72)", "rgba(7,18,34,0.72)");
  const borderColor = useColorModeValue("rgba(17,119,186,0.18)", "rgba(156,231,255,0.18)");

  return (
    <Box
      border="1px solid"
      borderColor={borderColor}
      bg={panelBg}
      borderRadius="8px"
      p={{ base: 5, md: 8 }}
      boxShadow="0 20px 60px rgba(11,35,65,0.08)"
    >
      <Stack spacing={4} maxW="820px">
        <Text fontSize="xs" fontWeight="900" letterSpacing="0.18em" textTransform="uppercase" color="#1177BA">
          Tools Index
        </Text>
        <Heading as="h1" size={{ base: "xl", md: "2xl" }} color="text.primary" letterSpacing="0">
          myveevee.com tools
        </Heading>
        <Text fontSize={{ base: "md", md: "lg" }} color="text.muted" lineHeight="1.7">
          One place to find the live funnels, expo tools, SWCA onboarding tracker, and admin dashboards already
          available on the site.
        </Text>
      </Stack>
    </Box>
  );
}

function ToolSection({ title, description, tools }: { title: string; description: string; tools: ToolCard[] }) {
  return (
    <Stack spacing={4}>
      <Box>
        <Heading as="h2" size="lg" color="text.primary" letterSpacing="0">
          {title}
        </Heading>
        <Text color="text.muted" mt={2}>
          {description}
        </Text>
      </Box>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
        {tools.map((tool) => (
          <ToolCardView key={`${tool.eyebrow}-${tool.title}`} tool={tool} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}

function ToolCardView({ tool }: { tool: ToolCard }) {
  const cardBg = useColorModeValue("white", "surface.900");
  const borderColor = useColorModeValue("rgba(11,35,65,0.12)", "rgba(156,231,255,0.16)");
  const primaryLink = tool.links.find((link) => link.primary) ?? tool.links[0];

  return (
    <LinkBox
      as="article"
      minH="260px"
      border="1px solid"
      borderColor={borderColor}
      bg={cardBg}
      borderRadius="8px"
      p={5}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      transition="border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease"
      _hover={{
        borderColor: "#1177BA",
        transform: "translateY(-2px)",
        boxShadow: "0 16px 40px rgba(11,35,65,0.10)",
      }}
    >
      <Stack spacing={4}>
        <HStack justify="space-between" align="center">
          <Text fontSize="xs" fontWeight="900" letterSpacing="0.14em" textTransform="uppercase" color="#1177BA">
            {tool.eyebrow}
          </Text>
          <StatusBadge status={tool.status} />
        </HStack>
        <Stack spacing={2}>
          <Heading as="h3" size="md" color="text.primary" letterSpacing="0" lineHeight="1.2">
            <LinkOverlay as={RouterLink} to={primaryLink.to}>
              {tool.title}
            </LinkOverlay>
          </Heading>
          <Text color="text.muted" lineHeight="1.6">
            {tool.description}
          </Text>
        </Stack>
      </Stack>

      <HStack spacing={2} flexWrap="wrap" pt={5}>
        {tool.links.map((link) => (
          <Button
            key={`${tool.title}-${link.label}`}
            as={RouterLink}
            to={link.to}
            size="sm"
            borderRadius="8px"
            bg={link.primary ? "#1177BA" : "transparent"}
            color={link.primary ? "white" : "#1177BA"}
            border="1px solid"
            borderColor={link.primary ? "#1177BA" : "rgba(17,119,186,0.28)"}
            _hover={{ bg: link.primary ? "#0b5d94" : "rgba(17,119,186,0.08)" }}
          >
            {link.label}
          </Button>
        ))}
      </HStack>
    </LinkBox>
  );
}

function StatusBadge({ status }: { status: ToolCard["status"] }) {
  const colorScheme = status === "Live" ? "green" : status === "Ops" ? "blue" : "purple";

  return (
    <Badge colorScheme={colorScheme} borderRadius="6px" px={2} py={1}>
      {status}
    </Badge>
  );
}
