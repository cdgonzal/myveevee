import { Box, Button, Container, Grid, Heading, Image, SimpleGrid, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { trackCtaClick } from "../analytics/trackCtaClick";
import { APP_LINKS } from "../config/links";
import { HEALTH_TWIN_BENEFITS } from "./marketingContent";
import { OfficeHero } from "../components/OfficeHero";
import { CAMPAIGN_ART } from "../theme/campaign";

export default function Home() {
  const panelBg = "bg.surface";
  const isDark = useColorModeValue(false, true);
  const muted = useColorModeValue("text.muted", "text.muted");
  const trackLearnMore = (placement: string) => trackCtaClick({
    ctaName: `${placement}_how_it_works`,
    ctaText: "See How It Works",
    placement,
    destinationType: "internal",
    destinationUrl: APP_LINKS.internal.howItWorks,
    pagePath: APP_LINKS.internal.home,
  });

  const heroCopy = (
  <Stack spacing={5}>
    <Text fontSize="sm" letterSpacing="0.16em" textTransform="uppercase" color="accent.soft">
      Your health, connected
    </Text>
    <Heading as="h1" size={isDark ? { base: "2xl", md: "2xl", lg: "3xl" } : { base: "xl", md: "2xl" }} lineHeight="1.05"
      letterSpacing={isDark ? "-0.05em" : undefined}>
      Meet your digital <Box as="span" display={isDark ? "block" : "inline"} color="accent.primary">Health Twin</Box>
    </Heading>
    <Text fontSize="lg" color={muted} maxW="lg">
      Bring your records, habits, and care into one place. Understand your health over time and feel more prepared for your next step.
    </Text>
    <Button as={RouterLink} to={APP_LINKS.internal.howItWorks} size="lg" borderRadius="full"
      alignSelf={{ base: "stretch", sm: "flex-start" }} px={8} onClick={() => trackLearnMore("home_hero")}>
      See How It Works
    </Button>
    <Text fontSize="sm" color={muted}>Get to know your Health Twin in 3 simple steps.</Text>
  </Stack>
  );

  return (
    <Stack spacing={isDark ? 0 : { base: 10, md: 16 }} py={isDark ? 0 : { base: 2, md: 6 }}>
      {isDark ? <OfficeHero>{heroCopy}</OfficeHero> : (
        <Grid templateColumns={{ base: "1fr", md: "1.1fr 1fr" }} gap={{ base: 8, md: 12 }} alignItems="center">
          {heroCopy}
          <Box bg={panelBg} borderRadius="3xl" borderWidth="1px" borderColor="border.default" overflow="hidden" p={4}>
            <Image src="/images/marketing/car0.webp" alt="Illustration of a person alongside their digital Health Twin"
              w="full" h={{ base: "300px", md: "420px" }} objectFit="contain"
              onError={(event) => {
                if (event.currentTarget.src.endsWith(".webp")) event.currentTarget.src = "/images/marketing/car0.jpg";
              }} />
          </Box>
        </Grid>
      )}

      <Container maxW="6xl" px={isDark ? 4 : 0} py={isDark ? { base: 10, md: 16 } : 0}>
        <Stack spacing={{ base: 10, md: 16 }}>
          <Stack as="section" aria-labelledby="benefits-heading" spacing={6}>
            <Heading id="benefits-heading" as="h2" size="lg">A clearer picture. A more useful next step.</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
              {HEALTH_TWIN_BENEFITS.map((benefit, index) => (
                <Box key={benefit.title} p={6} bg={panelBg} borderWidth="1px" borderColor="border.default" borderRadius="2xl">
                  {isDark && <Text fontSize="xs" letterSpacing="0.16em" color="accent.soft" mb={5}>0{index + 1}</Text>}
                  <Heading as="h3" size="sm" mb={3}>{benefit.title}</Heading>
                  <Text color={muted}>{benefit.detail}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </Stack>

          <Box as="section" backgroundImage={isDark ? `url("${CAMPAIGN_ART.shadow}")` : undefined}
            backgroundSize="cover" backgroundPosition="center" p={isDark ? { base: 5, md: 12 } : 0}>
            <Stack spacing={4} align="center" textAlign="center" maxW="2xl" mx="auto"
              bg={isDark ? "bg.canvas" : undefined} p={isDark ? { base: 6, md: 10 } : 0}>
              <Heading as="h2" size="md">For everyday questions and the days between visits.</Heading>
              <Text color={muted}>
                Whether you are keeping track of your own health or helping someone you love, start with a clearer view of what matters.
              </Text>
              <Button as={RouterLink} to={APP_LINKS.internal.howItWorks} size="lg" borderRadius="full"
                px={8} onClick={() => trackLearnMore("home_bottom")}>
                See How It Works
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Stack>
  );
}
