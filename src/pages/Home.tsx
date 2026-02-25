import {
  Box,
  Button,
  Heading,
  Stack,
  Text,
  Image,
  Grid,
  useColorModeValue,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { Link as CLink } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

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

export default function Home() {
  const heroWebpSrc = `${import.meta.env.BASE_URL}images/marketing/hero-2026-v2.webp`;
  const heroJpgSrc = `${import.meta.env.BASE_URL}images/marketing/hero-2026.jpg`;
  const pageGradient = useColorModeValue(
    "linear(to-b, #FFFFFF, #9CE7FF)",
    "linear(to-b, surface.900, surface.800)"
  );
  const heroCardBg = useColorModeValue("bg.elevated", "bg.elevated");
  const heroStripBg = useColorModeValue("brand.50", "surface.700");
  const border = useColorModeValue("border.default", "border.default");
  const muted = useColorModeValue("text.muted", "text.muted");
  const subtle = useColorModeValue("text.subtle", "text.subtle");
  const pillBg = "surface.900";
  const logoFilter = useColorModeValue("none", "invert(1)");

  return (
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
            as={CLink}
            href="https://veevee.io"
            _hover={{ textDecoration: "none" }}
            _focus={{ outline: "none" }}
          >
            Why VeeVee
          </Text>

          <CLink
            href="https://veevee.io"
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
              Take control.
              <Box as="span" color="accent.primary">
                {" "}Get the right care. Every time.
              </Box>
            </Heading>
          </CLink>

          <Text fontSize={{ base: "md", md: "lg" }} maxW="lg" color={muted}>
            We help you take control of your healthcare by unlocking your benefits and guiding you to the right care.
          </Text>

          <Stack spacing={3}>
            <Button
              as="a"
              href="https://veevee.io/"
              size="lg"
              borderRadius="full"
              fontWeight="700"
              px={10}
              boxShadow="0 0 40px rgba(17, 119, 186, 0.45)"
            >
              Check my coverage
            </Button>

            <Text fontSize="sm" color={subtle}>
              Insurance | Recommendations | Health Records
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
            href="https://veevee.io"
            _hover={{ textDecoration: "none" }}
            _focus={{ boxShadow: "none" }}
            display="block"
          >
            <Box
              display="flex"
              alignItems="center"
              gap={2}
              px={4}
              py={3}
              bg={heroStripBg}
              borderBottomWidth="1px"
              borderColor={border}
              cursor="pointer"
            >
              <Image
                src="/brand/2026/combined.svg"
                alt="VeeVee"
                h={{ base: "28px", md: "32px" }}
                w="auto"
                objectFit="contain"
                draggable="false"
                filter={logoFilter}
              />
            </Box>
          </CLink>

          <CLink href="https://veevee.io" isExternal>
            <Image
              src={heroWebpSrc}
              alt="VeeVee marketing image showing connected care and benefits optimization"
              objectFit="cover"
              maxH="420px"
              w="100%"
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src.endsWith(".webp")) {
                  img.src = heroJpgSrc;
                  return;
                }
              }}
            />
          </CLink>
        </Box>
      </Grid>

      <Box mt={{ base: 10, md: 14 }} maxW="6xl" mx="auto">
        <Stack spacing={2} mb={5}>
          <Text
            fontSize="xs"
            textTransform="uppercase"
            letterSpacing="0.16em"
            color="accent.soft"
          >
            How VeeVee helps you
          </Text>
          <CLink
            as={RouterLink}
            to="/features"
            _hover={{ textDecoration: "none" }}
            _focus={{ boxShadow: "none" }}
            w="fit-content"
          >
            <Heading as="h2" size={{ base: "md", md: "lg" }} color="text.primary">
              Core Features →
            </Heading>
          </CLink>
        </Stack>
      </Box>

      <Box mt={{ base: 10, md: 14 }} maxW="6xl" mx="auto" px={{ base: 4, md: 6 }}>
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
            Built for real people across real plans, from national insurers to
            employer coverage.
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
                    opacity={0.9}
                    filter="grayscale(1) brightness(1.6) contrast(1.2)"
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
  );
}
