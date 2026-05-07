import { Box, Heading, Text, Link as CLink, Card, CardBody, SimpleGrid, Stack, useColorModeValue } from "@chakra-ui/react";
import { APP_LINKS } from "../config/links";

export default function Contact() {
  const pageGradient = useColorModeValue(
    "linear(to-b, #FFFFFF, #9CE7FF)",
    "linear(to-b, surface.900, surface.800)"
  );
  const border = useColorModeValue("border.default", "border.default");
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.84)", "rgba(6, 37, 76, 0.70)");
  const muted = useColorModeValue("text.muted", "text.muted");

  return (
    <Box
      as="main"
      minH="100vh"
      bgGradient={pageGradient}
      color="text.primary"
      py={{ base: 10, md: 20 }}
      px={{ base: 6, md: 10 }}
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
          <Card bg={cardBg} borderWidth="1px" borderColor={border} borderRadius="2xl">
            <CardBody>
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
                <CLink href="mailto:press@veevee.io" color="accent.soft" fontWeight="700">
                  press@veevee.io
                </CLink>
              </Stack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={border} borderRadius="2xl">
            <CardBody>
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
                <CLink href="mailto:press@veevee.io" color="accent.soft" fontWeight="700">
                  press@veevee.io
                </CLink>
              </Stack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={border} borderRadius="2xl">
            <CardBody>
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

        <Card bg={cardBg} borderWidth="1px" borderColor={border} borderRadius="2xl">
          <CardBody>
            <Stack spacing={3}>
              <Heading as="h2" size="md">
                What VeeVee covers
              </Heading>
              <Text color={muted}>
                VeeVee is building a connected care experience across everyday health questions, benefits awareness,
                family support, hospital workflows, and hospital-to-home continuity. If you are not sure where your
                request fits, send it to the press inbox and it can be routed internally.
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </Box>
  );
}
