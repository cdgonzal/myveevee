import React from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  SimpleGrid,
  Stack,
  Card,
  CardBody,
  useBreakpointValue,
  Image,
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

type Pillar = {
  eyebrow: string;
  title: string;
  front: string;
  back: string;
  imageSrc: string;
  imageAlt: string;
};

const PILLARS: Pillar[] = [
  {
    eyebrow: "Pillar 1",
    title: "Everyday Health Companion",
    front: "Answers, guidance, and next steps for the questions people have every day.",
    back: "VeeVee helps users understand symptoms, routines, and wellness questions in plain language, then points them toward appropriate actions, resources, and care pathways.",
    imageSrc: "/images/features/support.webp",
    imageAlt: "Everyday health companion workflow",
  },
  {
    eyebrow: "Pillar 2",
    title: "Benefits, Perks, and Coverage",
    front: "Find the benefits you already have before you spend more than you need to.",
    back: "VeeVee maps care options against plan details, wellness perks, and available programs so users can unlock coverage, reduce friction, and make financially smarter choices.",
    imageSrc: "/images/features/benefits.webp",
    imageAlt: "Benefits and coverage optimization",
  },
  {
    eyebrow: "Pillar 3",
    title: "Doctor Connection and Monitoring",
    front: "Stay engaged between visits with a more complete view of your health.",
    back: "By keeping health context, observations, and questions organized, VeeVee helps people show up better prepared for appointments and stay more connected to their clinicians over time.",
    imageSrc: "/images/features/trajectory.webp",
    imageAlt: "Health monitoring and clinician connection",
  },
  {
    eyebrow: "Pillar 4",
    title: "Digital Twin Simulation",
    front: "Create a personalized avatar to explore what-if scenarios before acting.",
    back: "VeeVee's digital twin layer helps users model changes in habits, symptoms, and care decisions so they can better understand possible outcomes before making a move.",
    imageSrc: "/images/features/health-story.webp",
    imageAlt: "Digital twin and avatar simulation",
  },
  {
    eyebrow: "Pillar 5",
    title: "Edge AI for Hospitals",
    front: "A high-performance platform for real-time, low-latency hospital intelligence.",
    back: "VeeVee brings agentic computer vision to the edge so hospitals can act on visual signals in real time without depending on delayed or centralized workflows.",
    imageSrc: "/images/features/support.webp",
    imageAlt: "Hospital edge AI platform",
  },
  {
    eyebrow: "Pillar 6",
    title: "Continuous Vigilance and Documentation",
    front: "Reduce risk, cut hard costs, and support revenue-generating workflows.",
    back: "The platform supports automated clinical documentation, fall prevention, hand hygiene observation, continuous vigilance programs, and alternatives to labor-intensive one-to-one sitter models.",
    imageSrc: "/images/features/trajectory.webp",
    imageAlt: "Continuous vigilance and automated documentation",
  },
];

