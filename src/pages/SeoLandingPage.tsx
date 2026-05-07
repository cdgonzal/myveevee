import {
  Box,
  Button,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { trackCtaClick } from "../analytics/trackCtaClick";

type SeoLandingPageSection = {
  title: string;
  body: string;
  points: string[];
};

type SeoLandingPageFaq = {
  question: string;
  answer: string;
};

type SeoLandingPageRelatedLink = {
  title: string;
  description: string;
  to: string;
};

type SeoLandingPageProps = {
  pagePath: string;
  eyebrow: string;
  title: string;
  intro: string;
  audienceLabel: string;
  audienceSummary: string;
  sections: SeoLandingPageSection[];
  faqTitle: string;
  faqs: SeoLandingPageFaq[];
  primaryCta: {
    label: string;
    to: string;
    destinationType: "internal" | "external";
    placement: string;
    ctaName: string;
  };
  secondaryCta?: {
    label: string;
    to: string;
    destinationType: "internal" | "external";
    placement: string;
    ctaName: string;
  };
  relatedLinks: SeoLandingPageRelatedLink[];
};

function LandingButton({
  pagePath,
  label,
  to,
  destinationType,
  placement,
  ctaName,
}: SeoLandingPageProps["primaryCta"] & { pagePath: string }) {
  const trackClick = () => {
    trackCtaClick({
      ctaName,
      ctaText: label,
      placement,
      destinationType,
      destinationUrl: to,
      pagePath,
    });
  };

  if (destinationType === "external") {
    return (
      <Button
        as="a"
        href={to}
        onClick={trackClick}
        size="md"
        borderRadius="full"
        fontWeight="700"
        px={8}
        boxShadow="0 0 28px rgba(17, 119, 186, 0.35)"
      >
        {label}
      </Button>
    );
  }

  return (
    <Button
      as={RouterLink}
      to={to}
      onClick={trackClick}
      size="md"
      borderRadius="full"
      fontWeight="700"
      px={8}
      boxShadow="0 0 28px rgba(17, 119, 186, 0.35)"
    >
      {label}
    </Button>
  );
}

export default function SeoLandingPage({
  pagePath,
  eyebrow,
  title,
  intro,
  audienceLabel,
  audienceSummary,
  sections,
  faqTitle,
  faqs,
  primaryCta,
  secondaryCta,
  relatedLinks,
}: SeoLandingPageProps) {
  const pageGradient = useColorModeValue(
    "linear(to-b, #FFFFFF, #9CE7FF)",
    "linear(to-b, surface.900, surface.800)"
  );
  const border = useColorModeValue("border.default", "border.default");
  const muted = useColorModeValue("text.muted", "text.muted");
  const panelBg = useColorModeValue("rgba(255, 255, 255, 0.82)", "rgba(6, 37, 76, 0.70)");
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.88)", "rgba(6, 37, 76, 0.56)");
  const accentSurface = useColorModeValue("rgba(17, 119, 186, 0.08)", "rgba(17, 119, 186, 0.16)");

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
          <Stack spacing={5}>
            <Text
              fontSize="sm"
              letterSpacing="0.18em"
              textTransform="uppercase"
              color="accent.soft"
              fontWeight="700"
            >
              {eyebrow}
            </Text>
            <Heading as="h1" size={{ base: "lg", md: "xl" }} fontWeight="800">
              {title}
            </Heading>
            <Text color={muted} maxW="4xl" fontSize={{ base: "md", md: "lg" }}>
              {intro}
            </Text>

            <Box borderWidth="1px" borderColor={border} borderRadius="2xl" bg={accentSurface} p={4}>
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color="accent.soft" mb={2}>
                Best fit
              </Text>
              <Text fontSize="sm" color="text.primary" fontWeight="600" mb={2}>
                {audienceLabel}
              </Text>
              <Text fontSize="sm" color={muted}>
                {audienceSummary}
              </Text>
            </Box>

            <Stack direction={{ base: "column", md: "row" }} spacing={3}>
              <LandingButton pagePath={pagePath} {...primaryCta} />
              {secondaryCta ? <LandingButton pagePath={pagePath} {...secondaryCta} /> : null}
            </Stack>
          </Stack>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 4, md: 6 }}>
          {sections.map((section) => (
            <Box
              key={section.title}
              borderWidth="1px"
              borderColor={border}
              borderRadius="2xl"
              bg={cardBg}
              boxShadow="0 14px 34px rgba(6, 37, 76, 0.10)"
              p={{ base: 5, md: 6 }}
            >
              <Stack spacing={4}>
                <Heading as="h2" size="md">
                  {section.title}
                </Heading>
                <Text color={muted}>{section.body}</Text>
                <Stack spacing={2}>
                  {section.points.map((point) => (
                    <Text key={point} fontSize="sm" color="text.primary">
                      - {point}
                    </Text>
                  ))}
                </Stack>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>

        <Box
          borderWidth="1px"
          borderColor={border}
          borderRadius="2xl"
          bg={panelBg}
          boxShadow="0 18px 40px rgba(6, 37, 76, 0.10)"
          p={{ base: 6, md: 8 }}
        >
          <Stack spacing={5}>
            <Box>
              <Heading as="h2" size="md" mb={2}>
                {faqTitle}
              </Heading>
              <Text color={muted}>
                These answers stay close to what the current product pages already promise.
              </Text>
            </Box>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {faqs.map((faq) => (
                <Box
                  key={faq.question}
                  borderWidth="1px"
                  borderColor={border}
                  borderRadius="xl"
                  bg={cardBg}
                  p={5}
                >
                  <Heading as="h3" size="sm" mb={3}>
                    {faq.question}
                  </Heading>
                  <Text fontSize="sm" color={muted}>
                    {faq.answer}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Stack>
        </Box>

        <Box
          borderWidth="1px"
          borderColor={border}
          borderRadius="2xl"
          bg={panelBg}
          p={{ base: 6, md: 8 }}
        >
          <Stack spacing={5}>
            <Box>
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="accent.soft" mb={2}>
                Related paths
              </Text>
              <Heading as="h2" size="md" mb={2}>
                Explore adjacent VeeVee use cases
              </Heading>
              <Text color={muted}>
                These pages are intentionally linked so visitors and crawlers can move between related topics.
              </Text>
            </Box>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              {relatedLinks.map((link) => (
                <Box
                  key={link.to}
                  as={RouterLink}
                  to={link.to}
                  borderWidth="1px"
                  borderColor={border}
                  borderRadius="xl"
                  bg={cardBg}
                  p={5}
                  _hover={{ textDecoration: "none", borderColor: "accent.primary" }}
                >
                  <Heading as="h3" size="sm" mb={2}>
                    {link.title}
                  </Heading>
                  <Text fontSize="sm" color={muted}>
                    {link.description}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
