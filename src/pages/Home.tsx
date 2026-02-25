import {
  Box,
  Button,
  Heading,
  Stack,
  Text,
  Image,
  Grid,
  SimpleGrid,
  Card,
  CardBody,
  useColorModeValue,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { Link as CLink } from "@chakra-ui/react";

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

const PILLARS = [
  {
    title: "Instant Triage From Any Input",
    text: "Upload a photo, type what is happening, or speak naturally. VeeVee rapidly triages your situation and guides you to care pathways, pharmacy options, and treatment next steps.",
  },
  {
    title: "My Digital Twin",
    text: "Build a personalized simulation of your health profile so you can test what-if scenarios and understand how changes may impact your wellness over time.",
  },
  {
    title: "My True Me Profile",
    text: "Unify medical history, genetics, and wearable signals in one living profile so guidance reflects who you are right now, not generic averages.",
  },
  {
    title: "Benefits Maximizer",
    text: "Match care decisions to your real plan details and uncover how to maximize covered care and lower avoidable out-of-pocket costs.",
  },
];

export default function Home() {
  const pageGradient = useColorModeValue(
    "linear(to-b, #FFFFFF, #9CE7FF)",
    "linear(to-b, surface.900, surface.800)"
  );
  const heroCardBg = useColorModeValue("bg.elevated", "bg.elevated");
  const heroStripBg = useColorModeValue("brand.50", "surface.700");
  const border = useColorModeValue("border.default", "border.default");
  const muted = useColorModeValue("text.muted", "text.muted");
  const subtle = useColorModeValue("text.subtle", "text.subtle");
  const pillBg = useColorModeValue("#FFFFFF", "surface.900");
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
              Instant health clarity,
              <Box as="span" color="accent.primary">
                {" "}built around you.
              </Box>
            </Heading>
          </CLink>

          <Text fontSize={{ base: "md", md: "lg" }} maxW="lg" color={muted}>
            One app to triage quickly, simulate outcomes with your digital twin,
            unify your true health profile, and maximize coverage for the care
            you actually need.
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
              Start at VeeVee.io
            </Button>

            <Text fontSize="sm" color={subtle}>
              Personalized triage | Benefits-aware guidance | Encrypted
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
              src="/hero_44.png"
              alt="Patient talking with doctor using VeeVee"
              objectFit="cover"
              maxH="420px"
              w="100%"
            />
          </CLink>
        </Box>
      </Grid>

      <Box mt={{ base: 10, md: 14 }} maxW="6xl" mx="auto">
        <Stack spacing={3} mb={5}>
          <Text
            fontSize="xs"
            textTransform="uppercase"
            letterSpacing="0.16em"
            color="accent.soft"
          >
            The Core Experience
          </Text>
          <Heading as="h2" size={{ base: "md", md: "lg" }} color="text.primary">
            Four reasons people choose VeeVee
          </Heading>
        </Stack>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {PILLARS.map((pillar) => (
            <Card key={pillar.title} bg="bg.surface" borderColor={border} borderWidth="1px" borderRadius="2xl">
              <CardBody>
                <Heading as="h3" size="sm" mb={3} color="accent.soft">
                  {pillar.title}
                </Heading>
                <Text fontSize="sm" color="text.primary">
                  {pillar.text}
                </Text>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
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
          <Text textAlign="center" fontSize={{ base: "sm", md: "md" }} color="text.primary" mb={{ base: 4, md: 5 }}>
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


