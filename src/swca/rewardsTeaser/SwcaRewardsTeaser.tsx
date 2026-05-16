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

export default function SwcaRewardsTeaser() {
  return (
    <Box minH="100vh" bg="#FFF9EF" color={NAVY}>
      <Box maxW="980px" mx="auto" px={{ base: 5, md: 8 }} py={{ base: 7, md: 10 }}>
        <Flex align="center" justify="space-between" gap={5} mb={{ base: 10, md: 14 }}>
          <Flex align="center" gap={3}>
            <Image
              src="/swca/spine-wellness-logo.png"
              alt="Spine and Wellness Centers of America"
              boxSize={{ base: "64px", md: "86px" }}
              objectFit="contain"
            />
            <Stack spacing={0}>
              <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="900" letterSpacing="0.12em" textTransform="uppercase">
                Spine and Wellness
              </Text>
              <Text fontSize={{ base: "sm", md: "md" }} fontWeight="700" color="#566071">
                Centers of America
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
            Reward experience
          </Badge>
        </Flex>

        <Stack spacing={{ base: 7, md: 9 }} align="center" textAlign="center" minH={{ base: "auto", md: "68vh" }} justify="center">
          <Stack spacing={4} align="center">
            <Badge bg={NAVY} color="white" borderRadius="full" px={4} py={2} fontSize="sm" letterSpacing="0.08em">
              SWCA reward
            </Badge>
            <Heading
              as="h1"
              fontFamily="Georgia, 'Times New Roman', serif"
              fontSize={{ base: "5xl", md: "7xl" }}
              lineHeight="0.92"
              letterSpacing="0"
              maxW="780px"
            >
              Win your wellness reward.
            </Heading>
            <Text fontSize={{ base: "xl", md: "2xl" }} lineHeight="1.35" color="#24314D" maxW="620px" fontWeight="700">
              Answer a few quick questions, then unlock your prize.
            </Text>
          </Stack>

          <Stack spacing={3} align="center" w="100%">
            <Button
              as={RouterLink}
              to={APP_LINKS.internal.swcaIntake}
              size="lg"
              bg={ORANGE}
              color="white"
              borderRadius="full"
              px={{ base: 8, md: 12 }}
              minH={{ base: "62px", md: "70px" }}
              minW={{ base: "100%", sm: "360px" }}
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="900"
              _hover={{ bg: "#D96712", textDecoration: "none", transform: "translateY(-2px)" }}
              _active={{ transform: "translateY(1px)" }}
              boxShadow="0 22px 44px rgba(244,123,32,0.32)"
              onClick={() => {
                trackCtaClick({
                  ctaName: "swca_rewards_start_intake",
                  ctaText: "Win your prize now",
                  placement: "swca_rewards_teaser_hero",
                  destinationType: "internal",
                  destinationUrl: APP_LINKS.internal.swcaIntake,
                });
                trackSwcaCampaignEvent({
                  eventName: "swca_rewards_start_intake",
                  params: {
                    placement: "swca_rewards_teaser_hero",
                  },
                });
              }}
            >
              Win your prize now
            </Button>
            <Text fontSize={{ base: "sm", md: "md" }} color="#5F6878" fontWeight="700">
              Takes about one minute.
            </Text>
          </Stack>
        </Stack>

        <Text mt={{ base: 8, md: 2 }} fontSize="xs" color="#6A7280" textAlign="center">
          Rewards and eligibility are managed by Spine and Wellness Centers of America.
        </Text>
      </Box>
    </Box>
  );
}
