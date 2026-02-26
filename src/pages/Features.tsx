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
    title: "Instant Triage",
    front: "Photo, text, or voice input turns into immediate next-step guidance.",
    back: "VeeVee triages your situation and routes you toward relevant care pathways, including live-doctor options where available, pharmacy actions, and treatment next steps.",
    imageSrc: "/images/features/support.webp",
    imageAlt: "Instant triage workflow",
  },
  {
    eyebrow: "Pillar 2",
    title: "My Digital Twin",
    front: "A simulation layer personalized to your body, habits, and goals.",
    back: "Model what-if changes and explore how routines, symptoms, and decisions may influence your wellness trajectory before you commit.",
    imageSrc: "/images/features/trajectory.webp",
    imageAlt: "Digital twin simulation",
  },
  {
    eyebrow: "Pillar 3",
    title: "My True Me Profile",
    front: "History, genetics, and wearables connected into one living health profile.",
    back: "Instead of fragmented records, VeeVee keeps your context together so guidance can stay personal, current, and specific to you.",
    imageSrc: "/images/features/health-story.webp",
    imageAlt: "Unified health profile",
  },
  {
    eyebrow: "Pillar 4",
    title: "Benefits Maximizer",
    front: "Choose care with your real coverage and costs in mind.",
    back: "VeeVee helps map options against your plan so you can unlock covered benefits and avoid paying for care that should already be included.",
    imageSrc: "/images/features/benefits.webp",
    imageAlt: "Benefits and coverage optimization",
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
            Four capabilities working together for better health decisions.
          </Heading>
          <Text fontSize={{ base: "md", md: "lg" }} maxW="3xl" mx="auto" color="text.primary">
            Each pillar is designed to reduce delay, remove guesswork, and make health actions more personal and more financially smart.
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
            Ready to see your personalized health path?
          </Heading>
          <Text fontSize="sm" color={muted} maxW="2xl" mx="auto" textAlign={isMobile ? "left" : "center"}>
            Start with your own profile and get guidance that aligns with your symptoms, your history, and your coverage.
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


