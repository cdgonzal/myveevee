import * as React from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  Stack,
  Badge,
  SimpleGrid,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import { trackCtaClick } from "../analytics/trackCtaClick";
import { APP_LINKS } from "../config/links";

const MotionBox = motion(Box);

type VoiceId = "ashley" | "ryan" | "walter" | "dr_rostant";

type TestimonialVoice = {
  id: VoiceId;
  pillLabel: string;
  roleLine: string;
  quote: string;
  summary: string;
  situationLabel: string;
  situation: string;
  outcomeLabel: string;
  outcome: string;
  outcomePoints: string[];
};

const TESTIMONIALS: TestimonialVoice[] = [
  {
    id: "ashley",
    pillLabel: "Ashley | Caregiver",
    roleLine: "Ashley Cooper, 45 | Working mom in East Tennessee",
    quote: "AI and health felt scary to me until VeeVee made it simple.",
    summary: "A caregiver from the Smoky Mountain region who wanted help without feeling overwhelmed by apps or medical language.",
    situationLabel: "Situation",
    situation:
      "Ashley was juggling work, family, and health paperwork in East Tennessee. She felt cautious about AI, unsure what benefits were available, and nervous about putting personal information into another app.",
    outcomeLabel: "Outcome",
    outcome:
      "VeeVee turned a stressful health admin experience into something she could actually understand and use.",
    outcomePoints: [
      "Plain-language help with cards and documents",
      "Hidden benefits surfaced clearly",
      "More confidence and less fear about next steps",
    ],
  },
  {
    id: "ryan",
    pillLabel: "Ryan | Sales Professional",
    roleLine: "Ryan Blake, 29 | Midwest-born sales professional in Austin",
    quote: "VeeVee is finally the health app I have been waiting for.",
    summary: "A Midwest-born guy now living in Austin who wanted healthcare to feel as smart and responsive as the rest of his life.",
    situationLabel: "Situation",
    situation:
      "Ryan already uses AI for work, planning, and fitness. After moving from the Midwest to Austin, he wanted health tools that matched his fast, digital routine, but most felt disconnected, static, and unable to connect his habits, coverage, and day-to-day decisions.",
    outcomeLabel: "Outcome",
    outcome:
      "VeeVee made healthcare feel closer to the way he already lives: connected, responsive, and useful.",
    outcomePoints: [
      "One place to see patterns and coverage together",
      "Smarter next-step guidance",
      "A more proactive health experience",
    ],
  },
  {
    id: "walter",
    pillLabel: "Walter | Medicare",
    roleLine: "Walter Harris, 72 | Retired teacher in Boca Raton",
    quote: "Even I can use VeeVee, and that says everything.",
    summary: "A retired Medicare patient in Boca who wanted something simple, calm, and easy to stick with.",
    situationLabel: "Situation",
    situation:
      "Walter now enjoys the sun in Boca Raton after leaving behind bitter northern winters. He does not usually rely on apps and often felt lost trying to understand what Medicare covered or what he should do next after a visit.",
    outcomeLabel: "Outcome",
    outcome:
      "VeeVee gave him a calmer, simpler way to follow his care without feeling lost in the system.",
    outcomePoints: [
      "Simple setup and easy questions",
      "Clearer Medicare coverage understanding",
      "More confidence after appointments",
    ],
  },
  {
    id: "dr_rostant",
    pillLabel: "Dr. Rostant | Physician",
    roleLine: "Carlo Rostant, MD | Physician",
    quote: "VeeVee helps patients show up informed and prepared.",
    summary: "A physician who wants patients, families, and care teams more aligned before and after visits.",
    situationLabel: "Situation",
    situation:
      "Many patients arrive overwhelmed and families are not always aligned on benefits, concerns, or the right questions. That slows visits and weakens follow-through at home.",
    outcomeLabel: "Outcome",
    outcome:
      "VeeVee helps the whole care conversation start at a better place and continue more clearly after the visit.",
    outcomePoints: [
      "Patients arrive with better context",
      "Better questions during visits",
      "Clearer follow-up for home and family",
    ],
  },
];

const contentVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
};

function StoryBlock({
  label,
  text,
  borderColor,
  bg,
}: {
  label: string;
  text: string;
  borderColor: string;
  bg: string;
}) {
  return (
    <Box borderWidth="1px" borderColor={borderColor} borderRadius="xl" bg={bg} px={4} py={4}>
      <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color="accent.soft" mb={2}>
        {label}
      </Text>
      <Text fontSize="sm" lineHeight="1.7">
        {text}
      </Text>
    </Box>
  );
}

