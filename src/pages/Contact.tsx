import { Box, Button, Heading, Text, Link as CLink, Card, CardBody, SimpleGrid, Stack, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { trackCtaClick } from "../analytics/trackCtaClick";
import { APP_LINKS } from "../config/links";
import { ProviderInquiryForm } from "../components/ProviderInquiryForm";

export default function Contact() {
  const [searchParams] = useSearchParams();
  const pageGradient = useColorModeValue(
    "linear(to-b, #FFFFFF, #9CE7FF)",
    "none"
  );
  const border = useColorModeValue("border.default", "border.default");
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.84)", "bg.surface");
  const muted = useColorModeValue("text.muted", "text.muted");

  if (searchParams.get("topic") === "providers") return (
    <Stack spacing={7} maxW="3xl" mx="auto" py={{ base: 2, md: 6 }}>
      <Stack spacing={3}>
        <Text fontSize="sm" letterSpacing="0.16em" textTransform="uppercase" color="accent.soft">Connect with our team</Text>
        <Heading as="h1" size={{ base: "xl", md: "2xl" }}>Let’s talk about your practice.</Heading>
        <Text color="text.muted" fontSize="lg">Tell us a little about your team and what you’d like to learn about VeeVee.</Text>
      </Stack>
      <ProviderInquiryForm />
    </Stack>
  );

  return (
    <Box
      as="main"
      minH="100vh"
      bgGradient={pageGradient}
      color="text.primary"
      py={{ base: 2, md: 20 }}
      px={{ base: 0, md: 10 }}
    >
      <Stack maxW="5xl" mx="auto" spacing={{ base: 8, md: 10 }}>
        <Stack spacing={3}>
          <Text fontSize="sm" letterSpacing="0.18em" textTransform="uppercase" color="accent.soft">
            CONTACT
          </Text>
          <Heading as="h1" size={{ base: "lg", md: "xl" }} fontWeight="800">
            Contact VeeVee for press, partnerships, and support.
          </Heading>
          <Text color={muted} maxW="3xl">
            Reach out if you are covering VeeVee, exploring a partnership, looking for investor information,
            or need help getting to the right team.
          </Text>
        </Stack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Card p={{ base: 0, md: 6 }} bg={cardBg} borderWidth="1px" borderColor={border} borderRadius="2xl">
            <CardBody p={{ base: 5, md: 6 }}>
              <Stack spacing={2}>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="accent.soft">
                  Press
                </Text>
                <Heading as="h2" size="sm">
                  Media inquiries
                </Heading>
                <Text color={muted} fontSize="sm">
                  For interviews, coverage, speaking, or company background.
                </Text>
                <CLink href="mailto:info@veevee.io" color="accent.soft" fontWeight="700">
                  info@veevee.io
                </CLink>
              </Stack>
            </CardBody>
          </Card>

          <Card p={{ base: 0, md: 6 }} bg={cardBg} borderWidth="1px" borderColor={border} borderRadius="2xl">
            <CardBody p={{ base: 5, md: 6 }}>
              <Stack spacing={2}>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="accent.soft">
                  Partnerships
                </Text>
                <Heading as="h2" size="sm">
                  Hospital and business conversations
                </Heading>
                <Text color={muted} fontSize="sm">
                  For connected-care partnerships, operational use cases, and product discussions.
                </Text>
                <CLink href="mailto:info@veevee.io" color="accent.soft" fontWeight="700">
                  info@veevee.io
                </CLink>
              </Stack>
            </CardBody>
          </Card>

          <Card p={{ base: 0, md: 6 }} bg={cardBg} borderWidth="1px" borderColor={border} borderRadius="2xl">
            <CardBody p={{ base: 5, md: 6 }}>
              <Stack spacing={2}>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="accent.soft">
                  Investors
                </Text>
                <Heading as="h2" size="sm">
                  Investor information
                </Heading>
                <Text color={muted} fontSize="sm">
                  For investor materials and company information.
                </Text>
                <CLink href={APP_LINKS.external.investors} isExternal color="accent.soft" fontWeight="700">
                  investveevee.com
                </CLink>
              </Stack>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Card p={{ base: 0, md: 6 }} bg={cardBg} borderWidth="1px" borderColor={border} borderRadius="2xl">
          <CardBody p={{ base: 5, md: 6 }}>
            <Stack spacing={3}>
              <Heading as="h2" size="md">
                What VeeVee covers
              </Heading>
              <Text color={muted}>
                VeeVee is building a connected care experience across everyday health questions, benefits awareness,
                family support, hospital workflows, and hospital-to-home continuity. If you are not sure where your
                request fits, send it to the press inbox and it can be routed internally.
              </Text>
              <Button
                as={RouterLink}
                to={APP_LINKS.internal.howItWorks}
                onClick={() =>
                  trackCtaClick({
                    ctaName: "contact_how_it_works",
                    ctaText: "See How It Works",
                    placement: "contact_bottom_cta",
                    destinationType: "internal",
                    destinationUrl: APP_LINKS.internal.howItWorks,
                    pagePath: APP_LINKS.internal.contact,
                  })
                }
                size="md"
                borderRadius="full"
                fontWeight="700"
                px={8}
                alignSelf="flex-start"
                boxShadow="0 0 28px rgba(17, 119, 186, 0.35)"
              >
                See How It Works
              </Button>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </Box>
  );
}
