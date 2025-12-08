// File: src/pages/Features.tsx
// Version: 1.1 (2025-12-08)
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
//   - Mobile-safe Marketplace pill: on small screens, back content stacks
//     vertically so the pill doesn’t collapse or narrow on hover.
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
import { Link as CLink } from "@chakra-ui/react";

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

function FeatureCard({
  eyebrow,
  title,
  front,
  back,
  size = "md",
}: FeatureCardProps) {
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
          flexDirection={{
            base: isPill ? "column" : "column",
            md: isPill ? "row" : "row",
          }}
          alignItems={{
            base: "flex-start",
            md: isPill ? "center" : "flex-start",
          }}
          justifyContent={{
            base: "flex-start",
            md: isPill ? "space-between" : "flex-start",
          }}
          px={{ base: isPill ? 4 : 5, md: isPill ? 5 : 6 }}
          py={{ base: isPill ? 4 : 6 }}
          gap={{ base: isPill ? 3 : 2, md: isPill ? 4 : 0 }}
          opacity={0}
          transition="opacity 0.25s ease-out"
          _groupHover={{ opacity: 1 }}
        >
          <Box maxW={isPill ? "100%" : "full"}>
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
              mt={{ base: 3, md: 0 }}
              alignSelf={{ base: "stretch", md: "center" }}
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
              back="Quick Guides, Deep Guides, and the VeeVee companion subscription give you step-by-step support that is personalized to YOU. Focus on what matters most, YOU!"
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
          <MotionBox variants={fadeUp} initial="hidden" animate="visible">
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
              VeeVee helps you understand your coverage, your benefits,
              and your health patterns.
            </Text>
          </MotionBox>

          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 4 }}
            spacing={{ base: 4, md: 5 }}
          >
            <FeatureCard
              title="Covered Care Benefits"
              front="Check before you book."
              back="VeeVee helps you uncover checkups, screenings, and services your plan already offers, often without extra cost."
            />

            <FeatureCard
              title="Wellness Trajectory"
              front="VeeVee reveals your trends."
              back="Spot early changes in your wellness patterns so you can stay at your best."
            />

            <FeatureCard
              title="Behavior Insights"
              front="Tiny patterns add up."
              back="You might discover that you sleep better on days you walk more. Insights that are unique to you."
            />

            <FeatureCard
              title="Personalized Care Support"
              front="Find the right kind of support."
              back="VeeVee helps you feel more prepared and less alone."
            />
          </SimpleGrid>
        </Stack>

        {/* Row 3 – Marketplace pill card */}
        <MotionBox variants={fadeUp} initial="hidden" animate="visible">
          <FeatureCard
            size="pill"
            eyebrow="Expanding your Choices"
            title="Personalized Marketplace made for You"
            front="Discover products, recovery tools, and much more"
            back="VeeVee finds what is right for You, and only You."
          />
        </MotionBox>

        {/* Bottom CTA */}
        <Stack spacing={4} textAlign="center" pt={{ base: 4, md: 6 }}>
          <CLink href="https://veevee.io" _hover={{ textDecoration: "none" }} _focus={{ boxShadow: "none" }} display="block">
            <Heading as="h2" size="md">
              Got health?
            </Heading>
            <Text
              fontSize="sm"
              color="whiteAlpha.800"
              maxW="2xl"
              mx="auto"
            >
              Unlock your wellness with a free account at VeeVee.io
            </Text>
          </CLink>
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
            Start for free
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
