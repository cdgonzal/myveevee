// src/pages/Home.tsx
import { Box, Button, Heading, Stack, Text, Image, Grid } from "@chakra-ui/react";

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
            Your AI Wellness Mirror
          </Text>

          <Heading
            as="h1"
            size={{ base: "xl", md: "2xl" }}
            fontWeight="800"
            lineHeight="1.1"
          >
            Got Health?{" "}
            <Box as="span" color="accent.400">
              See What&apos;s Already Covered.
            </Box>
          </Heading>

          <Text fontSize={{ base: "md", md: "lg" }} maxW="lg" color="whiteAlpha.800">
            VeeVee reads your health benefits, surfaces what matters, and helps you
            use the care you already have. Private, secure, and trusted by doctors
            and clinics.
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
              src="/veevee-logo-neon.png" // put your neon logo file into /public with this name
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
    </Box>
  );
}
