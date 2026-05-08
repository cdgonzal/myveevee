import {
  Box,
  Button,
  Grid,
  Heading,
  Image,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useEffect, useState } from "react";
import { Link as CLink } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { trackCtaClick } from "../analytics/trackCtaClick";
import { APP_LINKS } from "../config/links";

const PAYOR_LOGOS = [
  { src: "/payors/normalized/united.png", alt: "UnitedHealthcare" },
  { src: "/payors/normalized/cigna.png", alt: "Cigna" },
  { src: "/payors/normalized/humana99.png", alt: "Humana" },
  { src: "/payors/normalized/aetna2.png", alt: "Aetna" },
  { src: "/payors/normalized/elevance2.png", alt: "Elevance" },
  { src: "/payors/normalized/florida2.png", alt: "Florida Blue" },
  { src: "/payors/normalized/kaiser44.png", alt: "Kaiser Permanente" },
  { src: "/payors/normalized/centene.png", alt: "Centene" },
  { src: "/payors/normalized/molina3.png", alt: "Molina Healthcare" },
  { src: "/payors/normalized/medicare1.png", alt: "Medicare" },
  { src: "/payors/normalized/cvs.png", alt: "CVS" },
].filter((logo) => !!logo.src);

const scrollLogos = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const HERO_IMAGES = [
  {
    src: "images/marketing/car0.webp",
    fallbackSrc: "images/marketing/car0.jpg",
    alt: "VeeVee carousel slide showing a health twin alongside the patient",
    title: "Meet your health twin",
    durationMs: 8000,
  },
  {
    src: "images/marketing/car1.webp",
    fallbackSrc: "images/marketing/car1.jpg",
    alt: "VeeVee carousel slide showing everyday wellness support",
    title: "Everyday support that feels simple",
    durationMs: 4000,
  },
  {
    src: "images/marketing/car2.webp",
    fallbackSrc: "images/marketing/car2.jpg",
    alt: "VeeVee carousel slide showing care that stays connected",
    title: "Clear next steps, without the stress",
    durationMs: 4000,
  },
  {
    src: "images/marketing/car4.webp",
    fallbackSrc: "images/marketing/car4.jpg",
    alt: "VeeVee carousel slide showing a connected care experience",
    title: "Be your ideal self",
    durationMs: 4000,
  },
  {
    src: "images/marketing/car3.webp",
    fallbackSrc: "images/marketing/car3.jpg",
    alt: "VeeVee carousel slide showing support after the visit",
    title: "Support that stays with you",
    durationMs: 4000,
  },
];

