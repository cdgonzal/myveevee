import {
  Box,
  Button,
  Heading,
  Text,
  SimpleGrid,
  Stack,
  Card,
  CardBody,
  Link as CLink,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import { APP_LINKS } from "../config/links";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

const STEPS = [
  {
    number: "1",
    title: "Tell us what's happening",
    detail:
      "Type it. Say it. Upload a photo. VeeVee listens and understands. Free and instant.",
  },
  {
    number: "2",
    title: "Get clear guidance",
    detail:
      "See what might be going on and what to do next. Simple, personalized answers for free.",
  },
  {
    number: "3",
    title: "Take the next step",
    detail:
      "Know where to go, what to ask, and whether your plan covers it.",
  },
];

export default function HowItWorks() {
  const pageGradient = useColorModeValue(
    "linear(to-b, #FFFFFF, #9CE7FF)",
    "linear(to-b, surface.900, surface.800)"
  );
  const muted = useColorModeValue("text.muted", "text.muted");
  const borderColor = useColorModeValue("border.default", "border.default");
  const cardShadow = useColorModeValue(
    "0 10px 24px rgba(6, 37, 76, 0.10)",
    "0 10px 26px rgba(0, 0, 0, 0.38)"
  );
  const cardHoverShadow = useColorModeValue(
    "0 14px 30px rgba(17, 119, 186, 0.26)",
    "0 14px 32px rgba(17, 119, 186, 0.34)"
  );
  const stepCircleBg = "accent.primary";
  const stepCircleColor = "white";
  const freeAccent = useColorModeValue("#001A52", "#9CE7FF");

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
            Your wellness questions answered in 3 simple steps.
          </Heading>
          <Text fontSize={{ base: "sm", md: "md" }} color={muted} maxW="3xl" mx="auto">
            Start <Box as="span" fontWeight="800" color={freeAccent}>free</Box>. Share what's going on and get clear next steps instantly.
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
              boxShadow={cardShadow}
              whileHover={{ y: -4, boxShadow: cardHoverShadow }}
            >
              <CardBody>
                <Box
                  w={14}
                  h={14}
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontWeight="800"
                  fontSize="2xl"
                  bg={stepCircleBg}
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
              </CardBody>
            </MotionCard>
          ))}
        </SimpleGrid>

        <Stack spacing={4} textAlign="center">
          <Heading as="h2" size="md">
            Curious what happens next?
          </Heading>
          <Text fontSize="sm" color={muted} maxW="2xl" mx="auto">
            Try a free health scenario and see how VeeVee responds - before creating an account.
          </Text>
          <Button
            as={RouterLink}
            to={APP_LINKS.internal.whyVeeVee}
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
            Already ready?
          </CLink>
        </Stack>

      </Stack>
    </Box>
  );
}
