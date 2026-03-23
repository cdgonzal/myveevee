import {
  Box,
  Button,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import { APP_LINKS } from "../config/links";

const MotionBox = motion(Box);

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

type FeatureBlock = {
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
};

const FEATURE_BLOCKS: FeatureBlock[] = [
  {
    eyebrow: "Platform",
    title: "One platform, many users",
    body:
      "The same platform can support everyone. Users, families, nurses, doctors, and hospital teams without forcing each group into a separate experience.",
    points: [
      "Better coordination across the wellness journey.",
      "Stronger personalized engagement.",
      "A more connected and modern experience.",
    ],
  },
  {
    eyebrow: "Safety",
    title: "Safer monitoring and faster response",
    body:
      "VeeVee supports monitoring in ways that help teams catch concerns sooner while keeping the experience simple.",
    points: [
      "Risk signals can be noticed earlier.",
      "Hospitals can reduce avoidable busywork.",
      "Sensitive information can stay closer to home.",
    ],
  },
  {
    eyebrow: "Transition",
    title: "Hospital-to-home connection",
    body:
      "VeeVee helps care continue before, during, and after discharge instead of stopping at the clinical door.",
    points: [
      "Users stay connected after they go home.",
      "Families can stay involved and informed.",
      "Nurses and doctors can keep a clearer view of progress.",
    ],
  },
  {
    eyebrow: "Family",
    title: "Family engagement without more confusion",
    body:
      "Loved ones often want to help but do not know what is happening. VeeVee makes it easier for families to feel included and useful.",
    points: [
      "A shared view of updates and next steps.",
      "More meaningful support between visits.",
      "Less stress around handoffs and recovery.",
    ],
  },
  {
    eyebrow: "Care team",
    title: "Better visibility for care teams",
    body:
      "Doctors, nurses, care managers, and hospitals all benefit when the patient story is easier to follow.",
    points: [
      "Health context is easier to review.",
      "Questions and changes are easier to spot.",
      "Patients show up more prepared and engaged.",
    ],
  },
  {
    eyebrow: "Clarity",
    title: "Guidance people can actually use",
    body:
      "Patients want plain answers. Providers want better follow-through. Hospitals want smoother transitions. VeeVee helps all three.",
    points: [
      "Everyday questions answered more clearly.",
      "Benefits and coverage easier to understand.",
      "Next steps feel simpler, calmer, and more actionable.",
    ],
  },
];

export default function Features() {
  const pageGradient = useColorModeValue(
    "linear(to-b, #FFFFFF, #9CE7FF)",
    "linear(to-b, surface.900, surface.800)"
  );
  const border = useColorModeValue("border.default", "border.default");
  const muted = useColorModeValue("text.muted", "text.muted");
  const introBg = useColorModeValue("rgba(255, 255, 255, 0.78)", "rgba(6, 37, 76, 0.72)");
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.82)", "rgba(6, 37, 76, 0.66)");
  const heroPanelBg = useColorModeValue("rgba(255, 255, 255, 0.70)", "rgba(6, 37, 76, 0.58)");
  const accentSurface = useColorModeValue("rgba(17, 119, 186, 0.08)", "rgba(17, 119, 186, 0.16)");

  return (
    <Box
      as="main"
      minH="100vh"
      bgGradient={pageGradient}
      color="text.primary"
      py={{ base: 10, md: 20 }}
    >
      <Stack spacing={{ base: 10, md: 14 }} maxW="6xl" mx="auto" px={{ base: 6, md: 10 }}>
        <MotionBox variants={fadeUp} initial="hidden" animate="visible">
          <Box
            bg={heroPanelBg}
            borderWidth="1px"
            borderColor={border}
            borderRadius="3xl"
            boxShadow="0 24px 50px rgba(6, 37, 76, 0.12)"
            px={{ base: 5, md: 8 }}
            py={{ base: 6, md: 8 }}
          >
            <Stack spacing={6}>
              <Stack spacing={3} textAlign="center">
                <Text
                  fontSize="sm"
                  letterSpacing="0.18em"
                  textTransform="uppercase"
                  color="accent.soft"
                >
                  FEATURES
                </Text>
                <Heading as="h1" size={{ base: "lg", md: "xl" }} fontWeight="800">
                  A connected care experience from hospital to home.
                </Heading>
                <Text fontSize={{ base: "md", md: "lg" }} maxW="3xl" mx="auto" color="text.primary">
                  VeeVee works best when everyone communicates and stays connected: the users, the family, the nurse, the doctor, and the hospital team.
                </Text>
              </Stack>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Box borderWidth="1px" borderColor={border} borderRadius="2xl" bg={accentSurface} p={4}>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color="accent.soft" mb={2}>
                    Before
                  </Text>
                  <Text fontSize="sm" color="text.primary">
                    Better understanding and an accurate history.
                  </Text>
                </Box>
                <Box borderWidth="1px" borderColor={border} borderRadius="2xl" bg={accentSurface} p={4}>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color="accent.soft" mb={2}>
                    During
                  </Text>
                  <Text fontSize="sm" color="text.primary">
                    Everyone stays engaged while wellness goals are achieved.
                  </Text>
                </Box>
                <Box borderWidth="1px" borderColor={border} borderRadius="2xl" bg={accentSurface} p={4}>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color="accent.soft" mb={2}>
                    After
                  </Text>
                  <Text fontSize="sm" color="text.primary">
                    Nurses, doctors, and hospitals get continued visibility with less friction.
                  </Text>
                </Box>
              </SimpleGrid>
            </Stack>
          </Box>
        </MotionBox>

        <Box
          bg={introBg}
          borderWidth="1px"
          borderColor={border}
          borderRadius="2xl"
          boxShadow="0 18px 40px rgba(6, 37, 76, 0.10)"
          p={{ base: 5, md: 7 }}
        >
          <Stack spacing={4}>
            <Heading as="h2" size="md">
              What everyoe is asking for
            </Heading>
            <Text color={muted}>
              Support. People want support. Families want to stay involved. Nurses and doctors want better visibility. Hospitals want safer monitoring and smoother transitions. VeeVee brings those needs together without making the experience feel heavy or complicated.
            </Text>
          </Stack>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
          {FEATURE_BLOCKS.map((feature, index) => (
            <MotionBox
              key={feature.title}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.04 }}
            >
              <Box
                bg={cardBg}
                borderWidth="1px"
                borderColor={border}
                borderRadius="2xl"
                boxShadow="0 14px 34px rgba(6, 37, 76, 0.10)"
                p={{ base: 5, md: 6 }}
                h="100%"
                position="relative"
                overflow="hidden"
              >
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  h="4px"
                  bgGradient="linear(to-r, #1177BA, #9CE7FF)"
                />
                <Stack spacing={4}>
                  <Text
                    fontSize="xs"
                    textTransform="uppercase"
                    letterSpacing="0.16em"
                    color="accent.soft"
                  >
                    {feature.eyebrow}
                  </Text>
                  <Heading as="h3" size="md">
                    {feature.title}
                  </Heading>
                  <Text color={muted}>{feature.body}</Text>
                  <Stack spacing={2}>
                    {feature.points.map((point) => (
                      <Text key={point} fontSize="sm" color="text.primary">
                        - {point}
                      </Text>
                    ))}
                  </Stack>
                </Stack>
              </Box>
            </MotionBox>
          ))}
        </SimpleGrid>

        <Box
          borderWidth="1px"
          borderColor={border}
          borderRadius="2xl"
          bg={introBg}
          p={{ base: 5, md: 7 }}
        >
          <Stack spacing={4} textAlign="center">
            <Heading as="h2" size="md">
              Especially powerful after discharge
            </Heading>
            <Text fontSize="sm" color={muted} maxW="3xl" mx="auto">
              One of the biggest gaps in healthcare is what happens after a patient leaves the hospital. VeeVee helps close that gap by keeping patients engaged at home while still giving families, nurses, and doctors a clearer line of sight.
            </Text>
            <Button
              as={RouterLink}
              to={APP_LINKS.internal.simulator}
              size="md"
              borderRadius="full"
              fontWeight="700"
              px={8}
              alignSelf="center"
              boxShadow="0 0 28px rgba(17, 119, 186, 0.35)"
            >
              Try VeeVee Simulator
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
