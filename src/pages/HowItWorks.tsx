import { Box, Button, Heading, SimpleGrid, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import { Link as CLink } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { trackCtaClick } from "../analytics/trackCtaClick";
import { APP_LINKS } from "../config/links";
import { PATIENT_STEPS } from "./marketingContent";

export default function HowItWorks() {
  const pageGradient = useColorModeValue(
    "linear(to-b, #FFFFFF, #9CE7FF)",
    "linear(to-b, surface.900, surface.800)"
  );
  const border = useColorModeValue("border.default", "border.default");
  const muted = useColorModeValue("text.muted", "text.muted");
  const panelBg = useColorModeValue("rgba(255, 255, 255, 0.82)", "rgba(6, 37, 76, 0.70)");
  const cardBg = useColorModeValue("bg.surface", "surface.800");
  const stepCircleColor = "white";
  const freeAccent = useColorModeValue("#001A52", "#9CE7FF");

  return (
    <Box as="main" minH="100vh" bgGradient={pageGradient} color="text.primary" py={{ base: 10, md: 20 }}>
      <Stack spacing={{ base: 8, md: 12 }} maxW="6xl" mx="auto" px={{ base: 6, md: 10 }}>
        <Box borderWidth="1px" borderColor={border} borderRadius="3xl" bg={panelBg} boxShadow="0 24px 50px rgba(6, 37, 76, 0.12)" p={{ base: 6, md: 8 }}>
          <Stack spacing={4}>
            <Text fontSize="sm" letterSpacing="0.18em" textTransform="uppercase" color="accent.soft">
              HOW IT WORKS
            </Text>
            <Heading as="h1" size={{ base: "lg", md: "xl" }} fontWeight="800">
              Your health questions answered in 3 simple steps.
            </Heading>
            <Text color={muted} maxW="3xl" fontSize={{ base: "md", md: "lg" }}>
              Start <Box as="span" fontWeight="800" color={freeAccent}>free</Box>. Tell VeeVee what is going on and get calm, clear next steps.
            </Text>
          </Stack>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 4, md: 6 }}>
          {PATIENT_STEPS.map((step) => (
            <Box
              key={step.number}
              bg={cardBg}
              borderRadius="2xl"
              borderWidth="1px"
              borderColor={border}
              boxShadow="0 10px 24px rgba(6, 37, 76, 0.10)"
              p={5}
            >
              <Box
                w={14}
                h={14}
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="800"
                fontSize="2xl"
                bg="accent.primary"
                color={stepCircleColor}
                border="2px solid"
                borderColor="white"
                boxShadow="0 0 0 2px rgba(0, 26, 82, 0.32)"
                mb={3}
              >
                {step.number}
              </Box>
              <Heading as="h2" size="sm" mb={2} color="accent.soft">
                {step.title}
              </Heading>
              <Text fontSize="sm" color="text.primary">
                {step.detail.split(/(free|Free)/g).map((part, index) =>
                  part.toLowerCase() === "free" ? (
                    <Box as="span" key={`${step.number}-free-${index}`} fontWeight="800" color={freeAccent}>
                      {part}
                    </Box>
                  ) : (
                    <Box as="span" key={`${step.number}-${index}`}>
                      {part}
                    </Box>
                  )
                )}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        <Box borderWidth="1px" borderColor={border} borderRadius="2xl" bg={panelBg} p={{ base: 6, md: 8 }}>
          <Stack spacing={4} textAlign="center">
            <Heading as="h2" size="md">
              Curious what happens next?
            </Heading>
            <Text fontSize="sm" color={muted} maxW="2xl" mx="auto">
              Try a free health scenario and see how VeeVee responds before you create an account.
            </Text>
            <Button
              as={RouterLink}
              to={APP_LINKS.internal.simulator}
              onClick={() =>
                trackCtaClick({
                  ctaName: "how_it_works_try_it_free",
                  ctaText: "Try it free",
                  placement: "how_it_works_bottom_cta",
                  destinationType: "internal",
                  destinationUrl: APP_LINKS.internal.simulator,
                  pagePath: APP_LINKS.internal.howItWorks,
                })
              }
              size="md"
              borderRadius="full"
              fontWeight="700"
              px={8}
              alignSelf="center"
              boxShadow="0 0 28px rgba(17, 119, 186, 0.35)"
            >
              Try it free
            </Button>
            <CLink
              href={APP_LINKS.external.authenticatedConsole}
              isExternal
              onClick={() =>
                trackCtaClick({
                  ctaName: "how_it_works_login",
                  ctaText: "Already have an account? Log in",
                  placement: "how_it_works_bottom_cta",
                  destinationType: "external",
                  destinationUrl: APP_LINKS.external.authenticatedConsole,
                  pagePath: APP_LINKS.internal.howItWorks,
                })
              }
              color="accent.soft"
              fontSize="sm"
              fontWeight="600"
              textDecoration="underline"
            >
              Already have an account? Log in
            </CLink>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
