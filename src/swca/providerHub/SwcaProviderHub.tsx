import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Image,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { trackCtaClick } from "../../analytics/trackCtaClick";
import { APP_LINKS } from "../../config/links";
import { trackSwcaCampaignEvent } from "../campaignEvents";

const NAVY = "#071A3A";
const ORANGE = "#F47B20";
const CREAM = "#FFF9EF";
const LINE = "rgba(7,26,58,0.12)";

const actions = [
  {
    title: "Claim a reward",
    body: "Start here to unlock your SWCA reward.",
    cta: "Claim a reward",
    to: APP_LINKS.internal.swcaRewards,
    eventName: "swca_hub_claim_reward",
    destinationType: "internal",
  },
  {
    title: "Share your interests",
    body: "Answer a few quick questions so SWCA can understand what you may want next.",
    cta: "Share interests",
    to: APP_LINKS.internal.swcaIntake,
    eventName: "swca_hub_start_interest",
    destinationType: "internal",
  },
  {
    title: "Make your Health Twin",
    body: "Create your own Health Twin in seconds. Free and personalized.",
    cta: "Make your twin now",
    to: APP_LINKS.external.authenticatedConsole,
    eventName: "swca_hub_make_health_twin",
    destinationType: "external",
  },
] as const;

export default function SwcaProviderHub() {
  const trackAction = (action: (typeof actions)[number]) => {
    trackCtaClick({
      ctaName: action.eventName,
      ctaText: action.cta,
      placement: "swca_provider_hub",
      destinationType: action.destinationType,
      destinationUrl: action.to,
    });
    trackSwcaCampaignEvent({
      eventName: action.eventName,
      pagePath: APP_LINKS.internal.swcaHub,
      params: {
        destination: action.to,
      },
    });
  };

  return (
    <Box minH="100vh" bg={CREAM} color={NAVY}>
      <Box maxW="1080px" mx="auto" px={{ base: 5, md: 8 }} py={{ base: 7, md: 10 }}>
        <Flex align="center" justify="space-between" gap={5} mb={{ base: 9, md: 12 }}>
          <Flex align="center" gap={3}>
            <Image
              src="/swca/spine-wellness-logo.png"
              alt="Spine and Wellness Centers of America"
              boxSize={{ base: "64px", md: "84px" }}
              objectFit="contain"
            />
            <Stack spacing={0}>
              <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="900" letterSpacing="0.12em" textTransform="uppercase">
                Spine and Wellness Centers of America
              </Text>
              <Text fontSize={{ base: "sm", md: "md" }} color="#566071" fontWeight="700">
                Florida care network | Spine, wellness, and recovery
              </Text>
            </Stack>
          </Flex>

          <Badge
            display={{ base: "none", sm: "inline-flex" }}
            bg="white"
            color={NAVY}
            border="1px solid"
            borderColor={LINE}
            borderRadius="full"
            px={4}
            py={2}
            fontSize="sm"
            boxShadow="0 10px 24px rgba(7,26,58,0.08)"
          >
            VeeVee network provider
          </Badge>
        </Flex>

        <Stack spacing={{ base: 8, md: 10 }}>
          <Stack spacing={5} maxW="860px">
            <Badge alignSelf="flex-start" bg={NAVY} color="white" borderRadius="full" px={4} py={2} fontSize="sm" letterSpacing="0.08em">
              Provider hub
            </Badge>
            <Heading
              as="h1"
              fontFamily="Georgia, 'Times New Roman', serif"
              fontSize={{ base: "4xl", md: "5xl" }}
              lineHeight="0.96"
              letterSpacing="0"
            >
              SWCA and VeeVee help you discover rewards and next steps.
            </Heading>
            <Text fontSize={{ base: "lg", md: "xl" }} color="#303A50" lineHeight="1.5" maxW="760px">
              Choose a path below. No private medical details needed here.
            </Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {actions.map((action) => {
              return (
                <Flex
                  key={action.title}
                  direction="column"
                  justify="space-between"
                  gap={5}
                  bg="white"
                  border="1px solid"
                  borderColor={LINE}
                  borderRadius="8px"
                  p={{ base: 5, md: 6 }}
                  boxShadow="0 18px 40px rgba(7,26,58,0.08)"
                  minH="230px"
                >
                  <Stack spacing={3}>
                    <Heading as="h2" fontSize={{ base: "xl", md: "2xl" }} lineHeight="1.1" letterSpacing="0">
                      {action.title}
                    </Heading>
                    <Text color="#566071" lineHeight="1.5">
                      {action.body}
                    </Text>
                  </Stack>
                  {action.destinationType === "external" ? (
                    <Button
                      as="a"
                      href={action.to}
                      alignSelf="flex-start"
                      bg={NAVY}
                      color="white"
                      borderRadius="full"
                      px={6}
                      minH="48px"
                      fontWeight="900"
                      _hover={{ bg: "#102A55", textDecoration: "none", transform: "translateY(-1px)" }}
                      _active={{ transform: "translateY(1px)" }}
                      onClick={() => trackAction(action)}
                    >
                      {action.cta}
                    </Button>
                  ) : (
                    <Button
                      as={RouterLink}
                      to={action.to}
                      alignSelf="flex-start"
                      bg={action.title === "Claim a reward" ? ORANGE : NAVY}
                      color="white"
                      borderRadius="full"
                      px={6}
                      minH="48px"
                      fontWeight="900"
                      _hover={{
                        bg: action.title === "Claim a reward" ? "#D96712" : "#102A55",
                        textDecoration: "none",
                        transform: "translateY(-1px)",
                      }}
                      _active={{ transform: "translateY(1px)" }}
                      onClick={() => trackAction(action)}
                    >
                      {action.cta}
                    </Button>
                  )}
                </Flex>
              );
            })}
          </SimpleGrid>

          <Box bg="white" border="1px solid" borderColor={LINE} borderRadius="8px" overflow="hidden" boxShadow="0 18px 40px rgba(7,26,58,0.08)">
            <Stack spacing={0}>
              <Box px={{ base: 5, md: 7 }} pt={{ base: 5, md: 6 }} pb={4}>
                <Heading as="h2" fontSize={{ base: "xl", md: "2xl" }} letterSpacing="0">
                  About the provider
                </Heading>
                <Text mt={2} color="#566071" maxW="620px">
                  Clinic-provided team overview.
                </Text>
              </Box>
              <Image
                src="/swca/provider-trust-profile.webp"
                alt="Spine and Wellness Centers of America physician team overview"
                w="100%"
                maxH={{ base: "520px", md: "760px" }}
                objectFit="contain"
                bg="#F2F0ED"
              />
            </Stack>
          </Box>

          <Text fontSize="xs" color="#6A7280" textAlign="center">
            SWCA manages eligibility, rewards, and clinical services. VeeVee helps power the digital experience.
          </Text>
        </Stack>
      </Box>
    </Box>
  );
}
