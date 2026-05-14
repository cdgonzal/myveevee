import { useEffect, useState } from "react";
import { Badge, Box, Button, Flex, Heading, Image, Stack, Text } from "@chakra-ui/react";
import { APP_LINKS } from "../../config/links";
import { trackSwcaCampaignEvent } from "../campaignEvents";
import { fetchSwcaRewardCertificate, type SwcaRewardCertificate as Certificate } from "./api";

const NAVY = "#071A3A";
const ORANGE = "#F39A25";
const LINE = "#E2E8F0";

export default function SwcaRewardCertificate() {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const certificateId = params.get("certificateId") ?? "";
    const token = params.get("token") ?? "";

    if (!certificateId || !token) {
      setError("This reward certificate link is incomplete.");
      setIsLoading(false);
      return;
    }

    fetchSwcaRewardCertificate(certificateId, token)
      .then((nextCertificate) => {
        setCertificate(nextCertificate);
        trackSwcaCampaignEvent({
          eventName: "swca_reward_certificate_view",
          pagePath: APP_LINKS.internal.swcaCertificate,
          submissionId: nextCertificate.submissionId,
          rewardId: nextCertificate.rewardId,
        });
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "This reward certificate could not be loaded.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleProfileClick = () => {
    trackSwcaCampaignEvent({
      eventName: "swca_reward_certificate_profile_cta",
      pagePath: APP_LINKS.internal.swcaCertificate,
      submissionId: certificate?.submissionId,
      rewardId: certificate?.rewardId,
    });
  };

  return (
    <Box minH="100vh" bg="#F8FAFC" color={NAVY} px={{ base: 4, md: 8 }} py={{ base: 7, md: 10 }}>
      <Box maxW="920px" mx="auto">
        <Flex align="center" gap={3} mb={7}>
          <Image src="/swca/spine-wellness-logo.png" alt="Spine and Wellness Centers of America" boxSize="72px" objectFit="contain" />
          <Box>
            <Text fontSize="sm" fontWeight="900" letterSpacing="0.12em" textTransform="uppercase" color={ORANGE}>
              Spine and Wellness Centers of America
            </Text>
            <Heading as="h1" size={{ base: "lg", md: "xl" }} letterSpacing="0">
              Reward Certificate
            </Heading>
          </Box>
        </Flex>

        <Box bg="white" border="1px solid" borderColor={LINE} borderRadius="8px" p={{ base: 5, md: 8 }} boxShadow="0 18px 44px rgba(7,26,58,0.08)">
          {isLoading ? (
            <Text color="#526071">Loading your reward certificate...</Text>
          ) : null}

          {!isLoading && error ? (
            <Stack spacing={4}>
              <Badge alignSelf="flex-start" colorScheme="orange">
                Link unavailable
              </Badge>
              <Heading as="h2" size="md">
                We could not open this reward certificate.
              </Heading>
              <Text color="#526071">{error}</Text>
              <Button as="a" href={APP_LINKS.internal.swcaRewards} alignSelf="flex-start" bg={NAVY} color="white" _hover={{ bg: "#102A55" }}>
                Return to SWCA rewards
              </Button>
            </Stack>
          ) : null}

          {!isLoading && certificate ? (
            <Stack spacing={6}>
              <Box border="1px solid" borderColor="#F0D2A4" bg="#FFF7EC" borderRadius="8px" p={{ base: 5, md: 7 }}>
                <Text fontSize="xs" fontWeight="900" letterSpacing="0.14em" textTransform="uppercase" color="#B65F13">
                  Your reward
                </Text>
                <Heading as="h2" size={{ base: "lg", md: "xl" }} mt={2}>
                  {certificate.rewardLabel}
                </Heading>
                {certificate.rewardDescription ? (
                  <Text mt={3} color="#526071" fontSize={{ base: "md", md: "lg" }}>
                    {certificate.rewardDescription}
                  </Text>
                ) : null}
                <Flex mt={5} gap={3} wrap="wrap">
                  {certificate.estimatedValue ? <Badge colorScheme="orange">{certificate.estimatedValue}</Badge> : null}
                  {certificate.issuedTo ? <Badge bg="white">Issued to {certificate.issuedTo}</Badge> : null}
                  {certificate.expiresAt ? <Badge bg="white">Valid through {formatDate(certificate.expiresAt)}</Badge> : null}
                </Flex>
              </Box>

              <Box>
                <Heading as="h3" size="md">
                  Keep this certificate available for follow-up.
                </Heading>
                <Text mt={2} color="#526071">
                  SWCA has your selected contact preference. This page confirms the reward assigned after your wellness intake.
                </Text>
              </Box>

              <Box bg="#EAF4FF" border="1px solid" borderColor="#C8DDF4" borderRadius="8px" p={5}>
                <Heading as="h3" size="md">
                  Next step: create your free VeeVee profile
                </Heading>
                <Text mt={2} color="#526071">
                  Your profile helps keep your wellness information easier to organize and continue after this campaign.
                </Text>
                <Button
                  as="a"
                  href="https://veevee.io"
                  mt={4}
                  bg={ORANGE}
                  color="white"
                  _hover={{ bg: "#D96712" }}
                  onClick={handleProfileClick}
                >
                  Create free profile
                </Button>
              </Box>
            </Stack>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}

function formatDate(value: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