function PillarCard({ pillar }: { pillar: Pillar }) {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [open, setOpen] = React.useState(false);
  const borderColor = useColorModeValue("border.default", "border.default");
  const subtle = useColorModeValue("text.subtle", "text.subtle");
  const muted = useColorModeValue("text.muted", "text.muted");

  const frontOpacity = isMobile ? (open ? 0.08 : 1) : 1;
  const backOpacity = isMobile ? (open ? 1 : 0) : 0;

  return (
    <MotionCard
      role="group"
      bg="bg.surface"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor={borderColor}
      overflow="hidden"
      cursor={isMobile ? "pointer" : "default"}
      onClick={isMobile ? () => setOpen((v) => !v) : undefined}
      whileHover={{ y: -3, boxShadow: "0 0 30px rgba(17, 119, 186, 0.35)" }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <CardBody p={0}>
        <Box px={{ base: 4, md: 6 }} pt={{ base: 4, md: 6 }} pb={{ base: 3, md: 4 }}>
          <Box
            borderRadius="xl"
            overflow="hidden"
            borderWidth="1px"
            borderColor={borderColor}
            bg="surface.700"
          >
            <Box position="relative" w="100%" aspectRatio="16 / 10">
              <Image
                src={pillar.imageSrc}
                alt={pillar.imageAlt}
                w="100%"
                h="100%"
                objectFit={isMobile ? "contain" : "cover"}
                opacity={0.96}
                loading="lazy"
              />
            </Box>
          </Box>
        </Box>

        <Box position="relative" px={{ base: 5, md: 6 }} pb={{ base: 5, md: 6 }}>
          <Box opacity={frontOpacity} transition="opacity 0.25s ease-out" _groupHover={{ opacity: 0.08 }}>
            <Text
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="0.16em"
              color="accent.soft"
              mb={2}
            >
              {pillar.eyebrow}
            </Text>
            <Heading as="h3" size="sm" mb={2} color="text.primary">
              {pillar.title}
            </Heading>
            <Text fontSize="sm" color={muted}>
              {pillar.front}
            </Text>
            {isMobile && (
              <Text mt={3} fontSize="xs" color={subtle}>
                Tap to learn more
              </Text>
            )}
          </Box>

          <Box
            position="absolute"
            inset={0}
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            justifyContent="flex-start"
            gap={2}
            opacity={backOpacity}
            transition="opacity 0.25s ease-out"
            _groupHover={{ opacity: 1 }}
            pointerEvents={isMobile ? (open ? "auto" : "none") : "auto"}
          >
            <Text
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="0.16em"
              color="accent.soft"
              mb={2}
            >
              {pillar.eyebrow}
            </Text>
            <Heading as="h3" size="sm" mb={2} color="accent.soft">
              {pillar.title}
            </Heading>
            <Text fontSize="sm" color="text.primary">
              {pillar.back}
            </Text>
            {isMobile && (
              <Text mt={3} fontSize="xs" color={subtle}>
                Tap again to close
              </Text>
            )}
          </Box>
        </Box>
      </CardBody>
    </MotionCard>
  );
}

export default function Features() {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const pageGradient = useColorModeValue(
    "linear(to-b, #FFFFFF, #9CE7FF)",
    "linear(to-b, surface.900, surface.800)"
  );
  const muted = useColorModeValue("text.muted", "text.muted");

  return (
    <Box
      as="main"
      minH="100vh"
      bgGradient={pageGradient}
      color="text.primary"
      py={{ base: 10, md: 20 }}
    >
      <Stack spacing={{ base: 10, md: 14 }} maxW="6xl" mx="auto" px={{ base: 6, md: 10 }}>
        <MotionBox textAlign="center" variants={fadeUp} initial="hidden" animate="visible">
          <Text
            fontSize="sm"
            letterSpacing="0.18em"
            textTransform="uppercase"
            color="accent.soft"
            mb={3}
          >
            WHY VEEVEE
          </Text>
          <Heading as="h1" size={{ base: "lg", md: "xl" }} fontWeight="800" mb={3}>
            One platform serving both the patient journey and the modern hospital.
          </Heading>
          <Text fontSize={{ base: "md", md: "lg" }} maxW="3xl" mx="auto" color="text.primary">
            VeeVee combines personal health companionship with edge AI infrastructure so people get clearer guidance and health systems get real-time operational intelligence.
          </Text>
        </MotionBox>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
          {PILLARS.map((pillar, index) => (
            <MotionBox
              key={pillar.title}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.04 }}
            >
              <PillarCard pillar={pillar} />
            </MotionBox>
          ))}
        </SimpleGrid>

        <Stack spacing={4} textAlign="center" pt={{ base: 4, md: 6 }}>
          <Heading as="h2" size="md">
            Ready to see how VeeVee fits your world?
          </Heading>
          <Text fontSize="sm" color={muted} maxW="2xl" mx="auto" textAlign={isMobile ? "left" : "center"}>
            Start with the patient experience, then explore the broader platform story behind benefits guidance, digital twin simulation, and hospital-grade edge AI.
          </Text>
          <Button
            as={RouterLink}
            to={APP_LINKS.cta.getStarted}
            size="md"
            borderRadius="full"
            fontWeight="700"
            px={8}
            alignSelf="center"
            boxShadow="0 0 28px rgba(17, 119, 186, 0.35)"
          >
            Start for free
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}


