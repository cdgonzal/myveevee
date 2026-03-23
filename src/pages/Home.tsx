import {
  Box,
  Button,
  Grid,
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useEffect, useState } from "react";
import { Link as CLink } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
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

const HOSPITAL_VALUE_ROWS = [
  {
    rollout: "75-bed rollout",
    monthlyCost: "$14,925",
    revenue: "$10,000",
    laborSavings: "$18,000",
    netImpact: "+$13,075",
    payback: "Month 1",
    valueNote: "Cash-flow positive from the first invoice under the subscription model.",
  },
  {
    rollout: "150-bed rollout",
    monthlyCost: "$29,850",
    revenue: "$20,000",
    laborSavings: "$54,000",
    netImpact: "+$44,150",
    payback: "Month 1",
    valueNote: "Plus avoided fall-event exposure, documentation lift, and broader vigilance coverage.",
  },
];

const PATIENT_STEPS = [
  {
    number: "1",
    title: "Tell us what's happening",
    detail: "Type it. Say it. Upload a photo. VeeVee listens and understands. Free and instant.",
  },
  {
    number: "2",
    title: "Get clear guidance",
    detail: "See what might be going on and what to do next. Simple, personalized answers for free.",
  },
  {
    number: "3",
    title: "Take the next step",
    detail: "Know where to go, what to ask, and whether your plan covers it.",
  },
];

const scrollLogos = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const HERO_IMAGES = [
  {
    webp: "images/marketing/car1.webp",
    jpg: "images/marketing/car1.jpg",
    alt: "VeeVee carousel slide showing everyday wellness support",
    title: "Everyday support that feels simple",
  },
  {
    webp: "images/marketing/car2.webp",
    jpg: "images/marketing/car2.jpg",
    alt: "VeeVee carousel slide showing care that stays connected",
    title: "Clear next steps, without the stress",
  },
  {
    webp: "images/marketing/car3.webp",
    jpg: "images/marketing/car3.jpg",
    alt: "VeeVee carousel slide showing support after the visit",
    title: "Support that stays with you",
  },
  {
    webp: "images/marketing/car4.webp",
    jpg: "images/marketing/car4.jpg",
    alt: "VeeVee carousel slide showing a connected care experience",
    title: "Be your ideal self",
  },
];

