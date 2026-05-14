import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Input,
  Radio,
  RadioGroup,
  SimpleGrid,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Link, useSearchParams } from "react-router-dom";
import { APP_LINKS } from "../../config/links";
import { spinSwcaReward, submitSwcaRewardContact } from "./api";
import { getRewardIndex, SWCA_REWARDS } from "./rewards";
import type { SwcaReward } from "./rewards";

const NAVY = "#071A3A";
const ORANGE = "#F39A25";
const CREAM = "#FFF7EC";
const LINE = "#F0D2A4";
const SEGMENT_DEGREES = 360 / SWCA_REWARDS.length;

export default function SwcaRewardWheel() {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const submissionId = searchParams.get("sid") ?? "";
  const token = searchParams.get("token") ?? "";
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [reward, setReward] = useState<SwcaReward | null>(null);
  const [alreadySpun, setAlreadySpun] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contactMethod, setContactMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);
  const hasValidLink = submissionId.length > 0 && token.length > 0;
  const canSaveContact =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    (contactMethod === "email" ? email.trim().length > 0 : phone.trim().length > 0);

  const wheelGradient = useMemo(() => {
    const segments = SWCA_REWARDS.map((item, index) => {
      const start = index * SEGMENT_DEGREES;
      const end = start + SEGMENT_DEGREES;
      return `${item.color} ${start}deg ${end}deg`;
    });

    return `conic-gradient(from -90deg, ${segments.join(", ")})`;
  }, []);

  const handleSpin = async () => {
    if (!hasValidLink || isSpinning || reward) return;

    setIsSpinning(true);

    try {
      const result = await spinSwcaReward({ submissionId, token });
      const rewardIndex = getRewardIndex(result.reward.id);
      const targetCenter = rewardIndex * SEGMENT_DEGREES + SEGMENT_DEGREES / 2;
      const nextRotation = 1440 + (360 - targetCenter);

      setAlreadySpun(result.alreadySpun);
      setRotation(nextRotation);

      window.setTimeout(() => {
        setReward(result.reward);
        setIsSpinning(false);
      }, result.alreadySpun ? 150 : 2300);
    } catch (error) {
      setIsSpinning(false);
      toast({
        title: "We could not complete the reward spin.",
        description: error instanceof Error ? error.message : "Please ask the clinic team for help.",
        status: "error",
        duration: 4400,
      });
    }
  };

  const handleContactSubmit = async () => {
    if (!canSaveContact || !hasValidLink) {
      toast({
        title: "Add your name and contact detail.",
        status: "warning",
        duration: 2600,
      });
      return;
    }

    setIsSavingContact(true);

    try {
      await submitSwcaRewardContact({
        submissionId,
        token,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        contactMethod,
        email: contactMethod === "email" ? email.trim() : undefined,
        phone: contactMethod === "phone" ? phone.trim() : undefined,
      });

      setContactSaved(true);
      toast({
        title: "Contact details saved.",
        status: "success",
        duration: 2800,
      });
    } catch (error) {
      toast({
        title: "We could not save your contact details.",
        description: error instanceof Error ? error.message : "Please ask the clinic team for help.",
        status: "error",
        duration: 4200,
      });
    } finally {
      setIsSavingContact(false);
    }
  };

  return (
    <Box minH="100vh" bg="#FFFFFF" color={NAVY} px={{ base: 4, md: 8 }} py={{ base: 7, md: 10 }}>
      <Box maxW="1080px" mx="auto">
        <Flex justify="center" mb={{ base: 5, md: 7 }}>
          <Image
            src="/swca/spine-wellness-logo.png"
            alt="Spine and Wellness Centers of America"
            boxSize={{ base: "110px", md: "150px" }}
            objectFit="contain"
          />
        </Flex>

        <Stack spacing={3} textAlign="center" mb={{ base: 7, md: 9 }}>
          <Text fontSize={{ base: "sm", md: "md" }} letterSpacing="0.18em" textTransform="uppercase" fontWeight="800" color={ORANGE}>
            Reward wheel
          </Text>
          <Heading
            as="h1"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize={{ base: "4xl", md: "6xl" }}
            lineHeight="0.95"
            letterSpacing="0"
            textTransform="uppercase"
          >
            Spin For Your Reward
          </Heading>
          <Text fontSize={{ base: "md", md: "xl" }} maxW="680px" mx="auto" color="#2D3B59">
            Thank you for completing the intake. Tap once to reveal the reward assigned to this submission.
          </Text>
        </Stack>

        {hasValidLink ? (
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 8, lg: 12 }} alignItems="center">
            <Stack spacing={6} align="center">
              <Box position="relative" w="min(82vw, 430px)" aspectRatio="1">
                <Box
                  position="absolute"
                  top="-16px"
                  left="50%"
                  transform="translateX(-50%)"
                  width="0"
                  height="0"
                  borderLeft="18px solid transparent"
                  borderRight="18px solid transparent"
                  borderTop={`34px solid ${NAVY}`}
                  zIndex={2}
                />
                <Flex
                  position="absolute"
                  inset="0"
                  align="center"
                  justify="center"
                  borderRadius="full"
                  border="10px solid"
                  borderColor="#FFFFFF"
                  boxShadow="0 24px 80px rgba(7, 26, 58, 0.22)"
                  bg={wheelGradient}
                  transform={`rotate(${rotation}deg)`}
                  transition={alreadySpun ? "transform 120ms ease-out" : "transform 2200ms cubic-bezier(0.16, 0.84, 0.28, 1)"}
                >
                  <Flex
                    align="center"
                    justify="center"
                    boxSize={{ base: "104px", md: "130px" }}
                    borderRadius="full"
                    bg="#FFFFFF"
                    border="8px solid"
                    borderColor={ORANGE}
                    boxShadow="0 10px 30px rgba(7, 26, 58, 0.18)"
                  >
                    <Text fontWeight="900" color={NAVY} letterSpacing="0.08em" textTransform="uppercase">
                      Spin
                    </Text>
                  </Flex>
                </Flex>
              </Box>

              <Button
                onClick={handleSpin}
                isDisabled={!hasValidLink || isSpinning || Boolean(reward)}
                isLoading={isSpinning}
                loadingText="Spinning"
                minW={{ base: "100%", sm: "240px" }}
                h="52px"
                bg={NAVY}
                color="white"
                _hover={{ bg: "#102A55" }}
                _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
              >
                Spin the wheel
              </Button>
            </Stack>

            <Stack spacing={5}>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                {SWCA_REWARDS.map((item) => (
                  <Flex
                    key={item.id}
                    align="center"
                    gap={3}
                    border="1px solid"
                    borderColor={LINE}
                    borderRadius="8px"
                    bg={CREAM}
                    p={3}
                  >
                    <Box boxSize="14px" borderRadius="full" bg={item.color} flex="0 0 auto" />
                    <Text fontWeight="800" lineHeight="1.15">
                      {item.shortLabel}
                    </Text>
                  </Flex>
                ))}
              </SimpleGrid>

              <Box border="1px solid" borderColor={reward ? "#B9D7C8" : LINE} bg={reward ? "#F0FFF6" : CREAM} borderRadius="8px" p={{ base: 5, md: 6 }}>
                {reward ? (
                  <Stack spacing={2} textAlign="center">
                    <Text fontSize="sm" letterSpacing="0.16em" textTransform="uppercase" color="#2F7D7E" fontWeight="900">
                      {alreadySpun ? "Reward already claimed" : "Your reward"}
                    </Text>
                    <Heading as="h2" fontFamily="Georgia, 'Times New Roman', serif" size={{ base: "lg", md: "xl" }}>
                      {reward.label}
                    </Heading>
                    <Text fontWeight="700" color="#2F7D7E">
                      {reward.estimatedValue}
                    </Text>
                    <Text color="#2D3B59">
                      {reward.description}
                    </Text>
                  </Stack>
                ) : (
                  <Stack spacing={2} textAlign="center">
                    <Text fontSize="sm" letterSpacing="0.16em" textTransform="uppercase" color={ORANGE} fontWeight="900">
                      Ready
                    </Text>
                    <Heading as="h2" fontFamily="Georgia, 'Times New Roman', serif" size="lg">
                      One spin is available.
                    </Heading>
                    <Text color="#2D3B59">
                      The reward is assigned securely when you spin.
                    </Text>
                  </Stack>
                )}
              </Box>

              {reward ? (
                <Box border="1px solid" borderColor={contactSaved ? "#B9D7C8" : LINE} bg={contactSaved ? "#F0FFF6" : "#FFFFFF"} borderRadius="8px" p={{ base: 5, md: 6 }}>
                  <Stack spacing={4}>
                    <Stack spacing={1} textAlign="center">
                      <Text fontSize="sm" letterSpacing="0.16em" textTransform="uppercase" color={ORANGE} fontWeight="900">
                        Send my reward
                      </Text>
                      <Text color="#2D3B59">
                        Add your name and preferred contact so the clinic team can follow up.
                      </Text>
                    </Stack>

                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                      <Input
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        placeholder="First name"
                        bg="white"
                        borderColor={LINE}
                        isDisabled={contactSaved}
                      />
                      <Input
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        placeholder="Last name"
                        bg="white"
                        borderColor={LINE}
                        isDisabled={contactSaved}
                      />
                    </SimpleGrid>

                    <RadioGroup value={contactMethod} onChange={(value) => setContactMethod(value as "email" | "phone")}>
                      <Flex gap={4} justify="center" wrap="wrap">
                        <Radio value="email" colorScheme="orange" isDisabled={contactSaved}>
                          Email
                        </Radio>
                        <Radio value="phone" colorScheme="orange" isDisabled={contactSaved}>
                          Phone
                        </Radio>
                      </Flex>
                    </RadioGroup>

                    {contactMethod === "email" ? (
                      <Input
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Email address"
                        type="email"
                        bg="white"
                        borderColor={LINE}
                        isDisabled={contactSaved}
                      />
                    ) : (
                      <Input
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="Phone number"
                        type="tel"
                        bg="white"
                        borderColor={LINE}
                        isDisabled={contactSaved}
                      />
                    )}

                    <Button
                      onClick={handleContactSubmit}
                      isDisabled={!canSaveContact || contactSaved}
                      isLoading={isSavingContact}
                      loadingText="Saving"
                      bg={contactSaved ? "#2F7D7E" : NAVY}
                      color="white"
                      _hover={{ bg: contactSaved ? "#2F7D7E" : "#102A55" }}
                    >
                      {contactSaved ? "Saved" : "Send my reward"}
                    </Button>
                  </Stack>
                </Box>
              ) : null}
            </Stack>
          </SimpleGrid>
        ) : (
          <Box maxW="620px" mx="auto" border="1px solid" borderColor={LINE} bg={CREAM} borderRadius="8px" p={{ base: 5, md: 7 }} textAlign="center">
            <Stack spacing={4}>
              <Heading as="h2" fontFamily="Georgia, 'Times New Roman', serif" size="lg">
                Complete the intake first.
              </Heading>
              <Text color="#2D3B59">
                The reward wheel needs a valid intake confirmation link before it can assign a reward.
              </Text>
              <Button as={Link} to={APP_LINKS.internal.swcaIntake} bg={NAVY} color="white" _hover={{ bg: "#102A55" }}>
                Start the intake
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
}
