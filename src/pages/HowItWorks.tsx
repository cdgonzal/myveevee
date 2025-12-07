// File: src/pages/HowItWorks.tsx
// Version: 1.2 (2025-12-07)
// Purpose:
//   Simplified, funnel-focused "How it works" page centered on AI Wellness Guides.
//   The page now:
//     - Leads with the Guides value (Quick, Deep, Companion).
//     - Uses 1 / 2 / 3 numbering on each Guide card to clarify the lineup.
//     - Ends with a single, clear CTA to start a first AI Guide for free.
// Visual & Motion:
//   - Dark neon background to match Home.
//   - framer-motion for gentle fade/slide-in.
//   - Flowing gradient frame around the Guides section.
//   - Number badges animate on hover via Chakra group hover.
// Future iterations (not yet implemented):
//   - Dedicated "Compare plans" or pricing section for the Companion tier.
//   - Deep links to specific Guide examples (Pain, Sleep, Women’s, etc.).

import {
  Box,
  Button,
  Heading,
  Text,
  SimpleGrid,
  Stack,
  Card,
  CardBody,
  useBreakpointValue,
  Flex,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { keyframes } from "@emotion/react";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

// Simple fade-up animation for sections
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// Flowing gradient animation behind the guidance cards
const flowGradient = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
`;

export default function HowItWorks() {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box
      as="main"
      minH="100vh"
      bgGradient="linear(to-b, #050816, #070B1F)"
      color="whiteAlpha.900"
      py={{ base: 10, md: 20 }}
    >
      <Stack
        spacing={{ base: 12, md: 16 }}
        maxW="5xl"
        mx="auto"
        px={{ base: 6, md: 10 }}
      >
        {/* Hero section */}
        <MotionBox
          textAlign="center"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <Text
            fontSize="sm"
            letterSpacing="0.18em"
            textTransform="uppercase"
            color="accent.300"
            mb={3}
          >
            SOFT AI. EVERYDAY WELLNESS. BUILT AROUND YOU.
          </Text>

          <Heading
            as="h1"
            size={{ base: "lg", md: "xl" }}
            fontWeight="800"
            mb={4}
          >
            Got Health?{" "}
            <Box as="span" color="accent.400">
              Unlock your wellness today.
            </Box>
          </Heading>

          <Text
            fontSize={{ base: "md", md: "lg" }}
            maxW="3xl"
            mx="auto"
            color="whiteAlpha.900"
            mb={6}
          >
            VeeVee uses soft, supportive AI to help you notice patterns,
            understand what&apos;s covered, and use the care you already have.
            You stay in charge. Vee just makes things clearer.
          </Text>

          <Stack
            direction={{ base: "column", sm: "row" }}
            spacing={4}
            justify="center"
            align="center"
          >
            <Button
              as="a"
              href="https://veevee.io"
              size="lg"
              borderRadius="full"
              fontWeight="700"
              px={10}
              boxShadow="0 0 40px rgba(0, 245, 160, 0.45)"
            >
              Got Health? Unlock your wellness today
            </Button>
          </Stack>

          <Text fontSize="sm" color="whiteAlpha.800" mt={3}>
            No diagnoses. No medical advice. Just clarity and everyday support
            for your health decisions.
          </Text>
        </MotionBox>

        {/* AI Wellness Guides – main section */}
        <Stack spacing={6}>
          <MotionBox
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <Heading
              as="h2"
              size="md"
              mb={2}
              textAlign={isMobile ? "left" : "center"}
            >
              Three levels of guidance, one calm companion
            </Heading>
            <Text
              fontSize="sm"
              color="whiteAlpha.800"
              textAlign={isMobile ? "left" : "center"}
            >
              Whether you just need a quick check-in or a deeper plan, Vee adapts
              to how much support you want.
            </Text>
          </MotionBox>

          <Box
            position="relative"
            borderRadius="2xl"
            p={{ base: 1, md: 1.5 }}
            bgGradient="linear(to-r, accent.500, accent.300, accent.500)"
            backgroundSize="200% 200%"
            animation={`${flowGradient} 18s linear infinite`}
          >
            <Box
              borderRadius="2xl"
              bg="rgba(5, 8, 22, 0.96)"
              borderWidth="1px"
              borderColor="whiteAlpha.200"
              p={{ base: 4, md: 6 }}
            >
              <SimpleGrid
                columns={{ base: 1, md: 3 }}
                spacing={{ base: 4, md: 6 }}
              >
                {/* Guide 1 */}
                <MotionCard
                  bg="surface.800"
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor="whiteAlpha.300"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  whileHover={{
                    y: -4,
                    boxShadow: "0 0 28px rgba(0, 245, 160, 0.35)",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 18,
                  }}
                  role="group"
                >
                  <CardBody>
                    <Flex align="center" mb={3}>
                      {/* Number badge */}
                      <Box
                        w={8}
                        h={8}
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontWeight="800"
                        fontSize="lg"
                        bg="rgba(0, 245, 160, 0.08)"
                        color="accent.400"
                        border="1px solid"
                        borderColor="accent.400"
                        transition="all 0.2s ease-out"
                        _groupHover={{
                          bg: "accent.400",
                          color: "#050816",
                          boxShadow: "0 0 18px rgba(0, 245, 160, 0.6)",
                          transform: "translateY(-1px)",
                        }}
                      >
                        1
                      </Box>
                      <Heading
                        as="h3"
                        size="sm"
                        ml={3}
                        color="accent.300"
                        opacity={0.95}
                      >
                        AI Quick Guide
                      </Heading>
                    </Flex>

                    <Text fontSize="sm" color="whiteAlpha.900" mb={3}>
                      One focused session to help you make sense of what&apos;s
                      going on today — like a new symptom, stressful week, or
                      confusing benefit.
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.800">
                      Great for quick clarity without a big commitment.
                    </Text>
                  </CardBody>
                </MotionCard>

                {/* Guide 2 */}
                <MotionCard
                  bg="surface.800"
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor="whiteAlpha.300"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.05 }}
                  whileHover={{
                    y: -4,
                    boxShadow: "0 0 28px rgba(0, 245, 160, 0.35)",
                  }}
                  role="group"
                >
                  <CardBody>
                    <Flex align="center" mb={3}>
                      <Box
                        w={8}
                        h={8}
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontWeight="800"
                        fontSize="lg"
                        bg="rgba(0, 245, 160, 0.08)"
                        color="accent.400"
                        border="1px solid"
                        borderColor="accent.400"
                        transition="all 0.2s ease-out"
                        _groupHover={{
                          bg: "accent.400",
                          color: "#050816",
                          boxShadow: "0 0 18px rgba(0, 245, 160, 0.6)",
                          transform: "translateY(-1px)",
                        }}
                      >
                        2
                      </Box>
                      <Heading
                        as="h3"
                        size="sm"
                        ml={3}
                        color="accent.300"
                        opacity={0.95}
                      >
                        AI Deep Guide (3-Day)
                      </Heading>
                    </Flex>

                    <Text fontSize="sm" color="whiteAlpha.900" mb={3}>
                      A short plan built around one issue — like pain, sleep,
                      stress, or recovery — with small, practical steps over a few
                      days.
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.800">
                      Understand → decode → act, at a calm, human pace.
                    </Text>
                  </CardBody>
                </MotionCard>

                {/* Guide 3 */}
                <MotionCard
                  bg="surface.800"
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor="whiteAlpha.300"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 }}
                  whileHover={{
                    y: -4,
                    boxShadow: "0 0 28px rgba(0, 245, 160, 0.35)",
                  }}
                  role="group"
                >
                  <CardBody>
                    <Flex align="center" mb={3}>
                      <Box
                        w={8}
                        h={8}
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontWeight="800"
                        fontSize="lg"
                        bg="rgba(0, 245, 160, 0.08)"
                        color="accent.400"
                        border="1px solid"
                        borderColor="accent.400"
                        transition="all 0.2s ease-out"
                        _groupHover={{
                          bg: "accent.400",
                          color: "#050816",
                          boxShadow: "0 0 18px rgba(0, 245, 160, 0.6)",
                          transform: "translateY(-1px)",
                        }}
                      >
                        3
                      </Box>
                      <Heading
                        as="h3"
                        size="sm"
                        ml={3}
                        color="accent.300"
                        opacity={0.95}
                      >
                        Vee – AI Wellness Companion
                      </Heading>
                    </Flex>

                    <Text fontSize="sm" color="whiteAlpha.900" mb={3}>
                      An ongoing companion that grows with your data and patterns
                      over time, helping you stay connected to your health and
                      your covered care.
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.800">
                      Everyday support that stays soft, calm, and on your side.
                    </Text>
                  </CardBody>
                </MotionCard>
              </SimpleGrid>
            </Box>
          </Box>
        </Stack>

        {/* Bottom CTA */}
        <Stack spacing={4} textAlign="center">
          <Heading as="h2" size="md">
            Ready to start your first AI Wellness Guide?
          </Heading>
          <Text
            fontSize="sm"
            color="whiteAlpha.800"
            maxW="2xl"
            mx="auto"
          >
            Create a free account at VeeVee.io, connect your plan, and let Vee
            surface the benefits and support you already have — starting with a
            free AI Quick Guide.
          </Text>
          <Button
            as="a"
            href="https://veevee.io"
            size="md"
            borderRadius="full"
            fontWeight="700"
            px={8}
            alignSelf="center"
            boxShadow="0 0 28px rgba(0, 245, 160, 0.35)"
          >
            Start your first AI Guide for free →
          </Button>
        </Stack>

        {/* Soft legal / AI disclaimers */}
        <Box
          fontSize="xs"
          color="whiteAlpha.700"
          borderTopWidth="1px"
          borderColor="whiteAlpha.200"
          pt={4}
          mt={4}
        >
          <Text mb={1}>
            VeeVee is a wellness and education companion. It doesn&apos;t provide
            medical advice, diagnoses, or treatment, and it doesn&apos;t replace
            your doctor or your health plan.
          </Text>
          <Text mb={1}>
            Some suggestions are generated by artificial intelligence, which is
            probabilistic and may not always be accurate. Always confirm coverage
            with your insurer and talk to a licensed clinician for medical
            decisions.
          </Text>
          <Text>
            This page is for general information only. Full terms, privacy, and
            legal details are provided inside the VeeVee experience.
          </Text>
        </Box>
      </Stack>
    </Box>
  );
}