export default function Home() {
  const {
    isOpen: isPatientOpen,
    onOpen: onPatientOpen,
    onClose: onPatientClose,
  } = useDisclosure();
  const {
    isOpen: isValueOpen,
    onOpen: onValueOpen,
    onClose: onValueClose,
  } = useDisclosure();
  const {
    isOpen: isArchitectureOpen,
    onOpen: onArchitectureOpen,
    onClose: onArchitectureClose,
  } = useDisclosure();
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
  const audienceCardBg = useColorModeValue("rgba(255, 255, 255, 0.78)", "rgba(6, 37, 76, 0.72)");
  const modalBg = useColorModeValue("white", "surface.800");
  const tableHeadBg = useColorModeValue("brand.50", "surface.700");
  const positiveColor = useColorModeValue("green.600", "green.300");
  const nvidiaAccent = "#76B900";
  const nvidiaSoftBg = useColorModeValue("rgba(118, 185, 0, 0.08)", "rgba(118, 185, 0, 0.14)");
  const heroStageBg = useColorModeValue("rgba(255, 255, 255, 0.94)", "rgba(6, 37, 76, 0.88)");
  const stepCircleColor = "white";
  const freeAccent = useColorModeValue("#001A52", "#9CE7FF");
  const currentHero = HERO_IMAGES[activeHeroIndex];

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveHeroIndex((current) => (current + 1) % HERO_IMAGES.length);
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, []);

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
              For everyone, for free. 
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
              Connected wellness.<br></br>
              <Box as="span" color="accent.primary">
                {" "}Peace of mind.
              </Box>
            </Heading>
            </CLink>

            <Text fontSize={{ base: "md", md: "lg" }} maxW="lg" color={muted}>
              VeeVee connects your care across life. From everyday wellness to hospital recovery and everything in between. Built to be simple, safe, private, and ready when you need it.
            </Text>

            <Stack spacing={3}>
              <Button
                as={RouterLink}
                to={APP_LINKS.internal.whyVeeVee}
                size="lg"
                borderRadius="full"
                fontWeight="700"
                px={10}
                boxShadow="0 0 40px rgba(17, 119, 186, 0.45)"
              >
                Explore Your Wellness Journey
              </Button>

              <Text fontSize="sm" color={subtle} textAlign={{ base: "center", md: "left" }}>
                Connected | Private | Fast
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
              <Box
                position="relative"
                h={{ base: "440px", md: "540px" }}
                bg={heroStageBg}
              >
                {HERO_IMAGES.map((hero, index) => {
                  const isActive = index === activeHeroIndex;

                  return (
                    <Image
                      key={hero.webp}
                      src={`${import.meta.env.BASE_URL}${hero.webp}`}
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
                        if (img.src.endsWith(".webp")) {
                          img.src = `${import.meta.env.BASE_URL}${hero.jpg}`;
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
                    key={hero.webp}
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

        <Box mt={{ base: 10, md: 14 }} maxW="6xl" mx="auto">
          <Stack spacing={2} mb={5}>
            <Text
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="0.16em"
              color="accent.soft"
            >
              Shared value across care
            </Text>
            <CLink
              as={RouterLink}
              to={APP_LINKS.internal.whyVeeVee}
              _hover={{ textDecoration: "none" }}
              _focus={{ boxShadow: "none" }}
              w="fit-content"
            >
              <Heading as="h2" size={{ base: "md", md: "lg" }} color="text.primary">
                Core Features -&gt;
              </Heading>
            </CLink>
          </Stack>
        </Box>

        <Box maxW="6xl" mx="auto">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
            <Box
              bg={audienceCardBg}
              borderWidth="1px"
              borderColor={border}
              borderRadius="2xl"
              boxShadow="0 12px 32px rgba(6, 37, 76, 0.12)"
              p={{ base: 5, md: 6 }}
              backdropFilter="blur(14px)"
            >
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="accent.soft" mb={2}>
                For everyday users
              </Text>
              <Heading as="h3" size="md" mb={3}>
                Support that stays with you after the visit.
              </Heading>
              <Text color={muted}>
                Ask everyday questions, find benefits and perks, stay connected to your care, and feel more supported at home in a way that stays personal, private, and easy to understand.
              </Text>
              <Button onClick={onPatientOpen} size="sm" borderRadius="full" fontWeight="700" alignSelf="flex-start">
                Explore Your Wellness Journey
              </Button>
            </Box>

            <Box
              bg={audienceCardBg}
              borderWidth="1px"
              borderColor={border}
              borderRadius="2xl"
              boxShadow="0 12px 32px rgba(6, 37, 76, 0.12)"
              p={{ base: 5, md: 6 }}
              backdropFilter="blur(14px)"
            >
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="accent.soft" mb={2}>
                For hospitals
              </Text>
              <Heading as="h3" size="md" mb={3}>
                Better visibility from bedside to home.
              </Heading>
              <Text color={muted} mb={4}>
                VeeVee helps users uncover their benefits, hospitals watch over patients, catch risk sooner, reduce busywork, and stay more connected to what happens after discharge.
              </Text>
              <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
                <Button onClick={onValueOpen} size="sm" borderRadius="full" fontWeight="700">
                  See the VeeVee Value table
                </Button>
                <Button
                  onClick={onArchitectureOpen}
                  size="sm"
                  borderRadius="full"
                  fontWeight="700"
                  variant="outline"
                  borderColor={nvidiaAccent}
                  color={nvidiaAccent}
                  _hover={{ bg: nvidiaSoftBg }}
                >
                  See the technology:
                </Button>
              </Stack>
            </Box>
          </SimpleGrid>
        </Box>

        <Box mt={{ base: 10, md: 12 }} maxW="6xl" mx="auto">
          <Box
            borderWidth="1px"
            borderColor={border}
            borderRadius="2xl"
            bg={nvidiaSoftBg}
            boxShadow="0 18px 40px rgba(6, 37, 76, 0.10)"
            p={{ base: 5, md: 7 }}
          >
            <Stack spacing={5}>
              <Text
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="0.16em"
                color={nvidiaAccent}
                fontWeight="700"
              >
                Technology backbone
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 5, md: 8 }}>
                <Stack spacing={3}>
                  <Heading as="h3" size="md" color="text.primary">
                    Safe, fast technology behind connected care.
                  </Heading>
                  <Text color={muted}>
                    VeeVee runs on NVIDIA-based technology so it can keep video local, respond quickly, and support both bedside workflows and the app experience without overcomplicating the experience.
                  </Text>
                </Stack>
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                  <Box borderWidth="1px" borderColor={border} borderRadius="xl" bg={audienceCardBg} p={4}>
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color={nvidiaAccent} mb={2}>
                      Private by design
                    </Text>
                    <Text fontSize="sm" color={muted}>
                      Sensitive bedside video can stay local instead of being pushed to the cloud.
                    </Text>
                  </Box>
                  <Box borderWidth="1px" borderColor={border} borderRadius="xl" bg={audienceCardBg} p={4}>
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color={nvidiaAccent} mb={2}>
                      Fast alerts
                    </Text>
                    <Text fontSize="sm" color={muted}>
                      The system is tuned to spot urgent moments quickly, including fall-risk events.
                    </Text>
                  </Box>
                  <Box borderWidth="1px" borderColor={border} borderRadius="xl" bg={audienceCardBg} p={4}>
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color={nvidiaAccent} mb={2}>
                      Ready for the unit
                    </Text>
                    <Text fontSize="sm" color={muted}>
                      VeeVee is built to handle many rooms and many streams at once.
                    </Text>
                  </Box>
                  <Box borderWidth="1px" borderColor={border} borderRadius="xl" bg={audienceCardBg} p={4}>
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color={nvidiaAccent} mb={2}>
                      Smooth app experience
                    </Text>
                    <Text fontSize="sm" color={muted}>
                      The same foundation helps power simulation, guidance, and a smooth VeeVee app experience.
                    </Text>
                  </Box>
                </SimpleGrid>
              </SimpleGrid>
            </Stack>
          </Box>
        </Box>

      </Box>

      <Modal isOpen={isPatientOpen} onClose={onPatientClose} size="5xl" isCentered scrollBehavior="inside">
        <ModalOverlay bg="rgba(6, 37, 76, 0.55)" backdropFilter="blur(6px)" />
        <ModalContent bg={modalBg} borderWidth="1px" borderColor={border} borderRadius="2xl">
          <ModalHeader pr={12}>How VeeVee Works for Patients</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing={6}>
              <Box>
                <Text
                  fontSize="xs"
                  letterSpacing="0.18em"
                  textTransform="uppercase"
                  color="accent.soft"
                  mb={3}
                >
                  How it works
                </Text>
                <Heading as="h2" size="lg" fontWeight="800" mb={3}>
                  Your health questions answered in 3 simple steps.
                </Heading>
                <Text color={muted} maxW="3xl">
                  Start <Box as="span" fontWeight="800" color={freeAccent}>free</Box>. Tell VeeVee what is going on and get calm, clear next steps.
                </Text>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 4, md: 6 }}>
                {PATIENT_STEPS.map((step) => (
                  <Box
                    key={step.number}
                    bg="bg.surface"
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor={border}
                    boxShadow="0 10px 24px rgba(6, 37, 76, 0.10)"
                    p={5}
                  >
                    <Box
                      w={14}
                      h={14}
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="800"
                      fontSize="2xl"
                      bg="accent.primary"
                      color={stepCircleColor}
                      border="2px solid"
                      borderColor="white"
                      boxShadow="0 0 0 2px rgba(0, 26, 82, 0.32)"
                      mb={3}
                    >
                      {step.number}
                    </Box>
                    <Heading as="h3" size="sm" mb={2} color="accent.soft">
                      {step.title}
                    </Heading>
                    <Text fontSize="sm" color="text.primary">
                      {step.detail.split(/(free|Free)/g).map((part, partIndex) =>
                        part.toLowerCase() === "free" ? (
                          <Box as="span" key={`${step.number}-free-${partIndex}`} fontWeight="800" color={freeAccent}>
                            {part}
                          </Box>
                        ) : (
                          <Box as="span" key={`${step.number}-${partIndex}`}>
                            {part}
                          </Box>
                        )
                      )}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>

              <Stack spacing={4} textAlign="center">
                <Heading as="h3" size="md">
                  Curious what happens next?
                </Heading>
                <Text fontSize="sm" color={muted} maxW="2xl" mx="auto">
                  Try a free health scenario and see how VeeVee responds before you create an account.
                </Text>
                <Button
                  as={RouterLink}
                  to={APP_LINKS.internal.simulator}
                  onClick={onPatientClose}
                  size="md"
                  borderRadius="full"
                  fontWeight="700"
                  px={8}
                  alignSelf="center"
                  boxShadow="0 0 28px rgba(17, 119, 186, 0.35)"
                >
                  Try it free
                </Button>
                <CLink
                  href={APP_LINKS.external.authenticatedConsole}
                  isExternal
                  color="accent.soft"
                  fontSize="sm"
                  fontWeight="600"
                  textDecoration="underline"
                >
                  Already have an account? Log in
                </CLink>
              </Stack>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isValueOpen} onClose={onValueClose} size="6xl" isCentered scrollBehavior="inside">
        <ModalOverlay bg="rgba(6, 37, 76, 0.55)" backdropFilter="blur(6px)" />
        <ModalContent bg={modalBg} borderWidth="1px" borderColor={border} borderRadius="2xl">
          <ModalHeader pr={12}>The VeeVee Value</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing={6}>
              <Text color={muted} maxW="4xl">
                A simple way to think about value: VeeVee can help hospitals bring in new revenue, reduce labor costs, and lower risk, often making the system pay for itself quickly.
              </Text>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Box borderWidth="1px" borderColor={border} borderRadius="xl" p={4}>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="accent.soft" mb={2}>
                    Revenue engine
                  </Text>
                  <Heading as="h3" size="sm" mb={2}>
                    One billed patient can cover one bed-month
                  </Heading>
                  <Text color={muted} fontSize="sm">
                    With RPM or RTM billing, one patient can roughly cover the monthly cost of one VeeVee bed.
                  </Text>
                </Box>

                <Box borderWidth="1px" borderColor={border} borderRadius="xl" p={4}>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="accent.soft" mb={2}>
                    Labor savings
                  </Text>
                  <Heading as="h3" size="sm" mb={2}>
                    Replacing sitters changes the math fast
                  </Heading>
                  <Text color={muted} fontSize="sm">
                    Even a small drop in 1:1 sitter use can offset a large part of the rollout.
                  </Text>
                </Box>

                <Box borderWidth="1px" borderColor={border} borderRadius="xl" p={4}>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="accent.soft" mb={2}>
                    Risk mitigation
                  </Text>
                  <Heading as="h3" size="sm" mb={2}>
                    One prevented fall matters
                  </Heading>
                  <Text color={muted} fontSize="sm">
                    Fewer falls and safer workflows can protect both patients and hospital budgets.
                  </Text>
                </Box>
              </SimpleGrid>

              <Box>
                <Heading as="h3" size="sm" mb={3}>
                  Summary: The VeeVee Value Table
                </Heading>
                <TableContainer borderWidth="1px" borderColor={border} borderRadius="xl" overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead bg={tableHeadBg}>
                      <Tr>
                        <Th>Rollout</Th>
                        <Th isNumeric>Monthly cost</Th>
                        <Th isNumeric>New revenue</Th>
                        <Th isNumeric>Labor savings</Th>
                        <Th isNumeric>Net monthly impact</Th>
                        <Th>Payback period</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {HOSPITAL_VALUE_ROWS.map((row) => (
                        <Tr key={row.rollout}>
                          <Td fontWeight="700">{row.rollout}</Td>
                          <Td isNumeric>{row.monthlyCost}</Td>
                          <Td isNumeric>{row.revenue}</Td>
                          <Td isNumeric>{row.laborSavings}</Td>
                          <Td isNumeric color={positiveColor} fontWeight="700">
                            {row.netImpact}
                          </Td>
                          <Td fontWeight="700">{row.payback}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {HOSPITAL_VALUE_ROWS.map((row) => (
                  <Box key={`${row.rollout}-note`} borderWidth="1px" borderColor={border} borderRadius="xl" p={4}>
                    <Heading as="h4" size="xs" mb={2}>
                      {row.rollout}
                    </Heading>
                    <Text color={muted} fontSize="sm">
                      {row.valueNote}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>

              <Text fontSize="xs" color={subtle}>
                Illustrative example only. Actual results depend on staffing, patient mix, workflows, reimbursement, and rollout design.
              </Text>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isArchitectureOpen} onClose={onArchitectureClose} size="6xl" isCentered scrollBehavior="inside">
        <ModalOverlay bg="rgba(6, 37, 76, 0.55)" backdropFilter="blur(6px)" />
        <ModalContent bg={modalBg} borderWidth="1px" borderColor={border} borderRadius="2xl">
          <ModalHeader pr={12}>The VeeVee Technology Backbone</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing={6}>
              <Text color={muted} maxW="4xl">
                The technical foundation matters, but the goal is simple: keep VeeVee fast, private, and reliable. NVIDIA technology helps us do that behind the scenes.
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box borderWidth="1px" borderColor={border} borderRadius="xl" p={5} bg={nvidiaSoftBg}>
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

                <Box borderWidth="1px" borderColor={border} borderRadius="xl" p={5}>
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

                <Box borderWidth="1px" borderColor={border} borderRadius="xl" p={5}>
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

                <Box borderWidth="1px" borderColor={border} borderRadius="xl" p={5} bg={nvidiaSoftBg}>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color={nvidiaAccent} mb={2}>
                    Mobile app intelligence
                  </Text>
                  <Heading as="h3" size="sm" mb={2}>
                    Simulation and app intelligence
                  </Heading>
                  <Text color={muted} fontSize="sm">
                    The same core technology helps power VeeVee Simulator®, personalized guidance, and a fast app experience.
                  </Text>
                </Box>
              </SimpleGrid>

              <Box borderWidth="1px" borderColor={border} borderRadius="xl" p={5}>
                <Heading as="h3" size="sm" mb={3}>
                  What this means in plain English
                </Heading>
                <Text color={muted} fontSize="sm">
                  VeeVee is designed to keep private data closer to home, respond quickly, and feel smooth to use. The technology matters because it helps people feel safer and more supported.
                </Text>
              </Box>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
