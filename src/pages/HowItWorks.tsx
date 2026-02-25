import {
  Box,
  Button,
  Heading,
  Text,
  SimpleGrid,
  Stack,
  Card,
  CardBody,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

const STEPS = [
  {
    number: "1",
    title: "Share what is happening",
    detail:
      "Upload a photo, describe symptoms in text, or speak naturally. VeeVee captures your context in seconds.",
  },
  {
    number: "2",
    title: "Get triage plus simulation",
    detail:
      "See immediate triage guidance and explore what-if scenarios using your digital twin and unified profile.",
  },
  {
    number: "3",
    title: "Take action with confidence",
    detail:
      "Move toward care, pharmacy, and treatment options while maximizing benefits and coverage fit for your plan.",
  },
];

export default function HowItWorks() {
  const pageGradient = useColorModeValue(
    "linear(to-b, gray.50, blue.50)",
    "linear(to-b, #050816, #070B1F)"
  );
  const muted = useColorModeValue("text.muted", "text.muted");
  const subtle = useColorModeValue("text.subtle", "text.subtle");
  const borderColor = useColorModeValue("border.default", "border.default");

  return (
    <Box
      as="main"
      minH="100vh"
      bgGradient={pageGradient}
      color="text.primary"
      py={{ base: 10, md: 20 }}
    >
      <Stack spacing={{ base: 10, md: 14 }} maxW="5xl" mx="auto" px={{ base: 6, md: 10 }}>
        <MotionBox textAlign="center" variants={fadeUp} initial="hidden" animate="visible">
          <Text
            fontSize="sm"
            letterSpacing="0.18em"
            textTransform="uppercase"
            color="accent.soft"
            mb={3}
          >
            HOW IT WORKS
          </Text>
          <Heading as="h1" size={{ base: "lg", md: "xl" }} fontWeight="800" mb={4}>
            A 3-step path from uncertainty to action.
          </Heading>
          <Text fontSize={{ base: "sm", md: "md" }} color={muted} maxW="3xl" mx="auto">
            VeeVee combines rapid triage, digital twin simulation, and benefits-aware guidance so you can make better health decisions faster.
          </Text>
        </MotionBox>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 4, md: 6 }}>
          {STEPS.map((step, index) => (
            <MotionCard
              key={step.number}
              bg="bg.surface"
              borderRadius="xl"
              borderWidth="1px"
              borderColor={borderColor}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, boxShadow: "0 0 28px rgba(0, 245, 160, 0.35)" }}
            >
              <CardBody>
                <Box
                  w={8}
                  h={8}
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontWeight="800"
                  fontSize="lg"
                  bg="rgba(0, 245, 160, 0.08)"
                  color="accent.primary"
                  border="1px solid"
                  borderColor="accent.primary"
                  mb={3}
                >
                  {step.number}
                </Box>
                <Heading as="h3" size="sm" mb={2} color="accent.soft">
                  {step.title}
                </Heading>
                <Text fontSize="sm" color="text.primary">
                  {step.detail}
                </Text>
              </CardBody>
            </MotionCard>
          ))}
        </SimpleGrid>

        <Stack spacing={4} textAlign="center">
          <Heading as="h2" size="md">
            Start with your first input.
          </Heading>
          <Text fontSize="sm" color={muted} maxW="2xl" mx="auto">
            Begin free at VeeVee.io and see how your triage, profile, and coverage context work together in one place.
          </Text>
          <Button
            as="a"
            href="https://veevee.io"
            size="md"
            borderRadius="full"
            fontWeight="700"
            px={8}
            alignSelf="center"
            boxShadow="0 0 28px rgba(0, 245, 160, 0.35)"
          >
            Start at VeeVee.io
          </Button>
        </Stack>

        <Box fontSize="xs" color={subtle} borderTopWidth="1px" borderColor={borderColor} pt={4} mt={4}>
          <Text mb={1}>
            VeeVee is a wellness and education companion and does not provide medical advice, diagnosis, or treatment.
          </Text>
          <Text mb={1}>
            Care routing and live-doctor pathways depend on availability, eligibility, and partner networks.
          </Text>
          <Text>
            AI-generated guidance is probabilistic and should be validated with your insurer and licensed clinicians.
          </Text>
        </Box>
      </Stack>
    </Box>
  );
}
