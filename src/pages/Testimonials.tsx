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
};

const TESTIMONIALS: TestimonialVoice[] = [
  {
    id: "ashley",
    pillLabel: "Ashley | Caregiver",
    roleLine: "Ashley Cooper, 45 | Working mom and caregiver",
    quote: "AI and health felt scary to me until VeeVee made it simple.",
    summary: "A caregiver who wanted help without feeling overwhelmed by apps or medical language.",
    situationLabel: "Situation",
    situation:
      "Ashley was juggling work, family, and health paperwork. She felt cautious about AI, unsure what benefits were available, and nervous about putting personal information into another app.",
    outcomeLabel: "Outcome",
    outcome:
      "VeeVee translated cards and documents into plain language, surfaced hidden benefits, and helped her feel more confident and less afraid of making the wrong move.",
  },
  {
    id: "ryan",
    pillLabel: "Ryan | Sales Professional",
    roleLine: "Ryan Blake, 29 | Tech sales professional",
    quote: "VeeVee is finally the health app I have been waiting for.",
    summary: "A digitally fluent user who wanted healthcare to feel as smart and responsive as the rest of his life.",
    situationLabel: "Situation",
    situation:
      "Ryan already uses AI for work, planning, and fitness. Most health tools felt disconnected, static, and unable to connect his habits, coverage, and day-to-day decisions.",
    outcomeLabel: "Outcome",
    outcome:
      "VeeVee gave him one place to understand patterns, coverage, and smarter next steps, making healthcare feel more useful instead of reactive.",
  },
  {
    id: "walter",
    pillLabel: "Walter | Medicare",
    roleLine: "Walter Harris, 72 | Retired teacher on Medicare",
    quote: "Even I can use VeeVee, and that says everything.",
    summary: "A Medicare patient who wanted something simple, calm, and easy to stick with.",
    situationLabel: "Situation",
    situation:
      "Walter does not usually rely on apps and often felt lost trying to understand what Medicare covered or what he should do next after a visit.",
    outcomeLabel: "Outcome",
    outcome:
      "With a simple setup and clear questions, VeeVee helped him understand coverage, follow his care more easily, and feel less lost in the system.",
  },
  {
    id: "dr_rostant",
    pillLabel: "Dr. Rostant | Physician",
    roleLine: "Carlo Rostant, MD",
    quote: "VeeVee helps patients show up informed and prepared.",
    summary: "A clinician who wants patients, families, and care teams more aligned before and after visits.",
    situationLabel: "Situation",
    situation:
      "Many patients arrive overwhelmed and families are not always aligned on benefits, concerns, or the right questions. That slows visits and weakens follow-through at home.",
    outcomeLabel: "Outcome",
    outcome:
      "VeeVee helps patients come in with better context, better questions, and clearer follow-up, improving the quality of conversations and decisions.",
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
            Real stories, with a clearer before and after.
          </Heading>
          <Text fontSize={{ base: "sm", md: "md" }} color={muted} maxW="2xl" mx="auto">
            Each story is shown the same way: what the person said, what they were dealing with, and what changed with VeeVee.
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
                  <StoryBlock
                    label={activeVoice.outcomeLabel}
                    text={activeVoice.outcome}
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
                    to={APP_LINKS.cta.getStarted}
                    size="md"
                    borderRadius="full"
                    fontWeight="700"
                    px={8}
                    alignSelf={isMobile ? "stretch" : "center"}
                    boxShadow="0 0 26px rgba(17, 119, 186, 0.4)"
                  >
                    Get started
                  </Button>
                </Stack>
              </Stack>
            </MotionBox>
          </AnimatePresence>
        </Box>
      </Stack>
    </Box>
  );
}
