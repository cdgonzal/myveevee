// File: src/pages/HowItWorks.tsx
// Version: 1.0 (2025-12-07)
// Purpose:
//   Explain "How VeeVee works" in a way that feels soft, empowering, and funnel-driven.
//   This page is designed as a conversion path into veevee.io, not a dense documentation page.
//   It introduces:
//     - A simple 3-step flow (Connect → Decode → Use what you have)
//     - Three levels of guidance (Quick Guide, Deep Guide, Companion)
//     - Clear calls to action to start at VeeVee.io
// Motion & Visuals:
//   - Uses framer-motion for gentle fade/slide-in of hero and step cards.
//   - Uses a subtle flowing gradient behind the "guidance levels" cards to imply movement & support.
// Future iterations (not yet implemented):
//   - Wire a dedicated /terms or /legal page and link from the disclaimers.
//   - Add subtle scroll-based animations for section transitions.
//   - A/B test CTA wording and placement for conversion optimization.

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
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { motion } from "framer-motion";

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
      px={{ base: 6, md: 10 }}
    >
      <Stack spacing={{ base: 12, md: 16 }} maxW="5xl" mx="auto">
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
            Soft AI. Everyday wellness. Built around you.
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
            color="whiteAlpha.800"
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

          <Text
            fontSize="sm"
            color="whiteAlpha.700"
            mt={3}
          >
            No diagnoses. No medical advice. Just clarity and everyday support
            for your health decisions.
          </Text>
        </MotionBox>

        {/* 3-step section */}
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
              How VeeVee works in 3 simple steps
            </Heading>
            <Text
              fontSize="sm"
              color="whiteAlpha.700"
              textAlign={isMobile ? "left" : "center"}
            >
              A calm, guided flow to help you connect your plan, decode your
              benefits, and act on what you already have.
            </Text>
          </MotionBox>

          <SimpleGrid
            columns={{ base: 1, md: 3 }}
            spacing={5}
          >
            <MotionCard
              bg="surface.800"
              borderWidth="1px"
              borderColor="whiteAlpha.200"
              borderRadius="xl"
              whileHover={{ y: -4, boxShadow: "0 0 28px rgba(0, 245, 160, 0.35)" }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <CardBody>
                <Text
                  fontSize="xs"
                  color="accent.300"
                  textTransform="uppercase"
                  letterSpacing="0.16em"
                  mb={2}
                >
                  Step 1
                </Text>
                <Heading as="h3" size="sm" mb={2}>
                  Connect your plan
                </Heading>
                <Text fontSize="sm" color="whiteAlpha.800" mb={3}>
                  Vee securely reads your health benefits and coverage so it can
                  help you see what&apos;s already available to you.
                </Text>
                <Text fontSize="xs" color="whiteAlpha.600">
                  • You choose what to connect
                  <br />
                  • You can disconnect anytime
                </Text>
              </CardBody>
            </MotionCard>

            <MotionCard
              bg="surface.800"
              borderWidth="1px"
              borderColor="whiteAlpha.200"
              borderRadius="xl"
              whileHover={{ y: -4, boxShadow: "0 0 28px rgba(0, 245, 160, 0.35)" }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <CardBody>
                <Text
                  fontSize="xs"
                  color="accent.300"
                  textTransform="uppercase"
                  letterSpacing="0.16em"
                  mb={2}
                >
                  Step 2
                </Text>
                <Heading as="h3" size="sm" mb={2}>
                  Vee brings your benefits to life
                </Heading>
                <Text fontSize="sm" color="whiteAlpha.800" mb={3}>
                  Dense plan language becomes simple, everyday guidance—not
                  pages of fine print.
                </Text>
                <Text fontSize="xs" color="whiteAlpha.600">
                  • Discover what&apos;s already free or included
                  <br />
                  • Understand copays, visits, and limits in plain language
                </Text>
              </CardBody>
            </MotionCard>

            <MotionCard
              bg="surface.800"
              borderWidth="1px"
              borderColor="whiteAlpha.200"
              borderRadius="xl"
              whileHover={{ y: -4, boxShadow: "0 0 28px rgba(0, 245, 160, 0.35)" }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <CardBody>
                <Text
                  fontSize="xs"
                  color="accent.300"
                  textTransform="uppercase"
                  letterSpacing="0.16em"
                  mb={2}
                >
                  Step 3
                </Text>
                <Heading as="h3" size="sm" mb={2}>
                  Use what you already have
                </Heading>
                <Text fontSize="sm" color="whiteAlpha.800" mb={3}>
                  Gentle nudges help you act on covered care that fits your
                  current season of life.
                </Text>
                <Text fontSize="xs" color="whiteAlpha.600">
                  • Checkups, screenings, preventive care
                  <br />
                  • Therapy visits, follow-ups, and more
                </Text>
              </CardBody>
            </MotionCard>
          </SimpleGrid>
        </Stack>

        {/* Levels of guidance section */}
        <Stack spacing={6}>
          <MotionBox
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.15 }}
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
              color="whiteAlpha.700"
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
                <MotionCard
                  bg="surface.800"
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor="whiteAlpha.200"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                >
                  <CardBody>
                    <Heading as="h3" size="sm" mb={2}>
                      AI Quick Guide
                    </Heading>
                    <Text fontSize="sm" color="whiteAlpha.800" mb={3}>
                      One focused session to help you make sense of what&apos;s
                      going on today—like a new symptom, stressful week, or
                      confusing benefit.
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.600">
                      Great for quick clarity without a big commitment.
                    </Text>
                  </CardBody>
                </MotionCard>

                <MotionCard
                  bg="surface.800"
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor="whiteAlpha.200"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.05 }}
                >
                  <CardBody>
                    <Heading as="h3" size="sm" mb={2}>
                      AI Deep Guide (3-Day)
                    </Heading>
                    <Text fontSize="sm" color="whiteAlpha.800" mb={3}>
                      A short plan built around one issue—like pain, sleep,
                      stress, or recovery—with small, practical steps over a few
                      days.
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.600">
                      Understand → decode → act, at a calm, human pace.
                    </Text>
                  </CardBody>
                </MotionCard>

                <MotionCard
                  bg="surface.800"
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor="whiteAlpha.200"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 }}
                >
                  <CardBody>
                    <Heading as="h3" size="sm" mb={2}>
                      Vee – AI Wellness Companion
                    </Heading>
                    <Text fontSize="sm" color="whiteAlpha.800" mb={3}>
                      An ongoing companion that grows with your data and patterns
                      over time, helping you stay connected to your health and
                      your covered care.
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.600">
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
            Ready to see what&apos;s already covered?
          </Heading>
          <Text
            fontSize="sm"
            color="whiteAlpha.700"
            maxW="2xl"
            mx="auto"
          >
            VeeVee helps you unlock the value of benefits you already have, with
            gentle guidance instead of overwhelm.
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
            Start at VeeVee.io →
          </Button>
        </Stack>

        {/* Soft legal / AI disclaimers */}
        <Box
          fontSize="xs"
          color="whiteAlpha.600"
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
