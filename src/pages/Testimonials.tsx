// File: src/pages/Testimonials.tsx
// Version: 1.1 (2025-12-08)
// Purpose:
//   Compact testimonials module for myVeeVee.com.
//   - Short, high-impact social proof from 3 patient voices + 1 clinician.
//   - One consistent shell: headline, quote, micro-story, and single CTA.
//   - Users switch voices via soft neon pills; the layout and CTA stay fixed.
// Layout & Interaction:
//   - Short page (not tall): one main section centered on the screen.
//   - Tab/pill selector swaps content with a gentle fade/slide (Framer Motion).
//   - CTA always pushes to veevee.io to reinforce the funnel.
// Mobile fix (v1.1):
//   - On mobile, testimonial pills are now full-width stacked buttons.
//   - No overlapping text, no tiny pills: clean, tappable rows.
// Future iterations (not yet implemented):
//   - Add avatar photos or initials for each voice.
//   - A/B test ordering of voices or quote variants.
//   - Embed star ratings or clinic logos for added trust.

import * as React from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  Stack,
  Badge,
  useBreakpointValue,
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
    pillLabel: "Ashley · Caregiver",
    roleLine: "Ashley Cooper, 45 · Working mom & caregiver",
    oneLiner:
      "“AI and health felt terrifying to me until VeeVee made it feel safe and simple.”",
    story:
      "I’m not a tech person, and I was nervous about uploading anything related to my personal wellness. VeeVee walked me through my insurance cards and documents in plain language and showed me benefits I didn’t know I had. I still take things slow, but now I feel less afraid and more in control.",
    emphasis: "Cautious about AI. Found comfort, clarity, and hidden perks.",
  },
  {
    id: "ryan",
    pillLabel: "Ryan · Sales Professional",
    roleLine: "Ryan Blake, 29 · Tech Sales professional",
    oneLiner:
      "“VeeVee finally feels like the health app I’ve been waiting for.”",
    story:
      "I use AI for work, planning, even workouts. I’m all-in on AI, and VeeVee is the first health experience that actually matches how I live. VeeVee connects my patterns, my coverage, and my daily choices. Now I want even more: cost comparisons, deeper insights, and smarter next steps.",
    emphasis: "AI-forward. Wants more power, more insight, more future.",
  },
  {
    id: "walter",
    pillLabel: "Walter · Retired on Medicare",
    roleLine: "Walter Harris, 72 · Retired teacher on Medicare",
    oneLiner:
      "“Even I can use VeeVee. That says everything.”",
    story:
      "I don’t do tech yet the young lady at my doctor’s office set up VeeVee for me, and now I actually use it. The questions are simple, the buttons are big enough, and it helps me understand what Medicare covers. I don’t feel lost in the system the way I used to.",
    emphasis: "Low tech. High usefulness. Simple enough to stick with.",
  },
  {
    id: "dr_rostant",
    pillLabel: "Dr. Rostant · Physician",
    roleLine: "Carlo Rostant, MD",
    oneLiner:
      "“VeeVee helps my patients show up informed, prepared, and more confident than ever.”",
    story:
      "Many patients arrive overwhelmed by symptoms and insurance details before we even begin. VeeVee gives them clarity on their concerns and benefits, and helps them form better questions. When patients feel empowered, our conversations are stronger and their care decisions improve.",
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

  return (
    <Box
      as="main"
      minH="100vh"
      bgGradient="linear(to-b, #050816, #070B1F)"
      color="whiteAlpha.900"
      py={{ base: 10, md: 16 }}
      px={{ base: 6, md: 10 }}
    >
      <Stack
        maxW="4xl"
        mx="auto"
        spacing={{ base: 8, md: 10 }}
        align="stretch"
      >
        {/* Top heading */}
        <Stack spacing={3} textAlign="center">
          <Text
            fontSize="sm"
            letterSpacing="0.18em"
            textTransform="uppercase"
            color="accent.300"
          >
            WHAT PEOPLE SAY ABOUT VEEVEE
          </Text>
          <Heading
            as="h1"
            size={{ base: "lg", md: "xl" }}
            fontWeight="800"
          >
            Real stories from real people using VeeVee.
          </Heading>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            color="whiteAlpha.800"
            maxW="2xl"
            mx="auto"
          >
            Three patient voices and one clinician, all seeing healthcare
            differently with VeeVee by their side.
          </Text>
        </Stack>

        {/* Voice selector pills */}
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
                  bg={isActive ? "accent.400" : "transparent"}
                  color={isActive ? "#050816" : "whiteAlpha.900"}
                  borderColor="accent.400"
                  _hover={{
                    bg: isActive ? "accent.400" : "whiteAlpha.100",
                  }}
                  _focus={{ boxShadow: "0 0 0 2px rgba(0,245,160,0.5)" }}
                >
                  {voice.pillLabel}
                </Button>
              );
            })}
          </Stack>
        </Box>

        {/* Testimonial shell + CTA */}
        <Box
          borderRadius="2xl"
          bg="rgba(7, 11, 31, 0.95)"
          borderWidth="1px"
          borderColor="whiteAlpha.200"
          boxShadow="0 0 40px rgba(0,0,0,0.7)"
          px={{ base: 5, md: 8 }}
          py={{ base: 6, md: 8 }}
        >
          <AnimatePresence mode="wait">
            <MotionBox
              key={activeVoice.id}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Stack spacing={{ base: 4, md: 5 }}>
                {/* Role / tag */}
                <Stack direction="row" spacing={3} align="center">
                  <Badge
                    variant="subtle"
                    colorScheme="green"
                    bg="rgba(0,245,160,0.12)"
                    color="accent.300"
                    borderRadius="full"
                    px={3}
                    py={1}
                    fontSize="xs"
                  >
                    Testimonial
                  </Badge>
                  <Text
                    fontSize="xs"
                    color="whiteAlpha.600"
                    textTransform="uppercase"
                    letterSpacing="0.14em"
                  >
                    {activeVoice.roleLine}
                  </Text>
                </Stack>

                {/* One-liner */}
                <Heading
                  as="h2"
                  size={{ base: "md", md: "lg" }}
                  fontWeight="800"
                  lineHeight="1.2"
                >
                  {activeVoice.oneLiner}
                </Heading>

                {/* Story + emphasis */}
                <Stack spacing={3}>
                  <Text fontSize="sm" color="whiteAlpha.900">
                    {activeVoice.story}
                  </Text>
                  {activeVoice.emphasis && (
                    <Text fontSize="xs" color="whiteAlpha.700">
                      {activeVoice.emphasis}
                    </Text>
                  )}
                </Stack>

                {/* CTA row */}
                <Stack
                  spacing={{ base: 3, md: 2 }}
                  direction={isMobile ? "column" : "row"}
                  align={isMobile ? "flex-start" : "center"}
                  justify="space-between"
                  pt={{ base: 2, md: 3 }}
                  borderTopWidth="1px"
                  borderColor="whiteAlpha.200"
                  mt={{ base: 3, md: 4 }}
                >
                  <Box>
                    <Text fontSize="sm" fontWeight="600">
                      Ready to see what VeeVee can do for you?
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.700">
                      Trusted by real clinicians • HIPAA-aligned • Encrypted
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
