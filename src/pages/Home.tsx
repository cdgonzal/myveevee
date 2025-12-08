// File: src/pages/Home.tsx
// Version: 1.3 (2025-12-07)
// Purpose:
//   Homepage hero for myVeeVee.com with:
//     - Main "Got Health? Unlock your wellness today." funnel hero
//     - Right-side hero card with logo + doctor/patient image
//     - New payor credibility strip (pill) with scrolling insurer logos
//       to signal that VeeVee works across real-world health plans.
// Visual:
//   - Dark neon gradient background
//   - Primary CTA: Start at VeeVee.io
//   - Payor logos shown in subtle grayscale, gently scrolling.
// Future iterations (not yet implemented):
//   - Swap hero stock image for a more branded visual or illustration.
//   - Mobile-specific tweaks for logo strip speed/spacing.
//   - A/B testing different payor pill copy variants.

import {
  Box,
  Button,
  Heading,
  Stack,
  Text,
  Image,
  Grid,
  HStack,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

// Scrolling animation for the payor logos
const scrollLogos = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

// Normalized payor logos (from public/payors/normalized)
const PAYOR_LOGOS = [
  { src: "/payors/normalized/united.png", alt: "UnitedHealthcare" },
  { src: "/payors/normalized/united2.png", alt: "UnitedHealthcare" },
  { src: "/payors/normalized/aetna.png", alt: "Aetna" },          // if you fix aetna.png later
  { src: "/payors/normalized/cigna.png", alt: "Cigna" },
  { src: "/payors/normalized/humana.png", alt: "Humana" },
  { src: "/payors/normalized/elevance2.png", alt: "Elevance" },
  { src: "/payors/normalized/floridablue.png", alt: "Florida Blue" },
  { src: "/payors/normalized/kaiser2.png", alt: "Kaiser Permanente" },
  { src: "/payors/normalized/centene.png", alt: "Centene" },
  { src: "/payors/normalized/molina.png", alt: "Molina Healthcare" },
  { src: "/payors/normalized/medicare.png", alt: "Medicare" },
  { src: "/payors/normalized/medicaid.png", alt: "Medicaid" },
  { src: "/payors/normalized/cvs.png", alt: "CVS / Aetna" },
].filter((logo) => !!logo.src); // light safety net

export default function Home() {
  return (
    <Box
      as="main"
      minH="100vh"
      bgGradient="linear(to-b, #050816, #070B1F)"
      color="whiteAlpha.900"
      py={{ base: 10, md: 20 }}
      px={{ base: 6, md: 10 }}
    >
      {/* Hero layout */}
      <Grid
        templateColumns={{ base: "1fr", md: "minmax(0, 1.1fr) minmax(0, 1fr)" }}
        gap={{ base: 12, md: 16 }}
        alignItems="center"
        maxW="6xl"
        mx="auto"
      >
        {/* Left side: Copy */}
        <Stack spacing={6}>
          <Text
            fontSize="sm"
            letterSpacing="0.18em"
            textTransform="uppercase"
            color="accent.300"
          >
            Your AI wellness mirror
          </Text>

          <Heading
            as="h1"
            size={{ base: "xl", md: "2xl" }}
            fontWeight="800"
            lineHeight="1.1"
          >
            Got Health?{" "}
            <Box as="span" color="accent.400">
              Unlock your wellness today.
            </Box>
          </Heading>

          <Text
            fontSize={{ base: "md", md: "lg" }}
            maxW="lg"
            color="whiteAlpha.800"
          >
            In a world where healthcare feels distant and opaque, VeeVee&apos;s
            purpose is to unleash the best version of you. Because when you
            understand what&apos;s happening within, you can act on what truly
            matters. VeeVee reveals your covered benefits, perks, wellness
            products, and everyday health support. Your health can&apos;t wait.
          </Text>

          <Stack spacing={3}>
            <Button
              as="a"
              href="https://veevee.io/"
              size="lg"
              borderRadius="full"
              fontWeight="700"
              px={10}
              boxShadow="0 0 40px rgba(0, 245, 160, 0.45)"
            >
              Start at VeeVee.io
            </Button>

            <Text fontSize="sm" color="whiteAlpha.600">
              Invited by SWCA • HIPAA-aligned • Encrypted
            </Text>
          </Stack>
        </Stack>

        {/* Right side: Hero card with logo + image */}
        <Box
          position="relative"
          bg="rgba(10, 14, 32, 0.95)"
          borderRadius="2xl"
          overflow="hidden"
          borderWidth="1px"
          borderColor="whiteAlpha.200"
          boxShadow="0 0 60px rgba(0,0,0,0.8)"
        >
          {/* Logo strip */}
          <Box
            display="flex"
            alignItems="center"
            gap={3}
            px={4}
            py={3}
            bg="rgba(7, 11, 31, 0.98)"
            borderBottomWidth="1px"
            borderColor="whiteAlpha.200"
          >
            <Image
              src="/logo.png"
              alt="VeeVee Logo"
              boxSize="40px"
              objectFit="contain"
            />
            <Box>
              <Text fontWeight="700" fontSize="md">
                VeeVee
              </Text>
              <Text fontSize="xs" color="whiteAlpha.600">
                Your AI wellness guide
              </Text>
            </Box>
          </Box>

          {/* Hero image */}
          <Image
            src="/hero-image.jpg"
            alt="Patient talking with doctor using VeeVee"
            objectFit="cover"
            maxH="420px"
            w="100%"
          />
        </Box>
      </Grid>

      {/* Payor credibility pill */}
      <Box
        mt={{ base: 10, md: 14 }}
        maxW="6xl"
        mx="auto"
        px={{ base: 4, md: 6 }}
      >
        <Box
          borderRadius="full"
          bg="rgba(255,255,255,0.03)"
          border="1px solid rgba(255,255,255,0.12)"
          backdropFilter="blur(10px)"
          px={{ base: 4, md: 8 }}
          py={{ base: 4, md: 5 }}
        >
          <Text
            textAlign="center"
            fontSize="sm"
            color="whiteAlpha.800"
            mb={{ base: 3, md: 4 }}
          >
            Built for real people across real plans, from national insurers to
            employer coverage.
          </Text>

          <Box overflow="hidden">
            <Box
              // scrolling container
              display="inline-flex"
              alignItems="center"
              as="div"
              gap={{ base: 8, md: 10 }}
              animation={`${scrollLogos} 40s linear infinite`}
              // Duplicate logos for a seamless loop
            >
              {[...PAYOR_LOGOS, ...PAYOR_LOGOS].map((logo, idx) => (
                <HStack key={`${logo.alt}-${idx}`} spacing={2}>
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    h={{ base: "22px", md: "26px" }}
                    objectFit="contain"
                    opacity={0.65}
                    filter="grayscale(1)"
                    _hover={{ opacity: 0.95 }}
                    loading="lazy"
                  />
                </HStack>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
