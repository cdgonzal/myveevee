import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Image,
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
const providerCampaign = {
  providerName: "Spine and Wellness Centers of America",
  providerShortName: "SWCA",
  logoSrc: "/swca/spine-wellness-logo.png",
  primaryColor: ORANGE,
  secondaryColor: NAVY,
  accentColor: "#FFC247",
  rewardCategory: "wellness",
  intakePath: APP_LINKS.internal.swcaIntake,
};

export default function SwcaRewardsTeaser() {
  return (
    <Box minH="100vh" bg={CREAM} color={providerCampaign.secondaryColor}>
      <Box maxW="1040px" mx="auto" px={{ base: 5, md: 8 }} py={{ base: 5, md: 10 }}>
        <Flex align="center" justify="space-between" gap={5} mb={{ base: 5, md: 12 }}>
          <Flex align="center" gap={3}>
            <Image
              src={providerCampaign.logoSrc}
              alt={providerCampaign.providerName}
              boxSize={{ base: "52px", md: "86px" }}
              objectFit="contain"
            />
            <Stack spacing={0}>
              <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="900" letterSpacing="0.12em" textTransform="uppercase">
                <Box as="span" display={{ base: "none", md: "inline" }}>
                  {providerCampaign.providerName}
                </Box>
                <Box as="span" display={{ base: "inline", md: "none" }}>
                  {providerCampaign.providerShortName} Rewards
                </Box>
              </Text>
              <Text fontSize={{ base: "sm", md: "md" }} fontWeight="700" color="#566071">
                Rewards powered by VeeVee
              </Text>
            </Stack>
          </Flex>

          <Badge
            display={{ base: "none", sm: "inline-flex" }}
            bg="white"
            color={NAVY}
            border="1px solid"
            borderColor="rgba(7,26,58,0.16)"
            borderRadius="full"
            px={4}
            py={2}
            fontSize="sm"
            boxShadow="0 10px 24px rgba(7,26,58,0.08)"
          >
            Provider reward
          </Badge>
        </Flex>

        <Flex
          align="center"
          justify="center"
          direction={{ base: "column", lg: "row" }}
          gap={{ base: 5, lg: 12 }}
          minH={{ base: "calc(100dvh - 116px)", md: "64vh" }}
        >
          <Stack spacing={{ base: 5, md: 7 }} align={{ base: "center", lg: "flex-start" }} textAlign={{ base: "center", lg: "left" }} flex="1">
            <Stack spacing={{ base: 3, md: 4 }} align={{ base: "center", lg: "flex-start" }}>
              <Badge
                bg={providerCampaign.secondaryColor}
                color="white"
                borderRadius="full"
                px={{ base: 3, md: 4 }}
                py={{ base: 1.5, md: 2 }}
                fontSize={{ base: "xs", md: "sm" }}
                letterSpacing="0.08em"
              >
                {providerCampaign.providerShortName} Rewards
              </Badge>
              <Heading
                as="h1"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize={{ base: "4xl", md: "7xl" }}
                lineHeight={{ base: "0.98", md: "0.92" }}
                letterSpacing="0"
                maxW="760px"
              >
                Unlock your {providerCampaign.rewardCategory} reward.
              </Heading>
              <Text fontSize={{ base: "lg", md: "2xl" }} lineHeight="1.35" color="#24314D" maxW={{ base: "340px", md: "680px" }} fontWeight="700">
                <Box as="span" display={{ base: "none", md: "inline" }}>
                  Answer a few quick questions so {providerCampaign.providerName} can match you with available rewards, offers, or services.
                </Box>
                <Box as="span" display={{ base: "inline", md: "none" }}>
                  Answer a few quick questions to unlock your prize.
                </Box>
              </Text>
            </Stack>

            <Stack spacing={3} align={{ base: "center", lg: "flex-start" }} w="100%">
              <Button
                as={RouterLink}
                to={providerCampaign.intakePath}
                size="lg"
                bg={providerCampaign.primaryColor}
                color="white"
                borderRadius="full"
                px={{ base: 8, md: 12 }}
                minH={{ base: "64px", md: "70px" }}
                minW={{ base: "100%", sm: "300px" }}
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight="900"
                _hover={{ bg: "#D96712", textDecoration: "none", transform: "translateY(-2px)" }}
                _active={{ transform: "translateY(1px)" }}
                boxShadow="0 22px 44px rgba(244,123,32,0.32)"
                onClick={() => {
                  trackCtaClick({
                    ctaName: "swca_rewards_start_intake",
                    ctaText: "Start now",
                    placement: "swca_rewards_teaser_hero",
                    destinationType: "internal",
                    destinationUrl: providerCampaign.intakePath,
                  });
                  trackSwcaCampaignEvent({
                    eventName: "swca_rewards_start_intake",
                    params: {
                      placement: "swca_rewards_teaser_hero",
                    },
                  });
                }}
              >
                Start now
              </Button>
              <Text fontSize={{ base: "sm", md: "md" }} color="#5F6878" fontWeight="700">
                Takes about one minute.
              </Text>
              <Text display={{ base: "block", md: "none" }} fontSize="xs" color="#6A7280" fontWeight="700">
                General interest only. Rewards managed by SWCA.
              </Text>
            </Stack>
          </Stack>

          <Flex display={{ base: "none", md: "flex" }} flex="0 1 360px" align="center" justify="center" w="100%">
            <Box
              position="relative"
              boxSize={{ base: "250px", sm: "300px", md: "340px" }}
              borderRadius="full"
              bg={`conic-gradient(from -18deg, ${providerCampaign.primaryColor} 0deg 45deg, #FFFFFF 45deg 90deg, ${providerCampaign.secondaryColor} 90deg 135deg, ${providerCampaign.accentColor} 135deg 180deg, ${providerCampaign.primaryColor} 180deg 225deg, #FFFFFF 225deg 270deg, ${providerCampaign.secondaryColor} 270deg 315deg, ${providerCampaign.accentColor} 315deg 360deg)`}
              border="10px solid white"
              boxShadow="0 28px 70px rgba(7,26,58,0.2)"
              aria-hidden="true"
            >
              <Box position="absolute" top="-14px" left="50%" transform="translateX(-50%)" w="0" h="0" borderLeft="14px solid transparent" borderRight="14px solid transparent" borderTop={`26px solid ${providerCampaign.secondaryColor}`} />
              <Flex
                position="absolute"
                inset="29%"
                align="center"
                justify="center"
                borderRadius="full"
                bg="white"
                border="6px solid"
                borderColor={CREAM}
                boxShadow="inset 0 0 0 1px rgba(7,26,58,0.08)"
              >
                <Text fontWeight="900" color={providerCampaign.secondaryColor} fontSize={{ base: "lg", md: "xl" }}>
                  REWARD
                </Text>
              </Flex>
            </Box>
          </Flex>
        </Flex>

        <Stack display={{ base: "none", md: "flex" }} spacing={1} mt={{ base: 9, md: 10 }} align="center" textAlign="center">
          <Text fontSize={{ base: "sm", md: "md" }} color="#4F596B" fontWeight="700">
            General interest form only. Please do not enter private medical details.
          </Text>
          <Text fontSize="xs" color="#6A7280">
            Rewards and eligibility are managed by {providerCampaign.providerName}.
          </Text>
        </Stack>
      </Box>
    </Box>
  );
}
