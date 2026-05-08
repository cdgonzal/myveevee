import { Box, Button, Heading, SimpleGrid, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { trackCtaClick } from "../analytics/trackCtaClick";
import { APP_LINKS } from "../config/links";

export default function Technology() {
  const pageGradient = useColorModeValue(
    "linear(to-b, #FFFFFF, #9CE7FF)",
    "linear(to-b, surface.900, surface.800)"
  );
  const border = useColorModeValue("border.default", "border.default");
  const muted = useColorModeValue("text.muted", "text.muted");
  const panelBg = useColorModeValue("rgba(255, 255, 255, 0.82)", "rgba(6, 37, 76, 0.70)");
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.88)", "rgba(6, 37, 76, 0.56)");
  const nvidiaAccent = "#76B900";
  const nvidiaSoftBg = useColorModeValue("rgba(118, 185, 0, 0.08)", "rgba(118, 185, 0, 0.14)");

  return (
    <Box
      as="main"
      minH="100vh"
      bgGradient={pageGradient}
      color="text.primary"
      py={{ base: 10, md: 20 }}
    >
      <Stack spacing={{ base: 8, md: 12 }} maxW="6xl" mx="auto" px={{ base: 6, md: 10 }}>
        <Box
          borderWidth="1px"
          borderColor={border}
          borderRadius="3xl"
          bg={panelBg}
          boxShadow="0 24px 50px rgba(6, 37, 76, 0.12)"
          p={{ base: 6, md: 8 }}
        >
          <Stack spacing={4}>
            <Text
              fontSize="sm"
              letterSpacing="0.18em"
              textTransform="uppercase"
              color={nvidiaAccent}
              fontWeight="700"
            >
              TECHNOLOGY
            </Text>
            <Heading as="h1" size={{ base: "lg", md: "xl" }} fontWeight="800">
              Private, fast technology for connected care.
            </Heading>
            <Text color={muted} maxW="4xl" fontSize={{ base: "md", md: "lg" }}>
              VeeVee is built to support a digital health twin experience with privacy-minded infrastructure,
              faster response times, and technology that can support both hospital workflows and the app
              experience without adding friction.
            </Text>
          </Stack>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
          <Box borderWidth="1px" borderColor={border} borderRadius="2xl" bg={cardBg} p={{ base: 5, md: 6 }}>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color={nvidiaAccent} mb={2}>
              Private by design
            </Text>
            <Heading as="h2" size="md" mb={3}>
              Sensitive data can stay closer to the bedside.
            </Heading>
            <Text color={muted}>
              VeeVee is designed so bedside video can be processed locally instead of being pushed out to
              the cloud by default. That helps support privacy, speed, and a more hospital-ready deployment model.
            </Text>
          </Box>

          <Box borderWidth="1px" borderColor={border} borderRadius="2xl" bg={cardBg} p={{ base: 5, md: 6 }}>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color={nvidiaAccent} mb={2}>
              Fast alerts
            </Text>
            <Heading as="h2" size="md" mb={3}>
              Real-time sensing matters when seconds matter.
            </Heading>
            <Text color={muted}>
              The system is tuned to react quickly when something looks wrong, including fall-risk events and
              other signals that can help teams respond sooner.
            </Text>
          </Box>

          <Box borderWidth="1px" borderColor={border} borderRadius="2xl" bg={cardBg} p={{ base: 5, md: 6 }}>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color={nvidiaAccent} mb={2}>
              Ready for the unit
            </Text>
            <Heading as="h2" size="md" mb={3}>
              Built to support many rooms and many streams at once.
            </Heading>
            <Text color={muted}>
              VeeVee is designed for unit-level scale, not just single-room demos. The architecture supports
              concurrent workloads across clinical environments where reliability and consistency matter.
            </Text>
          </Box>

          <Box borderWidth="1px" borderColor={border} borderRadius="2xl" bg={cardBg} p={{ base: 5, md: 6 }}>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color={nvidiaAccent} mb={2}>
              Smooth app experience
            </Text>
            <Heading as="h2" size="md" mb={3}>
              The same foundation supports the app, too.
            </Heading>
            <Text color={muted}>
              The technology stack also supports the Health Twin funnel, personalized guidance, and the broader app experience so the user side can feel responsive, modern, and easy to use.
            </Text>
          </Box>
        </SimpleGrid>

        <Box
          borderWidth="1px"
          borderColor={border}
          borderRadius="2xl"
          bg={nvidiaSoftBg}
          boxShadow="0 18px 40px rgba(6, 37, 76, 0.10)"
          p={{ base: 6, md: 8 }}
        >
          <Stack spacing={6}>
            <Heading as="h2" size="md">
              The technology backbone in plain English
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Box borderWidth="1px" borderColor={border} borderRadius="xl" bg={cardBg} p={5}>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color={nvidiaAccent} mb={2}>
                  Bedside edge inference
                </Text>
                <Heading as="h3" size="sm" mb={2}>
                  ThinkEdge SE100 with NVIDIA RTX 2000 Ada
                </Heading>
                <Text color={muted} fontSize="sm">
                  At the bedside, VeeVee can process video locally so sensitive patient data does not need to travel to the cloud.
                </Text>
              </Box>

              <Box borderWidth="1px" borderColor={border} borderRadius="xl" bg={cardBg} p={5}>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color={nvidiaAccent} mb={2}>
                  Ultra-low-latency sensing
                </Text>
                <Heading as="h3" size="sm" mb={2}>
                  NVIDIA Clara Holoscan
                </Heading>
                <Text color={muted} fontSize="sm">
                  This helps VeeVee react quickly when something looks wrong, including fall-risk events.
                </Text>
              </Box>

              <Box borderWidth="1px" borderColor={border} borderRadius="xl" bg={cardBg} p={5}>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color={nvidiaAccent} mb={2}>
                  Optimized AI pipeline
                </Text>
                <Heading as="h3" size="sm" mb={2}>
                  TensorRT and Triton at the near edge
                </Heading>
                <Text color={muted} fontSize="sm">
                  These tools help VeeVee run smoothly across many rooms at once without slowing down.
                </Text>
              </Box>

              <Box borderWidth="1px" borderColor={border} borderRadius="xl" bg={cardBg} p={5}>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color={nvidiaAccent} mb={2}>
                  App intelligence
                </Text>
                <Heading as="h3" size="sm" mb={2}>
                  Simulation and personalized guidance
                </Heading>
                <Text color={muted} fontSize="sm">
                  The same core technology helps power the Health Twin funnel, personalized guidance, and a faster app experience.
                </Text>
              </Box>
            </SimpleGrid>

            <Button
              as={RouterLink}
              to={APP_LINKS.internal.healthTwin}
              onClick={() =>
                trackCtaClick({
                  ctaName: "technology_create_health_twin",
                  ctaText: "Create a Health Twin",
                  placement: "technology_bottom_cta",
                  destinationType: "internal",
                  destinationUrl: APP_LINKS.internal.healthTwin,
                  pagePath: APP_LINKS.internal.technology,
                })
              }
              size="md"
              borderRadius="full"
              fontWeight="700"
              px={8}
              alignSelf="center"
              boxShadow="0 0 28px rgba(17, 119, 186, 0.35)"
            >
              Create a Health Twin
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
