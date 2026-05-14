import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Image,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { APP_LINKS } from "../../config/links";

const NAVY = "#071A3A";
const ORANGE = "#F47B20";
const GOLD = "#FFC247";
const TEAL = "#0B9B9F";

const STEPS = [
  {
    label: "1",
    title: "Tell us what matters most",
    body: "Choose the wellness concerns you want help prioritizing.",
  },
  {
    label: "2",
    title: "Rank your top priorities",
    body: "Move the most important items to the top so the team can understand your goals quickly.",
  },
  {
    label: "3",
    title: "Unlock your reward spin",
    body: "After you complete the intake, follow the clinic instructions to spin the reward wheel.",
  },
];

export default function SwcaRewardsTeaser() {
  return (
    <Box minH="100vh" bg="#FFF9EF" color={NAVY} overflow="hidden">
      <Box position="absolute" inset={0} bg="radial-gradient(circle at 82% 12%, rgba(255,194,71,0.28), transparent 34%)" />
      <Box position="relative" maxW="1180px" mx="auto" px={{ base: 5, md: 8 }} py={{ base: 7, md: 10 }}>
        <Flex align="center" justify="space-between" gap={5} mb={{ base: 7, md: 10 }}>
          <Flex align="center" gap={3}>
            <Image
              src="/swca/spine-wellness-logo.png"
              alt="Spine and Wellness Centers of America"
              boxSize={{ base: "64px", md: "86px" }}
              objectFit="contain"
            />
            <Stack spacing={0}>
              <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="900" letterSpacing="0.12em" textTransform="uppercase">
                Spine and Wellness
              </Text>
              <Text fontSize={{ base: "sm", md: "md" }} fontWeight="700" color="#566071">
                Centers of America
              </Text>
            </Stack>
          </Flex>

          <Badge
            display={{ base: "none", sm: "inline-flex" }}
            bg="white"
            color={NAVY}
            border="1px solid"
            borderColor="rgba(7,26,58,0.16)"
            borderRadius="full"
            px={4}
            py={2}
            fontSize="sm"
            boxShadow="0 10px 24px rgba(7,26,58,0.08)"
          >
            QR reward experience
          </Badge>
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 8, lg: 12 }} alignItems="center">
          <Stack spacing={{ base: 6, md: 7 }}>
            <Stack spacing={4}>
              <Badge
                alignSelf="flex-start"
                bg={NAVY}
                color="white"
                borderRadius="full"
                px={4}
                py={2}
                fontSize="sm"
                letterSpacing="0.08em"
              >
                Complete your check-in first
              </Badge>
              <Heading
                as="h1"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize={{ base: "4xl", md: "6xl" }}
                lineHeight="0.95"
                letterSpacing="0"
              >
                Share your priorities.
                <Box as="span" display="block" color={ORANGE}>
                  Spin for a reward.
                </Box>
              </Heading>
              <Text fontSize={{ base: "lg", md: "xl" }} lineHeight="1.45" color="#24314D" maxW="620px">
                Take a quick wellness intake so the SWCA team can understand what you want support with.
                After you submit, you can follow the clinic instructions to spin the reward wheel.
              </Text>
            </Stack>

            <Flex
              align={{ base: "stretch", sm: "center" }}
              direction={{ base: "column", sm: "row" }}
              gap={3}
            >
              <Button
                as={RouterLink}
                to={APP_LINKS.internal.swcaIntake}
                size="lg"
                bg={ORANGE}
                color="white"
                borderRadius="full"
                px={8}
                minH="54px"
                fontWeight="900"
                _hover={{ bg: "#D96712", textDecoration: "none" }}
                boxShadow="0 18px 36px rgba(244,123,32,0.28)"
              >
                Start the intake
              </Button>
              <Text fontSize="sm" color="#5F6878" maxW="320px">
                Takes about a minute. Reward availability and prize details are handled by the clinic team.
              </Text>
            </Flex>

            <Flex
              bg="white"
              border="1px solid"
              borderColor="rgba(7,26,58,0.12)"
              borderRadius="8px"
              p={{ base: 4, md: 5 }}
              gap={4}
              align="center"
              boxShadow="0 18px 38px rgba(7,26,58,0.08)"
              maxW="610px"
            >
              <Box flex="0 0 auto" color={GOLD} fontSize={{ base: "2xl", md: "3xl" }} letterSpacing="0">
                ★★★★★
              </Box>
              <Box>
                <Text fontWeight="900">5-star care starts with being heard.</Text>
                <Text color="#5F6878" fontSize="sm">
                  SWCA feedback helps the team understand what patients value and where support can improve.
                </Text>
              </Box>
            </Flex>
          </Stack>

          <Box position="relative">
            <Box
              position="absolute"
              inset={{ base: "8% 2% auto auto", md: "6% 4% auto auto" }}
              w={{ base: "120px", md: "170px" }}
              h={{ base: "120px", md: "170px" }}
              bg={TEAL}
              borderRadius="full"
              opacity={0.12}
            />
            <Box
              bg="white"
              borderRadius="8px"
              p={{ base: 3, md: 4 }}
              border="1px solid"
              borderColor="rgba(7,26,58,0.12)"
              boxShadow="0 28px 70px rgba(7,26,58,0.18)"
              transform={{ base: "none", lg: "rotate(1.2deg)" }}
            >
              <Image
                src="/swca/spin-wheel-rewards.webp"
                alt="Spin to win reward wheel with sample prizes"
                w="100%"
                maxH={{ base: "520px", lg: "720px" }}
                objectFit="cover"
                objectPosition="center"
                borderRadius="8px"
              />
            </Box>
          </Box>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={{ base: 8, md: 10 }}>
          {STEPS.map((step) => (
            <Flex
              key={step.label}
              gap={4}
              bg="rgba(255,255,255,0.86)"
              border="1px solid"
              borderColor="rgba(7,26,58,0.12)"
              borderRadius="8px"
              p={5}
              align="flex-start"
            >
              <Flex
                align="center"
                justify="center"
                boxSize="36px"
                borderRadius="full"
                bg={NAVY}
                color="white"
                flex="0 0 auto"
                fontWeight="900"
              >
                {step.label}
              </Flex>
              <Box>
                <Text fontWeight="900" fontSize="lg" lineHeight="1.2">
                  {step.title}
                </Text>
                <Text mt={1} color="#5F6878" lineHeight="1.45">
                  {step.body}
                </Text>
              </Box>
            </Flex>
          ))}
        </SimpleGrid>

        <Text mt={7} fontSize="xs" color="#6A7280" textAlign="center">
          Rewards, prize availability, and eligibility are managed by Spine and Wellness Centers of America.
        </Text>
      </Box>
    </Box>
  );
}
