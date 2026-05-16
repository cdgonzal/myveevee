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
    body: "Start the reward path and unlock the next step.",
    cta: "Claim a reward",
    to: APP_LINKS.internal.swcaRewards,
    eventName: "swca_hub_claim_reward",
  },
  {
    title: "Tell us what you're interested in",
    body: "Share general interests so the clinic can understand what offers or services may fit.",
    cta: "Share interests",
    to: APP_LINKS.internal.swcaIntake,
    eventName: "swca_hub_start_interest",
  },
  {
    title: "Learn about services",
    body: "Review broad service categories before choosing a next step.",
    cta: "View services",
    to: "#services",
    eventName: "swca_hub_view_services",
  },
];

const serviceCategories = [
  "Wellness and prevention",
  "Spine and joint support",
  "Recovery and mobility",
  "Weight and metabolic wellness",
  "Energy, sleep, and stress support",
  "Longevity and performance goals",
];

export default function SwcaProviderHub() {
  const trackAction = (action: (typeof actions)[number]) => {
    trackCtaClick({
      ctaName: action.eventName,
      ctaText: action.cta,
      placement: "swca_provider_hub",
      destinationType: "internal",
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
              fontSize={{ base: "4xl", md: "6xl" }}
              lineHeight="0.96"
              letterSpacing="0"
            >
              Spine and Wellness Centers of America partners with VeeVee to help patients discover rewards, services, and care options.
            </Heading>
            <Text fontSize={{ base: "lg", md: "xl" }} color="#303A50" lineHeight="1.5" maxW="760px">
              This provider is part of the VeeVee network. Choose a public path below to claim a reward, share general interests, or review service categories.
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
                <Text mt={2} color="#566071" maxW="760px">
                  This overview was provided by Spine and Wellness Centers of America.
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

          <Box id="services" bg="rgba(255,255,255,0.72)" border="1px solid" borderColor={LINE} borderRadius="8px" p={{ base: 5, md: 7 }}>
            <Stack spacing={4}>
              <Stack spacing={2}>
                <Heading as="h2" fontSize={{ base: "2xl", md: "3xl" }} letterSpacing="0">
                  Service categories
                </Heading>
                <Text color="#566071" maxW="760px">
                  These are general service areas only. This page does not collect private medical details or provide treatment recommendations.
                </Text>
              </Stack>
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={3}>
                {serviceCategories.map((category) => (
                  <Box key={category} bg="white" border="1px solid" borderColor={LINE} borderRadius="8px" px={4} py={3} fontWeight="800">
                    {category}
                  </Box>
                ))}
              </SimpleGrid>
            </Stack>
          </Box>

          <Box bg="white" border="1px solid" borderColor={LINE} borderRadius="8px" p={{ base: 5, md: 6 }}>
            <Stack spacing={2}>
              <Heading as="h2" fontSize={{ base: "xl", md: "2xl" }} letterSpacing="0">
                How VeeVee helps
              </Heading>
              <Text color="#566071" lineHeight="1.55">
                VeeVee helps participating providers collect general interest information and connect people with relevant offers, services, and next steps.
              </Text>
            </Stack>
          </Box>

          <Text fontSize="xs" color="#6A7280" textAlign="center">
            Spine and Wellness Centers of America manages eligibility, rewards, and clinical services.
          </Text>
        </Stack>
      </Box>
    </Box>
  );
}
