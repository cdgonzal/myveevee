// File: src/pages/HowItWorks.tsx
// Version: 1.3 (2025-12-07)
// Purpose:
//   Funnel-focused "How it works" page centered on AI Wellness Guides.
//   - Leads with: Start with a free AI Wellness Guide.
//   - Shows the 3-guide lineup (Quick, Deep, Companion) with 1/2/3 badges.
//   - Pushes users to create a free VeeVee account and begin with a Quick Guide.
// Visual & Motion:
//   - Dark neon background to match Home.
//   - framer-motion fade/slide-in.
//   - Flowing gradient frame around the Guides section.
//   - Number badges animate on hover via Chakra group hover.

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
  Link,
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
        spacing={{ base: 10, md: 14 }}
        maxW="5xl"
        mx="auto"
        px={{ base: 6, md: 10 }}
      >
        {/* Hero: AI Wellness Guides */}
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
            AI WELLNESS GUIDES · POWERED BY VEEVEE
          </Text>

          <Button
            as="a"
            href="https://veevee.io"
            size="lg"
            borderRadius="full"
            fontWeight="700"
            px={10}
            boxShadow="0 0 40px rgba(0, 245, 160, 0.45)"
          >
            Get started
          </Button>

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
              Start with free AI Quick Guides
            </Heading>
            <Text
              fontSize="sm"
              color="whiteAlpha.800"
              textAlign={isMobile ? "left" : "center"}
            >
              The free AI Quick Guides cover common concerns like pain, stress, sleep, 
              new symptoms, and benefits. 
              <br />
              For deeper support, try 3-day plans with AI Deep Guides, 
              or subscribe to VeeVee as your daily companion.
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
                {/* Guide 1 – Quick Guide */}
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
                        AI Quick Guides
                      </Heading>
                    </Flex>

                    <Text fontSize="sm" color="whiteAlpha.900" mb={3}>
                      Always free! Quick Guides help you make sense of what&apos;s
                      going on right now, right now. You hit your knee? New symptom? Stressful week? 
                      <Link href="https://veevee.io" color="accent.400" fontWeight="700" _hover={{ textDecoration: "underline", color: "accent.300" }}>Start here</Link>
                      For free!
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.800">
                      Great for quick immediate clarity.
                    </Text>
                  </CardBody>
                </MotionCard>

                {/* Guide 2 – Deep Guide */}
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
                        AI Deep Guides
                      </Heading>
                    </Flex>

                    <Text fontSize="sm" color="whiteAlpha.900" mb={3}>
                      3-Day short plans built around one issue: YOUR WELLNESS. 
                      Personalized guidance that allows you to understand, decode & act.
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.800">
                      Understand → decode → act.
                    </Text>
                  </CardBody>
                </MotionCard>

                {/* Guide 3 – Companion */}
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
                        VeeVee: AI Wellness Companion
                      </Heading>
                    </Flex>

                    <Text fontSize="sm" color="whiteAlpha.900" mb={3}>
                      An ongoing companion that grows with you and learns 
                      from your daily beahviors, helping you stay connected 
                      to your wellness and understand your covered care benefits.
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.800">
                      Everyday support by your side.
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
            Ready to see what VeeVee can unlock for you?
          </Heading>
          <Text
            fontSize="sm"
            color="whiteAlpha.800"
            maxW="2xl"
            mx="auto"
          >
            Open a free account today.
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
            Start your first AI Quick Guide →
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
