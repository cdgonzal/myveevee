// File: src/pages/Features.tsx
// Version: 1.0 (2025-12-07)
// Purpose:
//   Marketing-style "Features" page for myVeeVee.com.
//   Text-only, Apple-style layout that showcases the VeeVee ecosystem:
//     - AI Wellness Guides
//     - Your Health, Understood
//     - Covered Care Benefits
//     - Wellness Trajectory
//     - Behavior Insights
//     - Personalized Care Support
//     - Marketplace (horizontal pill card)
// Interaction:
//   - Soft hover reveal: front copy fades back and deeper benefit copy fades in.
//   - Gentle elevation + glow on hover. No icons, no flips, no heavy motion.
// Future iterations (not yet implemented):
//   - Deeper links into specific product surfaces (Feed, Quick Guides, Shop).
//   - Screenshots or illustrations for each feature.
//   - A "For Providers" variant of the Features layout.

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
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

type FeatureCardProps = {
  eyebrow?: string;
  title: string;
  front: string;
  back: string;
  size?: "lg" | "md" | "pill";
};

function FeatureCard({ eyebrow, title, front, back, size = "md" }: FeatureCardProps) {
  const isPill = size === "pill";

  return (
    <MotionCard
      role="group"
      bg="surface.800"
      borderRadius={isPill ? "full" : "2xl"}
      borderWidth="1px"
      borderColor="whiteAlpha.200"
      overflow="hidden"
      whileHover={{
        y: -3,
        boxShadow: "0 0 30px rgba(0, 245, 160, 0.35)",
      }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <CardBody
        position="relative"
        p={{ base: isPill ? 4 : 5, md: isPill ? 5 : 6 }}
      >
        {/* Front content */}
        <Box
          opacity={1}
          transition="opacity 0.25s ease-out"
          _groupHover={{ opacity: 0.08 }}
        >
          {eyebrow && (
            <Text
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="0.16em"
              color="accent.300"
              mb={2}
            >
              {eyebrow}
            </Text>
          )}
          <Heading
            as="h3"
            size={size === "lg" ? "md" : "sm"}
            mb={2}
            color="whiteAlpha.900"
          >
            {title}
          </Heading>
          <Text
            fontSize="sm"
            color="whiteAlpha.800"
            maxW={size === "lg" ? "sm" : "none"}
          >
            {front}
          </Text>
        </Box>

        {/* Back / reveal content */}
        <Box
          position="absolute"
          inset={0}
          display="flex"
          alignItems="center"
          justifyContent={isPill ? "space-between" : "flex-start"}
          px={{ base: isPill ? 4 : 5, md: isPill ? 5 : 6 }}
          opacity={0}
          transition="opacity 0.25s ease-out"
          _groupHover={{ opacity: 1 }}
        >
          <Box maxW={isPill ? "lg" : "full"}>
            {eyebrow && (
              <Text
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="0.16em"
                color="accent.200"
                mb={2}
              >
                {eyebrow}
              </Text>
            )}
            <Heading
              as="h3"
              size={size === "lg" ? "md" : "sm"}
              mb={2}
              color="accent.300"
            >
              {title}
            </Heading>
            <Text fontSize="sm" color="whiteAlpha.900">
              {back}
            </Text>
          </Box>

          {isPill && (
            <Button
              as="a"
              href="https://veevee.io"
              size="sm"
              borderRadius="full"
              fontWeight="700"
              px={6}
              ml={{ base: 0, md: 4 }}
              mt={{ base: 4, md: 0 }}
              boxShadow="0 0 24px rgba(0, 245, 160, 0.35)"
            >
              Explore in VeeVee
            </Button>
          )}
        </Box>
      </CardBody>
    </MotionCard>
  );
}

export default function Features() {
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
        maxW="6xl"
        mx="auto"
        px={{ base: 6, md: 10 }}
      >
        {/* Hero */}
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
            FEATURES
          </Text>

          <Heading
            as="h1"
            size={{ base: "lg", md: "xl" }}
            fontWeight="800"
            mb={3}
          >
            Everything your wellness needs, in one place.
          </Heading>

          <Text
            fontSize={{ base: "md", md: "lg" }}
            maxW="3xl"
            mx="auto"
            color="whiteAlpha.900"
          >
            VeeVee brings your health story, benefits, patterns, and next steps
            together, so your wellness finally makes sense.
          </Text>
        </MotionBox>

        {/* Row 1 – two large flagship cards */}
        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          spacing={{ base: 4, md: 6 }}
        >
          <MotionBox variants={fadeUp} initial="hidden" animate="visible">
            <FeatureCard
              size="lg"
              eyebrow="Core"
              title="AI Wellness Guides"
              front="Personalized guidance that helps you make sense of what’s happening in your life. From stress and sleep to symptoms and recovery."
              back="Quick Guides, Deep Guides, and the VeeVee companion subscription give you a step-by-step support that is personalized to YOU. Focus on what matters most, YOU!"
            />
          </MotionBox>

          <MotionBox
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.05 }}
          >
            <FeatureCard
              size="lg"
              eyebrow="Your Story"
              title="Your Health, Understood"
              front="VeeVee listens. Your check-ins and history surface patterns that become a living picture of your wellness."
              back="VeeVee remembers what you’ve shared and uses it to keep future guidance more personal and more relevant to you."
            />
          </MotionBox>
        </SimpleGrid>

        {/* Row 2 – four medium feature cards */}
        <Stack spacing={4}>
          <MotionBox
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <Heading
              as="h2"
              size="md"
              mb={2}
              textAlign={isMobile ? "left" : "center"}
            >
              Built to connect the dots for you
            </Heading>
            <Text
              fontSize="sm"
              color="whiteAlpha.800"
              maxW="3xl"
              mx={isMobile ? undefined : "auto"}
              textAlign={isMobile ? "left" : "center"}
            >
              VeeVee looks at your coverage, your patterns, and your choices
              together — so you can move from guessing to understanding.
            </Text>
          </MotionBox>

          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 4 }}
            spacing={{ base: 4, md: 5 }}
          >
            <FeatureCard
              title="Covered Care Benefits"
              front="Vee highlights checkups, screenings, and services that may already be included with your plan."
              back="See what might be available before you book — so you can use more of what you’re already paying for, and miss less of the care meant for you."
            />

            <FeatureCard
              title="Wellness Trajectory"
              front="Over time, Vee helps you see if things are trending better, worse, or staying the same."
              back="By comparing your patterns over weeks and months, Vee can help you notice early changes — and encourage you to stay on track when you’re improving."
            />

            <FeatureCard
              title="Behavior Insights"
              front="Tiny patterns add up. Vee connects your sleep, mood, movement, and habits."
              back="You might discover that you sleep better on days you walk more, or that certain routines make your pain lighter. These insights are unique to you."
            />

            <FeatureCard
              title="Personalized Care Support"
              front="When you’re ready for more help, Vee can point you toward the right kind of support."
              back="From finding the right type of clinician to preparing for a visit, Vee helps you feel more prepared and less alone in your next step."
            />
          </SimpleGrid>
        </Stack>

        {/* Row 3 – Marketplace pill card */}
        <MotionBox
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <FeatureCard
            size="pill"
            eyebrow="Coming to more partners soon"
            title="Marketplace & Covered Essentials"
            front="Discover products, recovery tools, and supports that fit your health goals — including items that may be covered by your benefits."
            back="Instead of searching blindly, Vee can surface braces, supports, and everyday essentials that match your needs and, when possible, your coverage — so you can feel better equipped in daily life."
          />
        </MotionBox>

        {/* Bottom CTA */}
        <Stack spacing={4} textAlign="center" pt={{ base: 4, md: 6 }}>
          <Heading as="h2" size="md">
            Ready to see these features working with your own health?
          </Heading>
          <Text
            fontSize="sm"
            color="whiteAlpha.800"
            maxW="2xl"
            mx="auto"
          >
            Create a free account at VeeVee.io and start with an AI Wellness
            Guide. As you keep showing up, Vee will bring more of these features
            to life around your real story.
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
            Create your free VeeVee account
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
