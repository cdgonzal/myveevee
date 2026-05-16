import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  SimpleGrid,
  Stack,
  Text,
  useBreakpointValue,
  useToast,
} from "@chakra-ui/react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { trackCtaClick } from "../../analytics/trackCtaClick";
import { trackEvent } from "../../analytics/trackEvent";
import { APP_LINKS } from "../../config/links";
import { trackSwcaCampaignEvent } from "../campaignEvents";
import { getSwcaProfileFunnelPath, getSwcaProfileFunnelVariant } from "../profileFunnel/variant";
import { RewardContactError, spinSwcaReward, submitSwcaRewardContact } from "./api";
import { getRewardIndex, SWCA_REWARDS } from "./rewards";
import type { SwcaReward } from "./rewards";

const NAVY = "#071A3A";
const ORANGE = "#F39A25";
const CREAM = "#FFF7EC";
const LINE = "#F0D2A4";
const SEGMENT_DEGREES = 360 / SWCA_REWARDS.length;
const SPIN_DURATION_MS = 3200;
const SPIN_TURNS = 7;

export default function SwcaRewardWheel() {
  const toast = useToast();
  const navigate = useNavigate();
  const isMobileRewardFlow = useBreakpointValue({ base: true, md: false }) ?? false;
  const [searchParams] = useSearchParams();
  const submissionId = searchParams.get("sid") ?? "";
  const token = searchParams.get("token") ?? "";
  const profileFunnelVariant = getSwcaProfileFunnelVariant(submissionId);
  const profileFunnelPath = getSwcaProfileFunnelPath(submissionId);
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
  const [isRewardSheetOpen, setIsRewardSheetOpen] = useState(false);
  const hasValidLink = submissionId.length > 0 && token.length > 0;
  const canSpin = hasValidLink && !isSpinning && !reward;
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
    if (!canSpin) return;

    setIsSpinning(true);

    try {
      const result = await spinSwcaReward({ submissionId, token });
      const rewardIndex = getRewardIndex(result.reward.id);
      const targetCenter = rewardIndex * SEGMENT_DEGREES + SEGMENT_DEGREES / 2;
      const nextRotation = SPIN_TURNS * 360 + (360 - targetCenter);

      setAlreadySpun(result.alreadySpun);
      setRotation(nextRotation);

      window.setTimeout(() => {
        setReward(result.reward);
        setIsSpinning(false);
        if (isMobileRewardFlow) {
          setIsRewardSheetOpen(true);
        }
        trackEvent("swca_reward_spin_success", {
          reward_id: result.reward.id,
          already_spun: result.alreadySpun,
          mode: result.mode,
        });
        trackSwcaCampaignEvent({
          eventName: "swca_reward_spin_success",
          submissionId,
          rewardId: result.reward.id,
          mode: result.mode,
          params: {
            already_spun: result.alreadySpun,
          },
        });
      }, result.alreadySpun ? 150 : SPIN_DURATION_MS);
    } catch (error) {
      setIsSpinning(false);
      trackEvent("swca_reward_spin_error", {
        has_submission_id: Boolean(submissionId),
        has_token: Boolean(token),
      });
      trackSwcaCampaignEvent({
        eventName: "swca_reward_spin_error",
        submissionId,
        params: {
          has_submission_id: Boolean(submissionId),
          has_token: Boolean(token),
        },
      });
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
      trackEvent("swca_reward_contact_saved", {
        contact_method: contactMethod,
        reward_id: reward?.id,
      });
      trackSwcaCampaignEvent({
        eventName: "swca_reward_contact_saved",
        submissionId,
        rewardId: reward?.id,
        contactMethod,
        params: {
          profile_funnel_variant: profileFunnelVariant,
        },
      });
      toast({
        title: "Contact details saved.",
        description: "Your reward email is on the way. Please check your spam folder if you do not see it.",
        status: "success",
        duration: 4800,
      });
      window.setTimeout(() => {
        trackSwcaCampaignEvent({
          eventName: "swca_profile_funnel_variant_assigned",
          submissionId,
          rewardId: reward?.id,
          contactMethod,
          params: {
            profile_funnel_variant: profileFunnelVariant,
            destination_path: profileFunnelPath,
          },
        });
        navigate(profileFunnelPath);
      }, 900);
    } catch (error) {
      const isDuplicateContact = error instanceof RewardContactError && error.duplicateContact;
      trackEvent("swca_reward_contact_error", {
        contact_method: contactMethod,
        reward_id: reward?.id,
        reason: isDuplicateContact ? "duplicate_contact" : "save_failed",
      });
      trackSwcaCampaignEvent({
        eventName: "swca_reward_contact_error",
        submissionId,
        rewardId: reward?.id,
        contactMethod,
        params: {
          reason: isDuplicateContact ? "duplicate_contact" : "save_failed",
        },
      });
      toast({
        title: isDuplicateContact ? "This contact already claimed a reward." : "We could not save your contact details.",
        description: isDuplicateContact
          ? "We will still take you to the next step."
          : error instanceof Error
            ? error.message
            : "Please ask the clinic team for help.",
        status: "error",
        duration: isDuplicateContact ? 3800 : 4200,
      });
      if (isDuplicateContact) {
        window.setTimeout(() => {
          trackSwcaCampaignEvent({
            eventName: "swca_profile_funnel_variant_assigned",
            submissionId,
            rewardId: reward?.id,
            contactMethod,
            params: {
              profile_funnel_variant: profileFunnelVariant,
              destination_path: profileFunnelPath,
              reason: "duplicate_contact",
            },
          });
          navigate(profileFunnelPath);
        }, 3800);
      }
    } finally {
      setIsSavingContact(false);
    }
  };

  const renderRewardSummary = () =>
    reward ? (
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
    ) : null;

  const renderContactForm = () =>
    reward ? (
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
          minH={{ base: "54px", md: "40px" }}
          _hover={{ bg: contactSaved ? "#2F7D7E" : "#102A55" }}
        >
          {contactSaved ? "Saved" : "Send my reward"}
        </Button>
        {contactSaved ? (
          <Button
            as={Link}
            to={profileFunnelPath}
            variant="outline"
            borderColor={LINE}
            color={NAVY}
            onClick={() => {
              trackCtaClick({
                ctaName: "swca_reward_continue_to_profile_funnel",
                ctaText: "Continue to free profile",
                placement: "swca_reward_contact_saved",
                destinationType: "internal",
                destinationUrl: profileFunnelPath,
              });
              trackSwcaCampaignEvent({
                eventName: "swca_reward_continue_to_profile_funnel",
                submissionId,
                rewardId: reward?.id,
                params: {
                  profile_funnel_variant: profileFunnelVariant,
                  destination_path: profileFunnelPath,
                },
              });
            }}
          >
            Continue to free profile
          </Button>
        ) : null}
      </Stack>
    ) : null;

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
              <Box
                as="button"
                type="button"
                position="relative"
                w="min(82vw, 430px)"
                aspectRatio="1"
                onClick={handleSpin}
                disabled={!canSpin}
                cursor={canSpin ? "pointer" : "default"}
                aria-label="Spin the reward wheel"
                bg="transparent"
                border="0"
                p="0"
                _focusVisible={{ outline: "4px solid", outlineColor: ORANGE, outlineOffset: "8px" }}
                _disabled={{ opacity: reward ? 1 : 0.68 }}
              >
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
                <Box
                  position="absolute"
                  inset="0"
                  borderRadius="full"
                  border="10px solid"
                  borderColor="#FFFFFF"
                  boxShadow="0 24px 80px rgba(7, 26, 58, 0.22)"
                  bg={wheelGradient}
                  transform={`rotate(${rotation}deg)`}
                  transition={alreadySpun ? "transform 120ms ease-out" : `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.12, 0.72, 0.16, 1)`}
                  willChange="transform"
                  _hover={canSpin ? { boxShadow: "0 28px 88px rgba(7, 26, 58, 0.28)" } : undefined}
                />
                <Flex position="absolute" inset="0" align="center" justify="center" pointerEvents="none">
                  <Flex
                    align="center"
                    justify="center"
                    boxSize={{ base: "130px", md: "158px" }}
                    borderRadius="full"
                    bg="rgba(255, 255, 255, 0.88)"
                    boxShadow="0 14px 36px rgba(7, 26, 58, 0.2)"
                  >
                    <Flex
                      align="center"
                      justify="center"
                      boxSize={{ base: "104px", md: "130px" }}
                      borderRadius="full"
                      bg="#D7263D"
                      border="8px solid"
                      borderColor="#FFFFFF"
                      boxShadow="0 10px 30px rgba(7, 26, 58, 0.28), inset 0 -10px 0 rgba(0, 0, 0, 0.16)"
                    >
                      <Text fontWeight="900" color="white" letterSpacing="0.08em" textTransform="uppercase">
                        Spin
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Box>

              <Button
                onClick={handleSpin}
                isDisabled={!canSpin}
                isLoading={isSpinning}
                loadingText="Spinning"
                boxSize={{ base: "132px", md: "150px" }}
                borderRadius="full"
                bg="#D7263D"
                color="white"
                border="8px solid"
                borderColor="#FFFFFF"
                boxShadow="0 16px 34px rgba(215, 38, 61, 0.32), inset 0 -12px 0 rgba(0, 0, 0, 0.18)"
                fontSize={{ base: "lg", md: "xl" }}
                fontWeight="900"
                letterSpacing="0.08em"
                textTransform="uppercase"
                _hover={{ bg: "#C91F35", transform: canSpin ? "translateY(-2px)" : "none" }}
                _active={{ transform: canSpin ? "translateY(2px)" : "none", boxShadow: "0 8px 18px rgba(215, 38, 61, 0.28), inset 0 -6px 0 rgba(0, 0, 0, 0.18)" }}
                _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
              >
                Spin
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
                  renderRewardSummary()
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
                  {renderContactForm()}
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

      <Modal isOpen={isMobileRewardFlow && isRewardSheetOpen && Boolean(reward)} onClose={() => setIsRewardSheetOpen(false)} size="full" isCentered={false}>
        <ModalOverlay bg="rgba(7,26,58,0.48)" />
        <ModalContent
          mt="auto"
          mb={0}
          borderTopRadius="22px"
          borderBottomRadius={0}
          maxH="88dvh"
          overflowY="auto"
          bg="#FFFFFF"
        >
          <ModalHeader color={NAVY} pb={2}>
            Your reward is ready
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing={5}>
              <Box border="1px solid" borderColor="#B9D7C8" bg="#F0FFF6" borderRadius="8px" p={5}>
                {renderRewardSummary()}
              </Box>
              <Box border="1px solid" borderColor={contactSaved ? "#B9D7C8" : LINE} bg={contactSaved ? "#F0FFF6" : "#FFFFFF"} borderRadius="8px" p={5}>
                {renderContactForm()}
              </Box>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
