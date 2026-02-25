import * as React from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  Stack,
  Badge,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion(Box);

type VoiceId = "ashley" | "ryan" | "walter" | "dr_rostant";

type TestimonialVoice = {
  id: VoiceId;
  pillLabel: string;
  roleLine: string;
  oneLiner: string;
  story: string;
  emphasis?: string;
};

const TESTIMONIALS: TestimonialVoice[] = [
  {
    id: "ashley",
    pillLabel: "Ashley | Caregiver",
    roleLine: "Ashley Cooper, 45 | Working mom and caregiver",
    oneLiner: "AI and health felt scary to me until VeeVee made it simple.",
    story:
      "I am not a tech person, and I was nervous about sharing personal wellness information. VeeVee walked me through my cards and documents in plain language and showed me benefits I did not know I had. I still move slowly, but now I feel less afraid and more in control.",
    emphasis: "Cautious about AI. Found comfort, clarity, and hidden perks.",
  },
  {
    id: "ryan",
    pillLabel: "Ryan | Sales Professional",
    roleLine: "Ryan Blake, 29 | Tech sales professional",
    oneLiner: "VeeVee is finally the health app I have been waiting for.",
    story:
      "I use AI for work, planning, and workouts. VeeVee is the first health experience that matches how I already live. It connects my patterns, my coverage, and my daily choices. I want more depth next, including cost comparisons and smarter next steps.",
    emphasis: "AI-forward. Wants more insight and more power.",
  },
  {
    id: "walter",
    pillLabel: "Walter | Retired on Medicare",
    roleLine: "Walter Harris, 72 | Retired teacher on Medicare",
    oneLiner: "Even I can use VeeVee, and that says everything.",
    story:
      "I do not usually use apps, but staff at my doctor office helped me set up VeeVee. The questions are simple and it helps me understand what Medicare covers. I do not feel lost in the system the way I used to.",
    emphasis: "Low tech. High usefulness. Simple enough to stick with.",
  },
  {
    id: "dr_rostant",
    pillLabel: "Dr. Rostant | Physician",
    roleLine: "Carlo Rostant, MD",
    oneLiner: "VeeVee helps patients show up informed and prepared.",
    story:
      "Many patients arrive overwhelmed before we even begin. VeeVee gives them clarity on concerns and benefits, and helps them bring better questions into visits. When patients feel empowered, conversations improve and decisions improve.",
    emphasis: "Future-looking clinician. Sees AI as a way to elevate care.",
  },
];

const contentVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
};

export default function Testimonials() {
  const [activeId, setActiveId] = React.useState<VoiceId>("ashley");
  const activeVoice = TESTIMONIALS.find((t) => t.id === activeId)!;
  const isMobile = useBreakpointValue({ base: true, md: false });

  const pageGradient = useColorModeValue(
    "linear(to-b, gray.50, blue.50)",
    "linear(to-b, surface.900, surface.800)"
  );
  const muted = useColorModeValue("text.muted", "text.muted");
  const subtle = useColorModeValue("text.subtle", "text.subtle");
  const borderColor = useColorModeValue("border.default", "border.default");
  const cardBg = useColorModeValue("bg.surface", "rgba(7, 11, 31, 0.95)");

  return (
    <Box
      as="main"
      minH="100vh"
      bgGradient={pageGradient}
      color="text.primary"
      py={{ base: 10, md: 16 }}
      px={{ base: 6, md: 10 }}
    >
      <Stack maxW="4xl" mx="auto" spacing={{ base: 8, md: 10 }} align="stretch">
        <Stack spacing={3} textAlign="center">
          <Text fontSize="sm" letterSpacing="0.18em" textTransform="uppercase" color="accent.soft">
            WHAT PEOPLE SAY ABOUT VEEVEE
          </Text>
          <Heading as="h1" size={{ base: "lg", md: "xl" }} fontWeight="800">
            Real stories from real people using VeeVee.
          </Heading>
          <Text fontSize={{ base: "sm", md: "md" }} color={muted} maxW="2xl" mx="auto">
            Three patient voices and one clinician, all seeing healthcare differently with VeeVee by their side.
          </Text>
        </Stack>

        <Box>
          <Stack direction={{ base: "column", md: "row" }} spacing={3} justify={{ base: "flex-start", md: "center" }} align={{ base: "stretch", md: "center" }}>
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
                  _hover={{ bg: isActive ? "accent.primary" : "blackAlpha.100" }}
                  _focus={{ boxShadow: "0 0 0 2px rgba(0,245,160,0.5)" }}
                >
                  {voice.pillLabel}
                </Button>
              );
            })}
          </Stack>
        </Box>

        <Box borderRadius="2xl" bg={cardBg} borderWidth="1px" borderColor={borderColor} boxShadow="0 0 40px rgba(0,0,0,0.25)" px={{ base: 5, md: 8 }} py={{ base: 6, md: 8 }}>
          <AnimatePresence mode="wait">
            <MotionBox key={activeVoice.id} variants={contentVariants} initial="hidden" animate="visible" exit="exit">
              <Stack spacing={{ base: 4, md: 5 }}>
                <Stack direction="row" spacing={3} align="center">
                  <Badge variant="subtle" colorScheme="green" bg="rgba(0,245,160,0.12)" color="accent.soft" borderRadius="full" px={3} py={1} fontSize="xs">
                    Testimonial
                  </Badge>
                  <Text fontSize="xs" color={subtle} textTransform="uppercase" letterSpacing="0.14em">
                    {activeVoice.roleLine}
                  </Text>
                </Stack>

                <Heading as="h2" size={{ base: "md", md: "lg" }} fontWeight="800" lineHeight="1.2">
                  {activeVoice.oneLiner}
                </Heading>

                <Stack spacing={3}>
                  <Text fontSize="sm" color="text.primary">
                    {activeVoice.story}
                  </Text>
                  {activeVoice.emphasis && (
                    <Text fontSize="xs" color={muted}>
                      {activeVoice.emphasis}
                    </Text>
                  )}
                </Stack>

                <Stack
                  spacing={{ base: 3, md: 2 }}
                  direction={isMobile ? "column" : "row"}
                  align={isMobile ? "flex-start" : "center"}
                  justify="space-between"
                  pt={{ base: 2, md: 3 }}
                  borderTopWidth="1px"
                  borderColor={borderColor}
                  mt={{ base: 3, md: 4 }}
                >
                  <Box>
                    <Text fontSize="sm" fontWeight="600">
                      Ready to see what VeeVee can do for you?
                    </Text>
                    <Text fontSize="xs" color={muted}>
                      Trusted by real clinicians | HIPAA-aligned | Encrypted
                    </Text>
                  </Box>
                  <Button
                    as="a"
                    href="https://veevee.io"
                    size="md"
                    borderRadius="full"
                    fontWeight="700"
                    px={8}
                    alignSelf={isMobile ? "stretch" : "center"}
                    boxShadow="0 0 26px rgba(0, 245, 160, 0.4)"
                  >
                    Start at VeeVee.io
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