export default function Home() {
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const pageGradient = useColorModeValue(
    "linear(to-b, #FFFFFF, #9CE7FF)",
    "linear(to-b, surface.900, surface.800)"
  );
  const heroCardBg = useColorModeValue("bg.elevated", "bg.elevated");
  const heroStripBg = useColorModeValue("brand.50", "surface.700");
  const border = useColorModeValue("border.default", "border.default");
  const muted = useColorModeValue("text.muted", "text.muted");
  const subtle = useColorModeValue("text.subtle", "text.subtle");
  const pillBg = "accent.primary";
  const logoFilter = useColorModeValue("none", "invert(1)");
  const payorLogoFilter = "grayscale(1) brightness(0) invert(1) contrast(1.05)";
  const heroStageBg = useColorModeValue("rgba(255, 255, 255, 0.94)", "rgba(6, 37, 76, 0.88)");
  const currentHero = HERO_IMAGES[activeHeroIndex];

  const trackHomeCta = (
    ctaName: string,
    ctaText: string,
    destinationUrl: string,
    destinationType: "internal" | "external",
    placement: string
  ) => {
    trackCtaClick({
      ctaName,
      ctaText,
      placement,
      destinationType,
      destinationUrl,
      pagePath: APP_LINKS.internal.home,
    });
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setActiveHeroIndex((current) => (current + 1) % HERO_IMAGES.length);
    }, currentHero.durationMs);

    return () => window.clearTimeout(timeoutId);
  }, [currentHero.durationMs]);

  return (
    <>
      <Box
        as="main"
        minH="100vh"
        bgGradient={pageGradient}
        color="text.primary"
        py={{ base: 10, md: 20 }}
        px={{ base: 6, md: 10 }}
      >
        <Grid
          templateColumns={{ base: "1fr", md: "minmax(0, 1.1fr) minmax(0, 1fr)" }}
          gap={{ base: 12, md: 16 }}
          alignItems="center"
          maxW="6xl"
          mx="auto"
        >
          <Stack spacing={6}>
            <Text
              fontSize="sm"
              letterSpacing="0.18em"
              textTransform="uppercase"
              color="accent.soft"
              as={RouterLink}
              to={APP_LINKS.internal.home}
              _hover={{ textDecoration: "none" }}
              _focus={{ outline: "none" }}
            >
              Private. Secure. Yours.
            </Text>

            <CLink
              as={RouterLink}
              to={APP_LINKS.internal.home}
              _hover={{ textDecoration: "none" }}
              _focus={{ outline: "none" }}
              style={{ textDecoration: "none" }}
            >
              <Heading
                as="h1"
                size={{ base: "xl", md: "2xl" }}
                fontWeight="800"
                lineHeight="1.1"
                color="text.primary"
              >
                Meet your digital
                <br />
                <Box as="span" color="accent.primary">
                  Health Twin
                </Box>
              </Heading>
            </CLink>

            <Text fontSize={{ base: "md", md: "lg" }} maxW="lg" color={muted}>
              VEEVEE is a digital health twin that brings your records, habits, and care into one place so you can understand your body, follow changes over time, and make decisions with confidence.
            </Text>

            <Stack spacing={3}>
              <Button
                as="a"
                href={APP_LINKS.cta.login}
                onClick={() =>
                  trackHomeCta(
                    "home_hero_create_health_twin",
                    "Create Your Health Twin",
                    APP_LINKS.cta.login,
                    "external",
                    "home_hero"
                  )
                }
                size="lg"
                borderRadius="full"
                fontWeight="700"
                px={10}
                boxShadow="0 0 40px rgba(17, 119, 186, 0.45)"
              >
                Create Your Health Twin
              </Button>

              <Text fontSize="sm" color={subtle} textAlign={{ base: "center", md: "left" }}>
                Less than 60 seconds
              </Text>
            </Stack>
          </Stack>

          <Box
            position="relative"
            bg={heroCardBg}
            borderRadius="2xl"
            overflow="hidden"
            borderWidth="1px"
            borderColor={border}
            boxShadow="0 0 60px rgba(0,0,0,0.25)"
          >
            <CLink
              as={RouterLink}
              to={APP_LINKS.internal.home}
              _hover={{ textDecoration: "none" }}
              _focus={{ boxShadow: "none" }}
              display="block"
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={3}
                px={4}
                py={3}
                bg={heroStripBg}
                borderBottomWidth="1px"
                borderColor={border}
                cursor="pointer"
              >
                <Box display="flex" alignItems="center" gap={2} minW={0}>
                  <Image
                    src="/brand/2026/icon.svg"
                    alt="VeeVee icon"
                    h={{ base: "15px", md: "18px" }}
                    w="auto"
                    objectFit="contain"
                    draggable="false"
                    filter={logoFilter}
                    flexShrink={0}
                  />
                  <Image
                    src="/brand/2026/wordmark.svg"
                    alt="VeeVee"
                    h={{ base: "7px", md: "9px" }}
                    w="auto"
                    objectFit="contain"
                    draggable="false"
                    filter={logoFilter}
                    flexShrink={0}
                  />
                </Box>
                <Text
                  fontSize={{ base: "xs", md: "sm" }}
                  fontWeight="700"
                  color="text.primary"
                  textAlign="right"
                  noOfLines={2}
                >
                  {currentHero.title}
                </Text>
              </Box>
            </CLink>

            <CLink as={RouterLink} to={APP_LINKS.internal.home} display="block">
              <Box position="relative" h={{ base: "440px", md: "540px" }} bg={heroStageBg}>
                {HERO_IMAGES.map((hero, index) => {
                  const isActive = index === activeHeroIndex;

                  return (
                    <Image
                      key={hero.src}
                      src={`${import.meta.env.BASE_URL}${hero.src}`}
                      alt={hero.alt}
                      objectFit="contain"
                      h="100%"
                      w="100%"
                      position="absolute"
                      inset={0}
                      p={{ base: 4, md: 5 }}
                      opacity={isActive ? 1 : 0}
                      transition="opacity 0.8s ease"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (hero.fallbackSrc && img.src.endsWith(".webp")) {
                          img.src = `${import.meta.env.BASE_URL}${hero.fallbackSrc}`;
                        }
                      }}
                    />
                  );
                })}
              </Box>
            </CLink>

            <Box
              position="absolute"
              bottom={4}
              left="50%"
              transform="translateX(-50%)"
              display="flex"
              alignItems="center"
              gap={2}
              px={3}
              py={2}
              borderRadius="full"
              bg="rgba(6, 37, 76, 0.46)"
              backdropFilter="blur(8px)"
            >
              {HERO_IMAGES.map((hero, index) => {
                const isActive = index === activeHeroIndex;

                return (
                  <Box
                    as="button"
                    key={hero.src}
                    type="button"
                    aria-label={`Show hero image ${index + 1}`}
                    onClick={() => setActiveHeroIndex(index)}
                    w={isActive ? "28px" : "10px"}
                    h="10px"
                    borderRadius="full"
                    bg={isActive ? "white" : "rgba(255,255,255,0.5)"}
                    transition="all 0.2s ease"
                  />
                );
              })}
            </Box>
          </Box>
        </Grid>

        <Box mt={{ base: 10, md: 14 }} maxW="6xl" mx="auto">
          <Box
            borderRadius="full"
            bg={pillBg}
            border="1px solid rgba(25, 37, 134, 0.5)"
            boxShadow="0 0 36px rgba(25, 37, 134, 0.35)"
            backdropFilter="blur(12px)"
            px={{ base: 6, md: 10 }}
            py={{ base: 6, md: 7 }}
          >
            <Text textAlign="center" fontSize={{ base: "sm", md: "md" }} color="#FFFFFF" mb={{ base: 4, md: 5 }}>
              Built for connected care, real-life decisions, and real hospital workflows.
            </Text>

            <Box overflow="hidden">
              <Box
                as="div"
                display="inline-flex"
                alignItems="center"
                animation={`${scrollLogos} 53s linear infinite`}
                opacity={0.85}
                columnGap={{ base: 8, md: 10 }}
              >
                {[...PAYOR_LOGOS, ...PAYOR_LOGOS].map((logo, idx) => (
                  <Box
                    key={`${logo.alt}-${idx}`}
                    minW={{ base: "90px", md: "110px" }}
                    maxW={{ base: "110px", md: "130px" }}
                    h={{ base: "32px", md: "36px" }}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      maxH="100%"
                      maxW="100%"
                      objectFit="contain"
                      opacity={0.92}
                      filter={payorLogoFilter}
                      _hover={{ opacity: 1 }}
                      loading="lazy"
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
