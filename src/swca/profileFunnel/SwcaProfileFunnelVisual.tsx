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
import { trackCtaClick } from "../../analytics/trackCtaClick";
import { APP_LINKS } from "../../config/links";
import { trackSwcaCampaignEvent } from "../campaignEvents";

const NAVY = "#071A3A";
const ORANGE = "#F97316";
const CREAM = "#FFF9F0";
const SOFT_GRAY = "#687184";

const FEATURE_CARDS = [
  { label: "Profile", mobileLabel: "Profile", copy: "Your health at a glance", symbol: "P", color: "#F97316" },
  { label: "Symptoms", mobileLabel: "Signs", copy: "Understand what's going on", symbol: "S", color: "#F59E0B" },
  { label: "Goals", mobileLabel: "Goals", copy: "Set goals that matter to you", symbol: "G", color: "#22A06B" },
  { label: "Benefits", mobileLabel: "Benefits", copy: "See what you can gain", symbol: "B", color: "#0EA5E9" },
  { label: "Care Plan", mobileLabel: "Plan", copy: "Personalized next steps", symbol: "Plan", color: "#7C3AED" },
];

export default function SwcaProfileFunnelVisual() {
  const handleCtaClick = () => {
    trackCtaClick({
      ctaName: "swca_profile_funnel_create_health_twin_visual",
      ctaText: "Create My Health Twin",
      placement: "swca_profile_funnel_visual_hero",
      destinationType: "external",
      destinationUrl: APP_LINKS.external.authenticatedConsole,
    });
    trackSwcaCampaignEvent({
      eventName: "swca_profile_funnel_create_health_twin_visual",
      params: {
        placement: "swca_profile_funnel_visual_hero",
        funnel_variant: "visual",
      },
    });
  };

  return (
    <Box minH="100vh" bg={CREAM} color={NAVY} overflow="hidden">
      <Box position="absolute" inset={0} bg="linear-gradient(160deg, rgba(255,249,240,0.98), rgba(255,255,255,0.96) 52%, rgba(249,115,22,0.12))" />
      <Box position="relative" maxW="1160px" mx="auto" px={{ base: 5, md: 8 }} py={{ base: 4, md: 10 }}>
        <Flex align="center" gap={{ base: 3, md: 4 }} mb={{ base: 4, md: 9 }}>
          <Image
            src="/swca/spine-wellness-logo.png"
            alt="Spine and Wellness Centers of America"
            boxSize={{ base: "62px", md: "82px" }}
            objectFit="contain"
          />
          <Stack spacing={0}>
            <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight="900" lineHeight="1.05">
              SWCA recommends VeeVee
            </Text>
            <Text display={{ base: "none", md: "block" }} color={SOFT_GRAY} fontWeight="800">
              Create your free Health Twin
            </Text>
          </Stack>
        </Flex>

        <Flex
          direction={{ base: "column", lg: "row" }}
          align={{ base: "center", lg: "center" }}
          justify="space-between"
          gap={{ base: 4, md: 7, lg: 12 }}
        >
          <Stack
            spacing={{ base: 3, md: 7, lg: 8 }}
            align={{ base: "center", lg: "flex-start" }}
            textAlign={{ base: "center", lg: "left" }}
            flex="1"
            maxW={{ base: "780px", lg: "540px" }}
          >
            <Badge
              bg={NAVY}
              color="white"
              borderRadius="full"
              px={{ base: 5, md: 6 }}
              py={{ base: 2.5, md: 3 }}
              fontSize={{ base: "sm", md: "md" }}
              letterSpacing="0.04em"
            >
              Your Health Twin
            </Badge>

            <Stack spacing={{ base: 3, md: 4 }} align={{ base: "center", lg: "flex-start" }}>
              <Heading
                as="h1"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize={{ base: "50px", md: "8xl", lg: "7xl", xl: "8xl" }}
                lineHeight={{ base: "0.86", md: "0.84" }}
                letterSpacing="0"
                maxW={{ base: "390px", md: "780px", lg: "540px" }}
              >
                Create your digital twin.
              </Heading>
              <Text
                fontSize={{ base: "xl", md: "2xl" }}
                lineHeight="1.18"
                color={NAVY}
                maxW={{ base: "360px", md: "620px", lg: "500px" }}
                fontWeight="800"
              >
                Answer a few quick questions and VeeVee builds your personalized health profile.
              </Text>
            </Stack>

            <Button
              as="a"
              href={APP_LINKS.external.authenticatedConsole}
              onClick={handleCtaClick}
              bg={ORANGE}
              color="white"
              borderRadius="full"
              minH={{ base: "68px", md: "78px" }}
              w={{ base: "100%", md: "auto" }}
              minW={{ base: "100%", md: "560px", lg: "420px" }}
              maxW={{ base: "520px", md: "none" }}
              px={{ base: 8, md: 14, lg: 12 }}
              fontSize={{ base: "xl", md: "3xl", lg: "2xl", xl: "3xl" }}
              fontWeight="900"
              boxShadow="0 22px 46px rgba(249,115,22,0.34)"
              _hover={{ bg: "#EA580C", textDecoration: "none", transform: "translateY(-1px)" }}
            >
              Create My Health Twin
            </Button>

            <Text fontSize={{ base: "sm", md: "lg" }} color={SOFT_GRAY} fontWeight="900">
              Free to start. Takes less than a minute.
            </Text>
          </Stack>

          <Box flex="1" w="100%" maxW={{ base: "760px", lg: "560px", xl: "600px" }}>
            <HealthTwinPhoneVisual />
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}

function HealthTwinPhoneVisual() {
  return (
    <Box w="100%" maxW={{ base: "330px", md: "760px", lg: "600px" }} mx="auto" position="relative" minH={{ base: "292px", md: "520px", lg: "500px" }}>
      <FeatureOrbit />
      <Box
        position="absolute"
        left="50%"
        top={{ base: "6px", md: "4px" }}
        transform="translateX(-50%)"
        w={{ base: "160px", md: "270px", lg: "250px", xl: "270px" }}
        h={{ base: "284px", md: "480px", lg: "444px", xl: "480px" }}
        borderRadius={{ base: "28px", md: "34px" }}
        bg="#151922"
        p={{ base: "8px", md: "10px" }}
        boxShadow="0 30px 70px rgba(7,26,58,0.22)"
        zIndex={2}
      >
        <Box position="absolute" top="10px" left="50%" transform="translateX(-50%)" w="88px" h="20px" bg="#151922" borderBottomRadius="16px" zIndex={3} />
        <Box h="100%" borderRadius="26px" bg="linear-gradient(180deg, #FFF7EC, #FFFFFF)" overflow="hidden" position="relative">
          <Image
            src="/images/marketing/hero-avatar-b.png"
            alt=""
            position="absolute"
            top={{ base: "34px", md: "62px" }}
            left="50%"
            transform="translateX(-50%)"
            h={{ base: "184px", md: "310px" }}
            w="auto"
            objectFit="contain"
          />
          <Box position="absolute" inset={{ base: "54px 22px auto", md: "88px 34px auto" }} h={{ base: "104px", md: "190px" }} border="2px solid rgba(255,255,255,0.86)" borderRadius="full" />
          <Stack position="absolute" left={{ base: 4, md: 6 }} right={{ base: 4, md: 6 }} bottom={{ base: 4, md: 6 }} spacing={{ base: 2, md: 2.5 }}>
            <Box bg="rgba(255,255,255,0.92)" borderRadius="12px" p={{ base: 2, md: 3 }} boxShadow="0 8px 24px rgba(7,26,58,0.12)">
              <Flex align="center" justify="space-between">
                <Stack spacing={0} align="flex-start">
                  <Text fontSize="xs" color="#44506A" fontWeight="800">Health Score</Text>
                  <Text fontSize={{ base: "2xl", md: "3xl" }} lineHeight="1" fontWeight="900">85<Text as="span" fontSize="sm" color="#44506A">/100</Text></Text>
                  <Text fontSize="xs" color="#168A52" fontWeight="900">Excellent</Text>
                </Stack>
                <Box boxSize={{ base: "42px", md: "54px" }} borderRadius="full" border={{ base: "7px solid #29A05E", md: "9px solid #29A05E" }} borderLeftColor="#D8EDE0" />
              </Flex>
            </Box>
            <Flex align="center" gap={{ base: 2, md: 3 }} bg="rgba(255,255,255,0.92)" borderRadius="12px" p={{ base: 2, md: 3 }} boxShadow="0 8px 24px rgba(7,26,58,0.12)">
              <Flex boxSize={{ base: "30px", md: "38px" }} borderRadius="full" bg={NAVY} color="white" align="center" justify="center" fontWeight="900">
                +
              </Flex>
              <Stack spacing={0} align="flex-start" flex="1">
                <Text fontSize="xs" color="#44506A" fontWeight="800">Top Priority</Text>
                <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="900">Improve sleep quality</Text>
              </Stack>
              <Text fontSize="xl" color="#44506A">{">"}</Text>
            </Flex>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

function FeatureOrbit() {
  return (
    <SimpleGrid columns={2} spacing={{ base: 3, md: 6 }} position="absolute" inset={0} alignItems="center">
      <Stack spacing={{ base: 4, md: 7 }} align="flex-start" justify="center">
        {FEATURE_CARDS.slice(0, 3).map((card) => (
          <FeatureCard key={card.label} {...card} />
        ))}
      </Stack>
      <Stack spacing={{ base: 7, md: 12 }} align="flex-end" justify="center" pt={{ base: 11, md: 16 }}>
        {FEATURE_CARDS.slice(3).map((card) => (
          <FeatureCard key={card.label} {...card} />
        ))}
      </Stack>
    </SimpleGrid>
  );
}

function FeatureCard({
  label,
  mobileLabel,
  copy,
  symbol,
  color,
}: {
  label: string;
  mobileLabel: string;
  copy: string;
  symbol: string;
  color: string;
}) {
  return (
    <Flex
      align="center"
      gap={{ base: 2, md: 3 }}
      bg="rgba(255,255,255,0.92)"
      borderRadius={{ base: "12px", md: "14px" }}
      p={{ base: 1.5, md: 4 }}
      w={{ base: "96px", md: "190px" }}
      minH={{ base: "46px", md: "88px" }}
      boxShadow={{ base: "0 10px 22px rgba(7,26,58,0.1)", md: "0 14px 34px rgba(7,26,58,0.12)" }}
      border="1px solid rgba(7,26,58,0.06)"
    >
      <Flex
        boxSize={{ base: "30px", md: "54px" }}
        borderRadius="full"
        bg={`${color}1F`}
        color={color}
        align="center"
        justify="center"
        flex="0 0 auto"
      >
        <Text fontSize={{ base: "13px", md: "28px" }} lineHeight="1" fontWeight="900">
          {symbol}
        </Text>
      </Flex>
      <Stack spacing={0} align="flex-start" textAlign="left">
        <Text display={{ base: "block", md: "none" }} fontSize="11px" lineHeight="1.05" fontWeight="900">
          {mobileLabel}
        </Text>
        <Text display={{ base: "none", md: "block" }} fontSize="md" lineHeight="1.05" fontWeight="900">
          {label}
        </Text>
        <Text display={{ base: "none", md: "block" }} fontSize="sm" lineHeight="1.1" color="#35405A" fontWeight="700">
          {copy}
        </Text>
      </Stack>
    </Flex>
  );
}
