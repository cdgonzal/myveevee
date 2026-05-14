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
import providerComments from "./provider-comments.json";

const NAVY = "#071A3A";
const ORANGE = "#F39A25";
const CREAM = "#FFF7EC";
const LINE = "#F0D2A4";

const PROFILE_BENEFITS = [
  "Keep your wellness priorities in one place",
  "Bring clearer context into your next conversation",
  "Start a free profile you can build over time",
];

export default function SwcaProfileFunnel() {
  return (
    <Box minH="100vh" bg="#FFFFFF" color={NAVY} overflow="hidden">
      <Box position="absolute" inset={0} bg="linear-gradient(135deg, rgba(255,247,236,0.92), rgba(255,255,255,0.94) 48%, rgba(243,154,37,0.12))" />
      <Box position="relative" maxW="1120px" mx="auto" px={{ base: 5, md: 8 }} py={{ base: 7, md: 10 }}>
        <Flex align="center" justify="space-between" gap={5} mb={{ base: 7, md: 10 }}>
          <Flex align="center" gap={3}>
            <Image
              src="/swca/spine-wellness-logo.png"
              alt="Spine and Wellness Centers of America"
              boxSize={{ base: "68px", md: "88px" }}
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
            Recommended by SWCA
          </Badge>
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 8, lg: 12 }} alignItems="center">
          <Stack spacing={{ base: 6, md: 7 }}>
            <Stack spacing={4}>
              <Badge
                alignSelf="flex-start"
                bg={NAVY}
                color="white"
                borderRadius="full"
                px={4}
                py={2}
                fontSize="sm"
                letterSpacing="0.08em"
              >
                Provider-recommended next step
              </Badge>
              <Heading
                as="h1"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize={{ base: "4xl", md: "6xl" }}
                lineHeight="0.95"
                letterSpacing="0"
              >
                {providerComments.headline}
              </Heading>
              <Text fontSize={{ base: "lg", md: "xl" }} lineHeight="1.45" color="#24314D" maxW="660px">
                {providerComments.subheadline}
              </Text>
            </Stack>

            <Button
              as="a"
              href={APP_LINKS.external.authenticatedConsole}
              size="lg"
              bg={ORANGE}
              color="white"
              borderRadius="full"
              px={8}
              minH="56px"
              maxW={{ base: "100%", sm: "340px" }}
              fontWeight="900"
              _hover={{ bg: "#D96712", textDecoration: "none" }}
              boxShadow="0 18px 36px rgba(243,154,37,0.28)"
              onClick={() =>
                {
                  trackCtaClick({
                    ctaName: "swca_profile_funnel_create_free_profile",
                    ctaText: "Create my free profile",
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
                }
              }
            >
              Create my free profile
            </Button>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
              {PROFILE_BENEFITS.map((benefit) => (
                <Flex
                  key={benefit}
                  align="center"
                  minH="76px"
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
            </SimpleGrid>
          </Stack>

          <Stack spacing={4}>
            {providerComments.comments.map((comment) => (
              <Box
                key={comment.role}
                bg="white"
                border="1px solid"
                borderColor={LINE}
                borderRadius="8px"
                p={{ base: 5, md: 6 }}
                boxShadow="0 18px 44px rgba(7,26,58,0.10)"
              >
                <Stack spacing={3}>
                  <Text fontSize="xs" letterSpacing="0.16em" textTransform="uppercase" color={ORANGE} fontWeight="900">
                    {comment.role}
                  </Text>
                  <Text fontSize={{ base: "lg", md: "xl" }} lineHeight="1.42" fontFamily="Georgia, 'Times New Roman', serif">
                    {comment.body}
                  </Text>
                </Stack>
              </Box>
            ))}

            <Box bg={CREAM} border="1px solid" borderColor={LINE} borderRadius="8px" p={{ base: 5, md: 6 }}>
              <Text fontWeight="900">Free profile. Clearer next step.</Text>
              <Text mt={1} color="#5F6878">
                VeeVee is where you can start organizing your health goals and context after today's SWCA experience.
              </Text>
            </Box>
          </Stack>
        </SimpleGrid>
      </Box>
    </Box>
  );
}