function OutcomeBlock({
  label,
  summary,
  points,
  borderColor,
  bg,
}: {
  label: string;
  summary: string;
  points: string[];
  borderColor: string;
  bg: string;
}) {
  return (
    <Box borderWidth="1px" borderColor={borderColor} borderRadius="xl" bg={bg} px={4} py={4}>
      <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color="accent.soft" mb={2}>
        {label}
      </Text>
      <Text fontSize="sm" lineHeight="1.7" fontWeight="600" mb={3}>
        {summary}
      </Text>
      <Stack spacing={2}>
        {points.map((point) => (
          <Box key={point} borderWidth="1px" borderColor={borderColor} borderRadius="lg" bg="rgba(255,255,255,0.42)" px={3} py={2}>
            <Text fontSize="sm">{point}</Text>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

export default function Testimonials() {
  const [activeId, setActiveId] = React.useState<VoiceId>("ashley");
  const activeVoice = TESTIMONIALS.find((t) => t.id === activeId)!;
  const isMobile = useBreakpointValue({ base: true, md: false });

  const pageGradient = useColorModeValue(
    "linear(to-b, #FFFFFF, #9CE7FF)",
    "linear(to-b, surface.900, surface.800)"
  );
  const muted = useColorModeValue("text.muted", "text.muted");
  const subtle = useColorModeValue("text.subtle", "text.subtle");
  const borderColor = useColorModeValue("border.default", "border.default");
  const cardBg = useColorModeValue("bg.surface", "surface.800");
  const quoteBg = useColorModeValue("rgba(17, 119, 186, 0.08)", "rgba(17, 119, 186, 0.16)");
  const detailBg = useColorModeValue("rgba(255, 255, 255, 0.82)", "rgba(6, 37, 76, 0.46)");

  return (
    <Box
      as="main"
      minH="100vh"
      bgGradient={pageGradient}
      color="text.primary"
      py={{ base: 10, md: 16 }}
      px={{ base: 6, md: 10 }}
    >
      <Stack maxW="5xl" mx="auto" spacing={{ base: 8, md: 10 }} align="stretch">
        <Stack spacing={3} textAlign="center">
          <Text fontSize="sm" letterSpacing="0.18em" textTransform="uppercase" color="accent.soft">
            WHAT PEOPLE SAY ABOUT VEEVEE
          </Text>
          <Heading as="h1" size={{ base: "lg", md: "xl" }} fontWeight="800">
            VeeVee testimonials from patients, caregivers, and clinicians.
          </Heading>
          <Text fontSize={{ base: "sm", md: "md" }} color={muted} maxW="2xl" mx="auto">
            Read how different people describe the VeeVee experience, what they were dealing with before, and what changed after using the platform.
          </Text>
        </Stack>

        <Box>
          <Stack
            direction={{ base: "column", md: "row" }}
            spacing={3}
            justify={{ base: "flex-start", md: "center" }}
            align={{ base: "stretch", md: "center" }}
          >
            {TESTIMONIALS.map((voice) => {
              const isActive = voice.id === activeId;
              return (
                <Button
                  key={voice.id}
                  variant={isActive ? "solid" : "outline"}
                  size="sm"
                  borderRadius="full"
                  fontWeight={isActive ? "700" : "500"}
                  px={{ base: 4, md: 5 }}
                  py={{ base: 2.5, md: 2 }}
                  fontSize={{ base: "xs", md: "sm" }}
                  w={{ base: "100%", md: "auto" }}
                  onClick={() => setActiveId(voice.id)}
                  bg={isActive ? "accent.primary" : "transparent"}
                  color={isActive ? "accent.on" : "text.primary"}
                  borderColor="accent.primary"
                  _hover={{ bg: isActive ? "accent.primary" : "brand.50" }}
                  _focus={{ boxShadow: "0 0 0 2px rgba(17,119,186,0.5)" }}
                >
                  {voice.pillLabel}
                </Button>
              );
            })}
          </Stack>
        </Box>

        <Box
          borderRadius="2xl"
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="0 0 40px rgba(0,0,0,0.25)"
          px={{ base: 5, md: 8 }}
          py={{ base: 6, md: 8 }}
        >
          <AnimatePresence mode="wait">
            <MotionBox key={activeVoice.id} variants={contentVariants} initial="hidden" animate="visible" exit="exit">
              <Stack spacing={{ base: 5, md: 6 }}>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={3} align="center" flexWrap="wrap">
                    <Badge
                      variant="subtle"
                      bg="rgba(156,231,255,0.28)"
                      color="accent.soft"
                      borderRadius="full"
                      px={3}
                      py={1}
                      fontSize="xs"
                    >
                      Testimonial
                    </Badge>
                    <Text fontSize="xs" color={subtle} textTransform="uppercase" letterSpacing="0.14em">
                      {activeVoice.roleLine}
                    </Text>
                  </Stack>

                  <Box borderWidth="1px" borderColor="accent.primary" borderRadius="xl" bg={quoteBg} px={{ base: 4, md: 5 }} py={{ base: 4, md: 5 }}>
                    <Text fontSize={{ base: "2xl", md: "3xl" }} lineHeight="1" color="accent.primary" fontWeight="700" mb={2}>
                      "
                    </Text>
                    <Heading as="h2" size={{ base: "md", md: "lg" }} fontWeight="800" lineHeight="1.3">
                      {activeVoice.quote}
                    </Heading>
                    <Text fontSize="sm" color={muted} mt={3}>
                      {activeVoice.summary}
                    </Text>
                  </Box>
                </Stack>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <StoryBlock
                    label={activeVoice.situationLabel}
                    text={activeVoice.situation}
                    borderColor={borderColor}
                    bg={detailBg}
                  />
                  <OutcomeBlock
                    label={activeVoice.outcomeLabel}
                    summary={activeVoice.outcome}
                    points={activeVoice.outcomePoints}
                    borderColor="accent.primary"
                    bg={quoteBg}
                  />
                </SimpleGrid>

                <Stack
                  spacing={{ base: 3, md: 2 }}
                  direction={isMobile ? "column" : "row"}
                  align={isMobile ? "flex-start" : "center"}
                  justify="space-between"
                  pt={{ base: 2, md: 3 }}
                  borderTopWidth="1px"
                  borderColor={borderColor}
                  mt={{ base: 1, md: 2 }}
                >
                  <Box>
                    <Text fontSize="sm" fontWeight="600">
                      Ready to see what VeeVee can do for you?
                    </Text>
                    <Text fontSize="xs" color={muted}>
                      Safe, private, and built to make healthcare easier to understand
                    </Text>
                  </Box>
                  <Button
                    as={RouterLink}
                    to={APP_LINKS.internal.healthTwin}
                    onClick={() =>
                      trackCtaClick({
                        ctaName: "testimonials_get_started",
                        ctaText: "Create a Health Twin",
                        placement: "testimonials_bottom_cta",
                        destinationType: "internal",
                        destinationUrl: APP_LINKS.internal.healthTwin,
                        pagePath: APP_LINKS.internal.testimonials,
                      })
                    }
                    size="md"
                    borderRadius="full"
                    fontWeight="700"
                    px={8}
                    alignSelf={isMobile ? "stretch" : "center"}
                    boxShadow="0 0 26px rgba(17, 119, 186, 0.4)"
                  >
                    Create a Health Twin
                  </Button>
                </Stack>
              </Stack>
            </MotionBox>
          </AnimatePresence>
        </Box>

        <Box
          borderRadius="2xl"
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="0 0 40px rgba(0,0,0,0.18)"
          px={{ base: 5, md: 8 }}
          py={{ base: 6, md: 8 }}
        >
          <Stack spacing={5}>
            <Box>
              <Text fontSize="xs" letterSpacing="0.18em" textTransform="uppercase" color="accent.soft" mb={2}>
                More VeeVee Stories
              </Text>
              <Heading as="h2" size="md" mb={2}>
                Snapshot summaries across caregivers, Medicare users, working adults, and clinicians.
              </Heading>
              <Text fontSize="sm" color={muted} maxW="3xl">
                These summaries keep the broader testimonial set visible in the page itself while the interactive
                story view above lets visitors explore each perspective in more detail.
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {TESTIMONIALS.map((voice) => (
                <Box
                  key={`crawlable-${voice.id}`}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="xl"
                  bg={detailBg}
                  px={4}
                  py={4}
                >
                  <Stack spacing={3}>
                    <Box>
                      <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color="accent.soft" mb={1}>
                        {voice.pillLabel}
                      </Text>
                      <Heading as="h3" size="sm" mb={2}>
                        {voice.quote}
                      </Heading>
                      <Text fontSize="sm" color={muted}>
                        {voice.summary}
                      </Text>
                    </Box>

                    <Box>
                      <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color="accent.soft" mb={1}>
                        Situation
                      </Text>
                      <Text fontSize="sm" color="text.primary">
                        {voice.situation}
                      </Text>
                    </Box>

                    <Box>
                      <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color="accent.soft" mb={1}>
                        Outcome
                      </Text>
                      <Text fontSize="sm" color="text.primary" mb={2}>
                        {voice.outcome}
                      </Text>
                      <Stack spacing={1}>
                        {voice.outcomePoints.map((point) => (
                          <Text key={`${voice.id}-${point}`} fontSize="sm" color={muted}>
                            - {point}
                          </Text>
                        ))}
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </SimpleGrid>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
