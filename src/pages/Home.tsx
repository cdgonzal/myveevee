import { Box, Container, Grid, Heading, Image, Link as CLink, SimpleGrid, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { trackCtaClick } from "../analytics/trackCtaClick";
import { APP_LINKS } from "../config/links";
import { HEALTH_TWIN_BENEFITS } from "./marketingContent";
import { OfficeHero } from "../components/OfficeHero";
import { StartButton } from "../components/StartButton";

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
  <Stack spacing={{ base: 4, md: 5, lg: 6 }} textAlign={isDark ? "center" : undefined} align={isDark ? "center" : undefined}>
    <Text fontSize={{ base: "xs", md: "sm" }} letterSpacing="0.16em" textTransform="uppercase" color="accent.soft">
      Your health, connected
    </Text>
    <Heading as="h1" size={isDark ? { base: "2xl", md: "2xl", lg: "3xl" } : { base: "xl", md: "2xl" }} lineHeight="1.05"
      letterSpacing={isDark ? "-0.05em" : undefined}>
      Meet your digital <Box as="span" display={isDark ? "block" : "inline"} color="accent.primary">Health Twin</Box>
    </Heading>
    <Text fontSize={{ base: "md", md: "lg" }} lineHeight="1.55" color={muted} maxW="lg">
      Your twin. Your simulation.
    </Text>
    <StartButton placement="home_hero_start" px={8}
      alignSelf={isDark ? { base: "stretch", sm: "center" } : { base: "stretch", sm: "flex-start" }}>Start Now</StartButton>
    <CLink as={RouterLink} to={APP_LINKS.internal.howItWorks} fontSize="sm" color="accent.soft"
      display="inline-flex" alignItems="center" minH="44px" textDecoration="underline"
      onClick={() => trackLearnMore("home_hero")}>
      See How It Works
    </CLink>
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
            <Heading id="benefits-heading" as="h2" size="lg">Your twin. Real possibilities.</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
              {HEALTH_TWIN_BENEFITS.map((benefit, index) => (
                <Box key={benefit.title} p={5} display="flex" alignItems="center" gap={4} bg={panelBg} borderWidth="1px" borderColor="border.default" borderRadius="2xl">
                  {isDark && <Text fontSize="xs" letterSpacing="0.16em" color="accent.soft" flexShrink={0}>0{index + 1}</Text>}
                  <Heading as="h3" size="sm">{benefit.title}</Heading>
                </Box>
              ))}
            </SimpleGrid>
          </Stack>

          <Stack as="section" spacing={4} align="center" textAlign="center" maxW="2xl" w="full" mx="auto" py={4}>
            <Heading as="h2" size="md">Meet your free twin.</Heading>
            <StartButton placement="home_bottom_start" px={{ base: 4, md: 8 }} w={{ base: "full", sm: "auto" }} />
          </Stack>
        </Stack>
      </Container>
    </Stack>
  );
}
