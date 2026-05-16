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
import { trackCtaClick } from "../../analytics/trackCtaClick";
import { APP_LINKS } from "../../config/links";
import { trackSwcaCampaignEvent } from "../campaignEvents";
import providerComments from "./provider-comments.json";

const NAVY = "#071A3A";
const ORANGE = "#F39A25";
const CREAM = "#FFF7EC";
const LINE = "#F0D2A4";
const AVATAR_WEBM = "/avatar/health-twin-funnel-avatar.webm";
const AVATAR_MP4 = "/avatar/health-twin-funnel-avatar.mp4";
const AVATAR_POSTER = "/avatar/health-twin-funnel-avatar-poster.webp";

const PROFILE_BENEFITS = [
  "Make your reward more personal",
  "Keep your goals and next steps together",
  "Build a profile that gets smarter over time",
];

export default function SwcaProfileFunnel() {
  return (
    <Box minH="100vh" bg={CREAM} color={NAVY} overflow="hidden">
      <Box position="absolute" inset={0} bg="linear-gradient(145deg, rgba(255,247,236,0.96), rgba(255,255,255,0.98) 54%, rgba(243,154,37,0.16))" />
      <Box position="relative" maxW="1120px" mx="auto" px={{ base: 5, md: 8 }} py={{ base: 5, md: 10 }}>
        <Flex align="center" justify="space-between" gap={5} mb={{ base: 6, md: 12 }}>
          <Flex align="center" gap={3}>
            <Image
              src="/swca/spine-wellness-logo.png"
              alt="Spine and Wellness Centers of America"
              boxSize={{ base: "58px", md: "82px" }}
              objectFit="contain"
            />
            <Stack spacing={0}>
              <Text fontSize={{ base: "sm", md: "sm" }} fontWeight="900" letterSpacing={{ base: "0", md: "0.12em" }} textTransform={{ base: "none", md: "uppercase" }}>
                SWCA recommends VeeVee
              </Text>
              <Text display={{ base: "none", md: "block" }} fontSize="md" fontWeight="700" color="#566071">
                Create your free Health Twin
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
            Final step
          </Badge>
        </Flex>

        <Flex direction={{ base: "column", lg: "row" }} align="center" justify="space-between" gap={{ base: 6, lg: 12 }} minH={{ base: "auto", md: "68vh" }}>
          <Stack spacing={{ base: 5, md: 7 }} textAlign={{ base: "center", lg: "left" }} align={{ base: "center", lg: "flex-start" }} flex="1" w="100%">
            <Stack spacing={{ base: 3, md: 5 }} align={{ base: "center", lg: "flex-start" }}>
              <Badge
                bg={NAVY}
                color="white"
                borderRadius="full"
                px={{ base: 5, md: 4 }}
                py={{ base: 2.5, md: 2 }}
                fontSize={{ base: "sm", md: "sm" }}
                letterSpacing={{ base: "0", md: "0.08em" }}
              >
                Your Health Twin
              </Badge>
              <Heading
                as="h1"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize={{ base: "44px", md: "7xl" }}
                lineHeight={{ base: "0.92", md: "0.9" }}
                letterSpacing="0"
                maxW={{ base: "390px", md: "760px" }}
              >
                Create your digital twin.
              </Heading>
              <Text fontSize={{ base: "lg", md: "2xl" }} lineHeight={{ base: "1.22", md: "1.32" }} color="#10254B" fontWeight="900" maxW={{ base: "340px", md: "680px" }}>
                Get a more personalized VeeVee profile built around you.
              </Text>
              <Text display={{ base: "none", md: "block" }} fontSize="lg" lineHeight="1.5" color="#4F596B" maxW="640px" fontWeight="700">
                You claimed the reward. Now turn that momentum into a free Health Twin that helps organize your priorities and gives you a better next step inside VeeVee.
              </Text>
            </Stack>

            <Box
              display={{ base: "block", lg: "none" }}
              w={{ base: "150px", sm: "172px" }}
              overflow="hidden"
              borderRadius="18px"
              border="4px solid"
              borderColor="white"
              bg="white"
              boxShadow="0 18px 42px rgba(7,26,58,0.16)"
            >
              <Box
                as="video"
                w="100%"
                h="auto"
                display="block"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                poster={AVATAR_POSTER}
              >
                <source src={AVATAR_WEBM} type="video/webm" />
                <source src={AVATAR_MP4} type="video/mp4" />
              </Box>
            </Box>

            <Button
              as="a"
              href={APP_LINKS.external.authenticatedConsole}
              size="lg"
              bg={ORANGE}
              color="white"
              borderRadius="full"
              px={{ base: 8, md: 12 }}
              minH={{ base: "76px", md: "70px" }}
              w={{ base: "100%", md: "auto" }}
              minW={{ base: "100%", md: "360px" }}
              maxW={{ base: "520px", md: "none" }}
              fontSize={{ base: "2xl", md: "2xl" }}
              fontWeight="900"
              _hover={{ bg: "#D96712", textDecoration: "none" }}
              boxShadow="0 22px 44px rgba(243,154,37,0.30)"
              onClick={() => {
                trackCtaClick({
                  ctaName: "swca_profile_funnel_create_free_profile",
                  ctaText: "Create my Health Twin",
                  placement: "swca_profile_funnel_hero",
                  destinationType: "external",
                  destinationUrl: APP_LINKS.external.authenticatedConsole,
                });
                trackSwcaCampaignEvent({
                  eventName: "swca_profile_funnel_create_free_profile",
                  params: {
                    placement: "swca_profile_funnel_hero",
                  },
                });
              }}
            >
              Create my Health Twin
            </Button>

            <Text fontSize={{ base: "md", md: "md" }} color="#5F6878" fontWeight="900">
              Free to start. Takes less than a minute.
            </Text>

            <Flex display={{ base: "none", md: "flex" }} gap={3} wrap="wrap">
              {PROFILE_BENEFITS.map((benefit) => (
                <Flex
                  key={benefit}
                  align="center"
                  minH="68px"
                  bg="white"
                  border="1px solid"
                  borderColor="rgba(7,26,58,0.12)"
                  borderRadius="8px"
                  p={4}
                  boxShadow="0 14px 30px rgba(7,26,58,0.07)"
                >
                  <Text fontSize="sm" fontWeight="800" lineHeight="1.25">
                    {benefit}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </Stack>

          <Box
            display={{ base: "none", lg: "block" }}
            flex="0 1 360px"
            bg="white"
            border="1px solid"
            borderColor={LINE}
            borderRadius="8px"
            p={5}
            boxShadow="0 22px 54px rgba(7,26,58,0.10)"
          >
            <Stack spacing={4}>
              <Box
                overflow="hidden"
                borderRadius="8px"
                bg={CREAM}
                maxH="390px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Box
                  as="video"
                  maxW="100%"
                  h="auto"
                  display="block"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  poster={AVATAR_POSTER}
                >
                  <source src={AVATAR_WEBM} type="video/webm" />
                  <source src={AVATAR_MP4} type="video/mp4" />
                </Box>
              </Box>
              <Box px={2} pb={1}>
                <Text fontSize="xs" letterSpacing="0.16em" textTransform="uppercase" color={ORANGE} fontWeight="900">
                  {providerComments.comments[2]?.role ?? "SWCA provider recommendation"}
                </Text>
                <Text mt={2} fontSize="lg" lineHeight="1.3" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700">
                  Create your free profile now so your wellness journey does not end with today's reward.
                </Text>
              </Box>
            </Stack>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}
