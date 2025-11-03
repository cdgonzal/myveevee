// src/pages/Home.tsx
import { Box, Button, Heading, Stack, Text, Image, Grid } from "@chakra-ui/react";

export default function Home() {
  return (
    <Box
      bg="white"
      color="#333"
      textAlign="left"
      py={{ base: 10, md: 16 }}
      px={{ base: 6, md: 10 }}
    >
      <Grid
        templateColumns={{ base: "1fr", md: "1fr 1fr" }}
        gap={10}
        alignItems="center"
        maxW="6xl"
        mx="auto"
      >
        {/* Left side: Copy */}
        <Stack spacing={5}>
          <Heading
            as="h1"
            size={{ base: "xl", md: "2xl" }}
            fontWeight="800"
            lineHeight="1.1"
          >
            Got Health? See What’s Already Covered.
          </Heading>

          <Text fontSize={{ base: "md", md: "lg" }} maxW="lg">
            VeeVee reveals your covered benefits and answers questions about your plan—
            invited by your doctor, private and secure.
          </Text>

          <Stack spacing={2}>
            <Button
              as="a"
              href="https://veevee.io/"
              bg="#4FC3F7"
              color="white"
              size="lg"
              borderRadius="xl"
              fontWeight="700"
              _hover={{ bg: "#29B6F6" }}
              _active={{ bg: "#0288D1" }}
            >
              Start at VeeVee.io
            </Button>

            <Text fontSize="sm" color="gray.600">
              Invited by your clinic • HIPAA-aligned • Encrypted
            </Text>
          </Stack>
        </Stack>

        {/* Right side: Hero image */}
        <Box>
          <Image
            src="/og-image.jpg"
            alt="Patient using VeeVee wellness platform"
            borderRadius="xl"
            border="1px solid"
            borderColor="#81D4FA"
            boxShadow="md"
          />
        </Box>
      </Grid>
    </Box>
  );
}
