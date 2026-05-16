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
      <Box maxW="1040px" mx="auto" px={{ base: 6, md: 8 }} py={{ base: 7, md: 10 }}>
        <Flex align="center" justify="space-between" gap={5} mb={{ base: 9, md: 12 }}>
          <Flex align="center" gap={3}>
            <Image
              src={providerCampaign.logoSrc}
              alt={providerCampaign.providerName}
              boxSize={{ base: "76px", md: "86px" }}
              objectFit="contain"
            />
            <Stack spacing={0}>
              <Text
                fontSize={{ base: "2xl", md: "sm" }}
                fontWeight="900"
                letterSpacing={{ base: "0", md: "0.12em" }}
                lineHeight="1"
                textTransform={{ base: "none", md: "uppercase" }}
              >
                <Box as="span" display={{ base: "none", md: "inline" }}>
                  {providerCampaign.providerName}
                </Box>
                <Box as="span" display={{ base: "inline", md: "none" }}>
                  {providerCampaign.providerShortName} Rewards
                </Box>
              </Text>
              <Text fontSize={{ base: "xl", md: "md" }} fontWeight="800" color="#5D6574" lineHeight="1.15">
                <Box as="span" display={{ base: "none", md: "inline" }}>
                  Rewards powered by VeeVee
                </Box>
                <Box as="span" display={{ base: "inline", md: "none" }}>
                  Powered by VeeVee
                </Box>
              </Text>
            </Stack>
          </Flex>

          <Badge
            display={{ base: "none", md: "inline-flex" }}
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
          gap={{ base: 7, lg: 12 }}
          minH={{ base: "auto", md: "64vh" }}
        >
          <Stack spacing={{ base: 7, md: 7 }} align={{ base: "center", lg: "flex-start" }} textAlign={{ base: "center", lg: "left" }} flex="1" w="100%">
            <Stack spacing={{ base: 5, md: 4 }} align={{ base: "center", lg: "flex-start" }} w="100%">
              <Badge
                bg={providerCampaign.secondaryColor}
                color="white"
                borderRadius="full"
                px={{ base: 7, md: 4 }}
                py={{ base: 3, md: 2 }}
                fontSize={{ base: "lg", md: "sm" }}
                letterSpacing={{ base: "0", md: "0.08em" }}
                lineHeight="1"
                textTransform={{ base: "none", md: "uppercase" }}
              >
                <Box as="span" display={{ base: "none", md: "inline" }}>
                  {providerCampaign.providerShortName} Rewards
                </Box>
                <Box as="span" display={{ base: "inline", md: "none" }}>
                  Provider Reward
                </Box>
              </Badge>
              <Heading
                as="h1"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize={{ base: "56px", md: "7xl" }}
                lineHeight={{ base: "0.9", md: "0.92" }}
                letterSpacing="0"
                maxW={{ base: "390px", md: "760px" }}
              >
                Unlock your {providerCampaign.rewardCategory} reward.
              </Heading>
              <Text fontSize={{ base: "2xl", md: "2xl" }} lineHeight={{ base: "1.22", md: "1.35" }} color="#10254B" maxW={{ base: "370px", md: "680px" }} fontWeight="900">
                <Box as="span" display={{ base: "none", md: "inline" }}>
                  Answer a few quick questions so {providerCampaign.providerName} can match you with available rewards, offers, or services.
                </Box>
                <Box as="span" display={{ base: "inline", md: "none" }}>
                  Answer a few quick questions to unlock your prize.
                </Box>
              </Text>
            </Stack>

            <Stack spacing={{ base: 5, md: 3 }} align={{ base: "center", lg: "flex-start" }} w="100%">
              <Button
                as={RouterLink}
                to={providerCampaign.intakePath}
                size="lg"
                bg={providerCampaign.primaryColor}
                color="white"
                borderRadius="full"
                px={{ base: 8, md: 12 }}
                minH={{ base: "76px", md: "70px" }}
                minW={{ base: "100%", md: "300px" }}
                w={{ base: "100%", md: "auto" }}
                maxW={{ base: "520px", md: "none" }}
                fontSize={{ base: "3xl", md: "2xl" }}
                fontWeight="900"
                _hover={{ bg: "#D96712", textDecoration: "none", transform: "translateY(-2px)" }}
                _active={{ transform: "translateY(1px)" }}
                boxShadow={{ base: "0 18px 36px rgba(244,123,32,0.22)", md: "0 22px 44px rgba(244,123,32,0.32)" }}
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
              <Text fontSize={{ base: "lg", md: "md" }} color="#6D7280" fontWeight="900" lineHeight="1">
                Takes about one minute.
              </Text>
              <Text display={{ base: "block", md: "none" }} fontSize="md" color="#6A7280" fontWeight="900" lineHeight="1.2">
                General interest only. Rewards managed by SWCA.
              </Text>
            </Stack>
          </Stack>

          <Flex
            display="flex"
            flex={{ base: "0 0 auto", lg: "0 1 360px" }}
            align="center"
            justify="center"
            w="100%"
            mt={{ base: 0, md: 0 }}
            maxH={{ base: "none", md: "none" }}
            overflow="visible"
          >
            <Box
              position="relative"
              boxSize={{ base: "158px", sm: "174px", md: "340px" }}
              borderRadius="full"
              bg={`conic-gradient(from -18deg, ${providerCampaign.primaryColor} 0deg 45deg, #FFFFFF 45deg 90deg, ${providerCampaign.secondaryColor} 90deg 135deg, ${providerCampaign.accentColor} 135deg 180deg, ${providerCampaign.primaryColor} 180deg 225deg, #FFFFFF 225deg 270deg, ${providerCampaign.secondaryColor} 270deg 315deg, ${providerCampaign.accentColor} 315deg 360deg)`}
              border={{ base: "8px solid white", md: "10px solid white" }}
              boxShadow={{ base: "0 18px 34px rgba(7,26,58,0.18)", md: "0 28px 70px rgba(7,26,58,0.2)" }}
              aria-hidden="true"
            >
              <Box
                position="absolute"
                top={{ base: "-12px", md: "-14px" }}
                left="50%"
                transform="translateX(-50%)"
                w="0"
                h="0"
                borderLeft={{ base: "12px solid transparent", md: "14px solid transparent" }}
                borderRight={{ base: "12px solid transparent", md: "14px solid transparent" }}
                borderTop={{ base: `24px solid ${providerCampaign.secondaryColor}`, md: `26px solid ${providerCampaign.secondaryColor}` }}
              />
              <Flex
                position="absolute"
                inset="29%"
                align="center"
                justify="center"
                borderRadius="full"
                bg="white"
                border={{ base: "3px solid", md: "6px solid" }}
                borderColor={CREAM}
                boxShadow="inset 0 0 0 1px rgba(7,26,58,0.08)"
              >
                <Text fontWeight="900" color={providerCampaign.secondaryColor} fontSize={{ base: "xs", md: "xl" }}>
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
