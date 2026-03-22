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

const scrollLogos = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

export default function Home() {
  const { isOpen, onOpen, onClose } = useDisclosure();
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
  const pillBg = "accent.primary";
  const logoFilter = useColorModeValue("none", "invert(1)");
  const payorLogoFilter = "grayscale(1) brightness(0) invert(1) contrast(1.05)";
  const audienceCardBg = useColorModeValue("rgba(255, 255, 255, 0.78)", "rgba(6, 37, 76, 0.72)");
  const modalBg = useColorModeValue("white", "surface.800");
  const tableHeadBg = useColorModeValue("brand.50", "surface.700");
  const positiveColor = useColorModeValue("green.600", "green.300");

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
              to={APP_LINKS.cta.getStarted}
              _hover={{ textDecoration: "none" }}
              _focus={{ outline: "none" }}
            >
              For patients and hospitals
            </Text>

            <CLink
              as={RouterLink}
              to={APP_LINKS.cta.getStarted}
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
                One AI platform.<br></br>
                <Box as="span" color="accent.primary">
                  {" "}Better health decisions.
                </Box>
              </Heading>
            </CLink>

            <Text fontSize={{ base: "md", md: "lg" }} maxW="lg" color={muted}>
              VeeVee is a health companion for people and a high-performance edge AI ecosystem for hospitals, connecting everyday guidance, benefits discovery, doctor engagement, monitoring, and digital twin simulation with real-time clinical intelligence.
            </Text>

            <Stack spacing={3}>
              <Button
                as={RouterLink}
                to={APP_LINKS.cta.checkBenefits}
                size="lg"
                borderRadius="full"
                fontWeight="700"
                px={10}
                boxShadow="0 0 40px rgba(17, 119, 186, 0.45)"
              >
                How It Works
              </Button>

              <Text fontSize="sm" color={subtle} textAlign={{ base: "center", md: "left" }}>
                Benefits | Care Guidance | Doctor Connection | Edge AI
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
              to={APP_LINKS.cta.getStarted}
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
                  src="/brand/2026/icon.svg"
                  alt="VeeVee icon"
                  h={{ base: "20px", md: "24px" }}
                  w="auto"
                  objectFit="contain"
                  draggable="false"
                  filter={logoFilter}
                />
                <Image
                  src="/brand/2026/wordmark.svg"
                  alt="VeeVee"
                  h={{ base: "9px", md: "11px" }}
                  w="auto"
                  objectFit="contain"
                  draggable="false"
                  filter={logoFilter}
                />
              </Box>
            </CLink>

            <CLink as={RouterLink} to={APP_LINKS.cta.getStarted}>
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
                For patients
              </Text>
              <Heading as="h3" size="md" mb={3}>
                A health companion that stays with you between visits.
              </Heading>
              <Text color={muted}>
                Discover benefits and perks, get answers to everyday health questions, stay connected to your doctors, monitor your health, and build a digital twin that lets you explore what-if scenarios with your own avatar.
              </Text>
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
                Edge AI built for the modern hospital.
              </Heading>
              <Text color={muted} mb={4}>
                Deploy real-time, low-latency agentic computer vision and automated clinical documentation to support continuous vigilance, reduce fall and hygiene risk, replace labor-intensive observation workflows, and create new revenue opportunities.
              </Text>
              <Button onClick={onOpen} size="sm" borderRadius="full" fontWeight="700">
                See the VeeVee Value table
              </Button>
            </Box>
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
            <Text textAlign="center" fontSize={{ base: "sm", md: "md" }} color="#FFFFFF" mb={{ base: 4, md: 5 }}>
              Built to navigate real plans, real care decisions, and the real operational demands facing modern health systems.
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

      <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered scrollBehavior="inside">
        <ModalOverlay bg="rgba(6, 37, 76, 0.55)" backdropFilter="blur(6px)" />
        <ModalContent bg={modalBg} borderWidth="1px" borderColor={border} borderRadius="2xl">
          <ModalHeader pr={12}>The VeeVee Value</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing={6}>
              <Text color={muted} maxW="4xl">
                Conservative 2026 hospital economics using a $199 per bed per month rollout, showing how billing, sitter replacement, and risk reduction combine to make the model cash-flow positive quickly.
              </Text>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Box borderWidth="1px" borderColor={border} borderRadius="xl" p={4}>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="accent.soft" mb={2}>
                    Revenue engine
                  </Text>
                  <Heading as="h3" size="sm" mb={2}>
                    1 billed RPM/RTM patient can cover 1 bed-month
                  </Heading>
                  <Text color={muted} fontSize="sm">
                    Using an average of about $200 per month across device supply, setup, and monitoring-management reimbursement.
                  </Text>
                </Box>

                <Box borderWidth="1px" borderColor={border} borderRadius="xl" p={4}>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="accent.soft" mb={2}>
                    Labor savings
                  </Text>
                  <Heading as="h3" size="sm" mb={2}>
                    3 full-time sitters can fund 100+ beds
                  </Heading>
                  <Text color={muted} fontSize="sm">
                    Based on 2026 sitter costs of roughly $25 to $45 per hour, or about $600 to $1,080 per day.
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
                    A single fall with injury can mean about $14,056 in direct cost and up to $60,000 in litigation exposure.
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
                Illustrative model for sales conversations. Actual results depend on patient eligibility, hospital staffing patterns, documentation workflows, payer mix, utilization, and local reimbursement performance.
              </Text>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
