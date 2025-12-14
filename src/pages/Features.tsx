// File: src/pages/Features.tsx
// Version: 1.2 (2025-12-13)
// Purpose:
//   Marketing-style "Features" page for myVeeVee.com.
//
// What changed in v1.2:
//   ✅ Added optional feature images (screenshots/illustrations) per card.
//   ✅ Kept Apple-style hover reveal on desktop.
//   ✅ Added mobile-friendly "tap to reveal" behavior (since mobile has no hover).
//   ✅ Added a subtle "Tap to learn more" hint on mobile to make the interaction obvious.
//
// UX goal:
//   Make the page instantly understandable for non-readers:
//   Image → headline → 1 line → (optional) tap/hover for deeper benefit copy.
//
// Potential future steps (not implemented here):
//   - Add a "How it works" 3-step strip under the hero (3 images + 1-line captions).
//   - Add lightweight GIF/MP4 loops (6–10s) instead of static images for 2–3 flagship features.
//   - Add deep links: each feature card can link to a specific surface (Feed, Guides, Shop).
//   - Add a "For Providers" variant with different copy + proof points.
//   - Add analytics logging (view + tap/hover reveal) to measure engagement.
//
// Images you should add (place in: public/images/features/*):
//   - /images/features/guides.png
//   - /images/features/health-story.png
//   - /images/features/benefits.png
//   - /images/features/trajectory.png
//   - /images/features/insights.png
//   - /images/features/support.png
//   - /images/features/marketplace.png
//
// Notes on image style:
//   - Best: real product screenshots inside phone mockups (trust + clarity).
//   - Good: clean illustrations while product evolves.
//   - Keep consistent aspect ratio per section for a premium feel.

import React from "react";
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
  Image,
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

  // NEW (v1.2): Optional image to reduce text heaviness
  imageSrc?: string;
  imageAlt?: string;
  imageMode?: "cover" | "contain";
};

function FeatureCard({
  eyebrow,
  title,
  front,
  back,
  size = "md",
  imageSrc,
  imageAlt,
  imageMode = "cover",
}: FeatureCardProps) {
  const isPill = size === "pill";

  // Mobile has no hover, so we make reveal tap-based.
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [open, setOpen] = React.useState(false);

  // Desktop uses hover; mobile uses tap state.
  const frontOpacity = isMobile ? (open ? 0.08 : 1) : 1;
  const backOpacity = isMobile ? (open ? 1 : 0) : 0;

  return (
    <MotionCard
      role="group"
      bg="surface.800"
      borderRadius={isPill ? "full" : "2xl"}
      borderWidth="1px"
      borderColor="whiteAlpha.200"
      overflow="hidden"
      cursor={isMobile && !isPill ? "pointer" : "default"}
      onClick={
        isMobile && !isPill
          ? () => setOpen((v) => !v)
          : undefined
      }
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
        {/* Visual header (v1.2)
            Adds instant comprehension: picture first, then text. */}
        {imageSrc && !isPill && (
          <Box
            mb={4}
            borderRadius="xl"
            overflow="hidden"
            borderWidth="1px"
            borderColor="whiteAlpha.200"
            bg="blackAlpha.400"
          >
            <Image
              src={imageSrc}
              alt={imageAlt || title}
              w="100%"
              h={{ base: "160px", md: size === "lg" ? "220px" : "160px" }}
              objectFit={imageMode}
              opacity={0.95}
              loading="lazy"
            />
          </Box>
        )}

        {/* Front content */}
        <Box
          opacity={frontOpacity}
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

          {/* Mobile hint for discoverability */}
          {isMobile && !isPill && (
            <Text mt={3} fontSize="xs" color="whiteAlpha.600">
              Tap to learn more
            </Text>
          )}
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
          opacity={backOpacity}
          transition="opacity 0.25s ease-out"
          _groupHover={{ opacity: 1 }}
          pointerEvents={isMobile ? (open ? "auto" : "none") : "auto"}
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

            {/* Mobile hint to close */}
            {isMobile && !isPill && (
              <Text mt={3} fontSize="xs" color="whiteAlpha.600">
                Tap again to close
              </Text>
            )}
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
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
          <MotionBox variants={fadeUp} initial="hidden" animate="visible">
            <FeatureCard
              size="lg"
              eyebrow="Core"
              title="AI Wellness Guides"
              front="Personalized guidance that helps you make sense of what’s happening in your life. From stress and sleep to symptoms and recovery."
              back="Quick Guides, Deep Guides, and the VeeVee companion subscription give you step-by-step support that is personalized to YOU. Focus on what matters most, YOU!"
              imageSrc="/images/features/guides.png"
              imageAlt="AI Wellness Guides screenshot"
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
              imageSrc="/images/features/health-story.png"
              imageAlt="Health story and check-ins screenshot"
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
              VeeVee helps you understand your coverage, your benefits, and your
              health patterns.
            </Text>
          </MotionBox>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 4, md: 5 }}>
            <FeatureCard
              title="Covered Care Benefits"
              front="Check before you book."
              back="Uncover checkups, screenings, and services your plan already offers."
              imageSrc="/images/features/benefits.png"
              imageAlt="Benefits discovery screenshot"
            />

            <FeatureCard
              title="Wellness Trajectory"
              front="VeeVee reveals your trends."
              back="Spot early changes in your wellness patterns so you can stay at your best."
              imageSrc="/images/features/trajectory.png"
              imageAlt="Wellness trends screenshot"
            />

            <FeatureCard
              title="Behavior Insights"
              front="Tiny patterns add up."
              back="You might discover that you sleep better on days you walk more. Insights that are unique to you."
              imageSrc="/images/features/insights.png"
              imageAlt="Behavior insights screenshot"
            />

            <FeatureCard
              title="Personalized Care Support"
              front="Find the right kind of support."
              back="VeeVee helps you feel more prepared and less alone."
              imageSrc="/images/features/support.png"
              imageAlt="Personalized support screenshot"
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
            // NOTE: pill card intentionally stays text-forward.
            // If you want, we can convert pill into a two-column row with an image.
          />
        </MotionBox>

        {/* Bottom CTA */}
        <Stack spacing={4} textAlign="center" pt={{ base: 4, md: 6 }}>
          <CLink
            href="https://veevee.io"
            _hover={{ textDecoration: "none" }}
            _focus={{ boxShadow: "none" }}
            display="block"
          >
            <Heading as="h2" size="md">
              Got health?
            </Heading>
            <Text fontSize="sm" color="whiteAlpha.800" maxW="2xl" mx="auto">
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
