// File: src/pages/Home.tsx
// Version: 1.5 (2025-12-07)
// This version keeps the hero the same and simplifies the payor strip:
//   - Bigger pill
//   - Larger logos
//   - No scrolling animation (static, always-visible logos)

import {
  Box,
  Button,
  Heading,
  Stack,
  Text,
  Image,
  Grid,
  HStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";


// Normalized payor logos (from public/payors/normalized)
const PAYOR_LOGOS = [
  { src: "/payors/normalized/united.png", alt: "UnitedHealthcare" },
  { src: "/payors/normalized/cigna.png", alt: "Cigna" },
  { src: "/payors/normalized/humana99.png", alt: "Humana" },
  { src: "/payors/normalized/aetna2.png", alt: "Aetna" },
  { src: "/payors/normalized/elevance2.png", alt: "Elevance" },
  { src: "/payors/normalized/florida2.png", alt: "Florida Blue" },
  { src: "/payors/normalized/kaiser44.png", alt: "Kaiser Permanente" },
  { src: "/payors/normalized/centene.png", alt: "Centene" },
  { src: "/payors/normalized/molina3.png", alt: "Molina Healthcare" },
  { src: "/payors/normalized/medicare1.png", alt: "Medicare" },
  { src: "/payors/normalized/cvs.png", alt: "CVS" },
].filter((logo) => !!logo.src);

// Horizontal marquee animation for the payor logos
const scrollLogos = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;


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
          bg="rgba(5, 8, 22, 0.96)"
          border="1px solid rgba(0, 245, 160, 0.5)"
          boxShadow="0 0 36px rgba(0, 245, 160, 0.35)"
          backdropFilter="blur(12px)"
          px={{ base: 6, md: 10 }}
          py={{ base: 6, md: 7 }}
        >
          <Text
            textAlign="center"
            fontSize={{ base: "sm", md: "md" }}
            color="whiteAlpha.900"
            mb={{ base: 4, md: 5 }}
          >
            Built for real people across real plans, from national insurers to
            employer coverage.
          </Text>

          {/* Single-row marquee of normalized logos */}
          <Box overflow="hidden">
            <Box
              as="div"
              display="inline-flex"
              alignItems="center"
              animation={`${scrollLogos} 53s linear infinite`}
              opacity={0.85}
              // gap between each logo frame
              columnGap={{ base: 16, md: 20 }}
            >
              {[...PAYOR_LOGOS, ...PAYOR_LOGOS].map((logo, idx) => (
                <Box
                  key={`${logo.alt}-${idx}`}
                  minW={{ base: "90px", md: "110px" }}
                  maxW={{ base: "110px", md: "130px" }}
                  h={{ base: "32px", md: "36px" }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    maxH="100%"
                    maxW="100%"
                    objectFit="contain"
                    opacity={0.9}
                    filter="grayscale(1) brightness(1.6) contrast(1.2)"
                    _hover={{ opacity: 1 }}
                    loading="lazy"
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
