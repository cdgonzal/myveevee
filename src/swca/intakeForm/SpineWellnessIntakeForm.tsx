import { useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Flex,
  FormControl,
  Heading,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  VisuallyHidden,
  useToast,
} from "@chakra-ui/react";
import { trackEvent } from "../../analytics/trackEvent";
import { trackSwcaCampaignEvent } from "../campaignEvents";
import { submitSwcaIntake } from "./api";
import { SWCA_CONCERNS, SWCA_FOLLOW_UP_TOP_RANKED_COUNT, SWCA_INTENT_QUESTIONS, SWCA_INTAKE_FORM_ID } from "./concerns";
import type {
  SwcaConcern,
  SwcaConcernId,
  SwcaFollowUpAnswers,
  SwcaFollowUpQuestion,
  SwcaIntakeSubmission,
  SwcaIntentAnswers,
  SwcaQuestionAnswerValue,
} from "./types";

const NAVY = "#071A3A";
const ORANGE = "#F39A25";
const LINE = "#D6D8DE";
const CONSENT_VERSION = "swca-reward-communication-v1";
const CONSENT_COPY =
  "I agree that Spine and Wellness Centers of America and VeeVee may use the contact information I provide in this reward flow to send my reward certificate and related follow-up by email or text message. Message and data rates may apply. Reply STOP to opt out of text messages.";

type FollowUpStep =
  | {
      kind: "concern";
      concern: SwcaConcern;
      priority: number;
      question: SwcaFollowUpQuestion;
    }
  | {
      kind: "intent";
      priority: number;
      question: SwcaFollowUpQuestion;
    };

function moveItem(items: SwcaConcernId[], fromIndex: number, toIndex: number) {
  const nextItems = [...items];
  const [item] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, item);
  return nextItems;
}

export default function SpineWellnessIntakeForm() {
  const toast = useToast();
  const rankSectionRef = useRef<HTMLDivElement | null>(null);
  const consentSectionRef = useRef<HTMLDivElement | null>(null);
  const [selectedIds, setSelectedIds] = useState<SwcaConcernId[]>([]);
  const [rankedIds, setRankedIds] = useState<SwcaConcernId[]>([]);
  const [honeypot, setHoneypot] = useState("");
  const [hasCommunicationConsent, setHasCommunicationConsent] = useState(false);
  const [isConsentExpanded, setIsConsentExpanded] = useState(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [currentFollowUpStepIndex, setCurrentFollowUpStepIndex] = useState(0);
  const [followUpAnswers, setFollowUpAnswers] = useState<SwcaFollowUpAnswers>({});
  const [intentAnswers, setIntentAnswers] = useState<SwcaIntentAnswers>({});
  const [submitState, setSubmitState] = useState<"idle" | "success">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const concernsById = useMemo(
    () => new Map(SWCA_CONCERNS.map((concern) => [concern.id, concern])),
    []
  );

  const selectedConcerns = rankedIds
    .map((id) => concernsById.get(id))
    .filter((concern): concern is SwcaConcern => Boolean(concern));

  const topRankedConcernIds = rankedIds.slice(0, Math.min(SWCA_FOLLOW_UP_TOP_RANKED_COUNT, rankedIds.length));
  const followUpConcerns = topRankedConcernIds
    .map((id) => concernsById.get(id))
    .filter((concern): concern is SwcaConcern => Boolean(concern));
  const followUpQuestionCount =
    followUpConcerns.reduce((count, concern) => count + (concern.followUpQuestions?.filter((question) => question.required).length ?? 0), 0) +
    SWCA_INTENT_QUESTIONS.filter((question) => question.required).length;
  const followUpSteps = useMemo<FollowUpStep[]>(() => {
    const concernSteps = followUpConcerns.flatMap((concern) =>
      (concern.followUpQuestions ?? []).map((question) => ({
        kind: "concern" as const,
        concern,
        priority: topRankedConcernIds.indexOf(concern.id) + 1,
        question,
      }))
    );
    const intentSteps = SWCA_INTENT_QUESTIONS.map((question, index) => ({
      kind: "intent" as const,
      priority: index + 1,
      question,
    }));

    return [...concernSteps, ...intentSteps];
  }, [followUpConcerns, topRankedConcernIds]);
  const currentFollowUpStep = followUpSteps[currentFollowUpStepIndex];
  const currentFollowUpValue = currentFollowUpStep
    ? currentFollowUpStep.kind === "concern"
      ? followUpAnswers[currentFollowUpStep.concern.id]?.[currentFollowUpStep.question.id]
      : intentAnswers[currentFollowUpStep.question.id]
    : undefined;
  const currentFollowUpStepComplete = currentFollowUpStep ? !currentFollowUpStep.question.required || isAnswerComplete(currentFollowUpValue) : false;
  const followUpProgressValue =
    followUpSteps.length > 0 ? Math.round(((currentFollowUpStepIndex + (currentFollowUpStepComplete ? 1 : 0)) / followUpSteps.length) * 100) : 0;
  const isLastFollowUpStep = currentFollowUpStepIndex >= followUpSteps.length - 1;
  const advanceFollowUpStep = () => {
    if (isLastFollowUpStep) return;
    window.setTimeout(() => {
      setCurrentFollowUpStepIndex((current) => Math.min(followUpSteps.length - 1, current + 1));
    }, 180);
  };

  const canSubmit = selectedIds.length > 0 && rankedIds.length === selectedIds.length && hasCommunicationConsent && !honeypot;
  const canSubmitFollowUp =
    canSubmit &&
    followUpConcerns.every((concern) =>
      (concern.followUpQuestions ?? []).every((question) => !question.required || isAnswerComplete(followUpAnswers[concern.id]?.[question.id]))
    ) &&
    SWCA_INTENT_QUESTIONS.every((question) => !question.required || isAnswerComplete(intentAnswers[question.id]));

  const toggleConcern = (concernId: SwcaConcernId) => {
    setSubmitState("idle");
    setSelectedIds((currentSelectedIds) => {
      const isSelected = currentSelectedIds.includes(concernId);
      const nextSelectedIds = isSelected
        ? currentSelectedIds.filter((id) => id !== concernId)
        : [...currentSelectedIds, concernId];

      setRankedIds((currentRankedIds) => {
        if (isSelected) {
          return currentRankedIds.filter((id) => id !== concernId);
        }

        return [...currentRankedIds, concernId];
      });

      return nextSelectedIds;
    });
  };

  const scrollToRankSection = () => {
    rankSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToConsentSection = () => {
    consentSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const moveRank = (concernId: SwcaConcernId, direction: "up" | "down") => {
    const currentIndex = rankedIds.indexOf(concernId);
    if (currentIndex < 0) return;

    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= rankedIds.length) return;

    setRankedIds(moveItem(rankedIds, currentIndex, nextIndex));
  };

  const setFollowUpAnswer = (concernId: SwcaConcernId, question: SwcaFollowUpQuestion, optionId: string) => {
    setFollowUpAnswers((currentAnswers) => ({
      ...currentAnswers,
      [concernId]: {
        ...(currentAnswers[concernId] ?? {}),
        [question.id]: resolveNextAnswerValue(currentAnswers[concernId]?.[question.id], optionId, question.type),
      },
    }));
  };

  const setIntentAnswer = (question: SwcaFollowUpQuestion, optionId: string) => {
    setIntentAnswers((currentAnswers) => ({
      ...currentAnswers,
      [question.id]: resolveNextAnswerValue(currentAnswers[question.id], optionId, question.type),
    }));
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      toast({
        title: hasCommunicationConsent ? "Select and rank at least one concern." : "Please accept the reward communication consent.",
        status: "warning",
        duration: 2400,
      });
      return;
    }

    setCurrentFollowUpStepIndex(0);
    setIsFollowUpOpen(true);
  };

  const handleFinalSubmit = async () => {
    if (!canSubmitFollowUp) {
      toast({
        title: "Please answer the quick follow-up questions.",
        status: "warning",
        duration: 2400,
      });
      return;
    }

    const submittedAt = new Date().toISOString();
    const submission: SwcaIntakeSubmission = {
      formId: SWCA_INTAKE_FORM_ID,
      sourcePath: window.location.pathname,
      pageUrl: window.location.href,
      clientSubmittedAt: submittedAt,
      userAgent: window.navigator.userAgent,
      selectedConcernIds: selectedIds,
      rankedConcernIds: rankedIds,
      topRankedConcernIds,
      followUpAnswers: buildFollowUpAnswerPayload(followUpConcerns, followUpAnswers),
      intentAnswers: buildIntentAnswerPayload(intentAnswers),
      concernsSnapshot: SWCA_CONCERNS,
      consentAgreement: {
        rewardCommunicationConsent: true,
        consentVersion: CONSENT_VERSION,
        consentCopy: CONSENT_COPY,
        consentedAt: submittedAt,
        consentSourcePath: window.location.pathname,
      },
      honeypot,
    };

    setIsSubmitting(true);

    try {
      const result = await submitSwcaIntake(submission);

      trackEvent("swca_intake_submit_success", {
        mode: result.mode,
        selected_count: selectedIds.length,
        ranked_count: rankedIds.length,
        follow_up_count: followUpQuestionCount,
      });
      trackSwcaCampaignEvent({
        eventName: "swca_intake_submit_success",
        submissionId: result.submissionId,
        mode: result.mode,
        params: {
          selected_count: selectedIds.length,
          ranked_count: rankedIds.length,
          follow_up_count: followUpQuestionCount,
        },
      });

      setSubmitState("success");
      toast({
        title:
          result.mode === "mock"
            ? "Local preview captured. Opening the reward wheel."
            : "Thank you. Your priorities have been captured.",
        status: "success",
        duration: 3200,
      });

      if (result.wheelUrl) {
        window.location.assign(result.wheelUrl);
      }
    } catch (error) {
      trackEvent("swca_intake_submit_error", {
        selected_count: selectedIds.length,
        ranked_count: rankedIds.length,
        follow_up_count: followUpQuestionCount,
      });
      trackSwcaCampaignEvent({
        eventName: "swca_intake_submit_error",
        params: {
          selected_count: selectedIds.length,
          ranked_count: rankedIds.length,
          follow_up_count: followUpQuestionCount,
        },
      });

      toast({
        title: "We could not submit the form.",
        description: error instanceof Error ? error.message : "Please try again.",
        status: "error",
        duration: 4200,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box minH="100vh" bg="#FFFFFF" color={NAVY} px={{ base: 4, md: 8 }} py={{ base: 5, md: 10 }} pb={{ base: canSubmit ? 28 : 8, md: 10 }}>
      <Box maxW="980px" mx="auto">
        <Flex
          align={{ base: "center", md: "flex-start" }}
          justify="center"
          gap={{ base: 5, md: 8 }}
          direction={{ base: "column", md: "row" }}
          mb={{ base: 4, md: 8 }}
        >
          <Image
            src="/swca/spine-wellness-logo.png"
            alt="Spine and Wellness Centers of America"
            boxSize={{ base: "92px", md: "210px" }}
            objectFit="contain"
          />
          <Stack spacing={{ base: 2, md: 3 }} textAlign="center" flex="1" pt={{ base: 0, md: 4 }}>
            <Text fontSize={{ base: "lg", md: "4xl" }} letterSpacing="0.16em" textTransform="uppercase" lineHeight="1">
              Help Us
            </Text>
            <Heading
              as="h1"
              fontFamily="Georgia, 'Times New Roman', serif"
              fontSize={{ base: "3xl", md: "6xl" }}
              lineHeight="0.95"
              letterSpacing="0"
              textTransform="uppercase"
              fontWeight="700"
            >
              Understand
              <Box as="span" display="block">
                You Better
              </Box>
            </Heading>
            <Flex display={{ base: "none", md: "flex" }} align="center" justify="center" gap={3} color={ORANGE}>
              <Box h="1px" w={{ base: "82px", md: "240px" }} bg={ORANGE} />
              <Box boxSize="22px" borderLeft="3px solid" borderBottom="3px solid" borderColor={ORANGE} transform="rotate(-45deg)" />
              <Box h="1px" w={{ base: "82px", md: "240px" }} bg={ORANGE} />
            </Flex>
          </Stack>
        </Flex>

        <Stack spacing={1} textAlign="center" mb={{ base: 4, md: 6 }}>
          <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="700">
            <Box as="span" display={{ base: "none", md: "inline" }}>
              Please check all that apply.
            </Box>
            <Box as="span" display={{ base: "inline", md: "none" }}>
              Tap what matters most.
            </Box>
          </Text>
          <Text display={{ base: "none", md: "block" }} fontSize={{ base: "md", md: "lg" }} fontStyle="italic">
            This helps us customize your care and support your wellness journey.
          </Text>
        </Stack>

        <SimpleGrid display={{ base: "grid", md: "none" }} columns={4} spacing={2} mb={4}>
          {[
            { label: "1 Select", isActive: selectedIds.length === 0, isDone: selectedIds.length > 0 },
            { label: "2 Rank", isActive: selectedIds.length > 0 && !hasCommunicationConsent, isDone: hasCommunicationConsent },
            { label: "3 Agree", isActive: selectedIds.length > 0 && !hasCommunicationConsent, isDone: hasCommunicationConsent },
            { label: "4 Answer", isActive: hasCommunicationConsent, isDone: false },
          ].map((step) => (
            <Box
              key={step.label}
              textAlign="center"
              border="1px solid"
              borderColor={step.isActive || step.isDone ? ORANGE : "#D8DDE6"}
              bg={step.isDone ? "#FFF3E4" : step.isActive ? NAVY : "white"}
              color={step.isActive ? "white" : NAVY}
              borderRadius="full"
              px={2}
              py={2}
              fontSize="xs"
              fontWeight="900"
            >
              {step.label}
            </Box>
          ))}
        </SimpleGrid>

        <FormControl as="form" onSubmit={(event) => event.preventDefault()}>
          <VisuallyHidden>
            <Input
              name="website"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
              autoComplete="off"
              tabIndex={-1}
            />
          </VisuallyHidden>

          <Stack spacing={3}>
            {SWCA_CONCERNS.map((concern) => {
              const isSelected = selectedIds.includes(concern.id);

              return (
                <Flex
                  as="label"
                  key={concern.id}
                  align={{ base: "flex-start", md: "center" }}
                  gap={{ base: 3, md: 5 }}
                  p={{ base: 4, md: 5 }}
                  border="2px solid"
                  borderColor={isSelected ? ORANGE : LINE}
                  borderRadius="8px"
                  bg={isSelected ? "#FFF7EC" : "white"}
                  boxShadow={isSelected ? "0 10px 26px rgba(243, 154, 37, 0.16)" : "0 4px 14px rgba(7, 26, 58, 0.04)"}
                  cursor="pointer"
                  transition="border-color 160ms ease, background 160ms ease, box-shadow 160ms ease, transform 160ms ease"
                  _hover={{
                    borderColor: isSelected ? ORANGE : "#AEB4C0",
                    bg: isSelected ? "#FFF7EC" : "#F8FAFC",
                    transform: "translateY(-1px)",
                  }}
                >
                  <Checkbox
                    isChecked={isSelected}
                    onChange={() => toggleConcern(concern.id)}
                    size="lg"
                    colorScheme="orange"
                    mt={{ base: 1, md: 0 }}
                    aria-label={`Select ${concern.title}`}
                    sx={{
                      ".chakra-checkbox__control": {
                        borderColor: isSelected ? ORANGE : "#7C8496",
                        borderWidth: "2px",
                        boxSize: { base: "30px", md: "34px" },
                        bg: isSelected ? ORANGE : "white",
                      },
                    }}
                  />
                  <Flex
                    align="center"
                    justify="center"
                    boxSize={{ base: "34px", md: "38px" }}
                    flex="0 0 auto"
                    borderRadius="full"
                    bg={NAVY}
                    color="white"
                    fontWeight="800"
                    fontSize={{ base: "md", md: "lg" }}
                  >
                    {concern.number}
                  </Flex>
                  <Box flex="1" minW={0}>
                    <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight="800" lineHeight="1.18">
                      {concern.title}
                    </Text>
                    <Text fontSize={{ base: "md", md: "lg" }} lineHeight="1.35" mt={1}>
                      {concern.description}
                    </Text>
                  </Box>
                </Flex>
              );
            })}
          </Stack>

          {selectedConcerns.length > 0 ? (
            <Button
              display={{ base: "flex", md: "none" }}
              type="button"
              onClick={scrollToRankSection}
              mt={4}
              w="100%"
              minH="54px"
              bg={ORANGE}
              color={NAVY}
              fontWeight="900"
              _hover={{ bg: "#E88D19" }}
            >
              Continue to ranking
            </Button>
          ) : null}

          <Box ref={rankSectionRef} mt={{ base: 6, md: 8 }} border="1px solid" borderColor="#F3D9B4" bg="#FFF7EC" borderRadius="8px" p={{ base: 4, md: 6 }} scrollMarginTop="18px">
            <Stack spacing={4}>
              <Stack spacing={1} textAlign="center">
                <Box
                  boxSize="22px"
                  borderLeft="3px solid"
                  borderBottom="3px solid"
                  borderColor={ORANGE}
                  transform="rotate(-45deg)"
                  alignSelf="center"
                />
                <Heading as="h2" fontFamily="Georgia, 'Times New Roman', serif" size={{ base: "sm", md: "md" }} fontWeight="500">
                  <Box as="span" display={{ base: "none", md: "inline" }}>
                    Rank your selected priorities.
                  </Box>
                  <Box as="span" display={{ base: "inline", md: "none" }}>
                    Rank your priorities
                  </Box>
                </Heading>
                <Text fontStyle="italic">
                  {selectedConcerns.length > 0
                    ? `${selectedConcerns.length} selected. Put the most important item first.`
                    : "Tap any concern above, then put the most important item first."}
                </Text>
              </Stack>

              {selectedConcerns.length > 0 ? (
                <Stack spacing={3}>
                  {selectedConcerns.map((concern, index) => (
                    <Flex
                      key={concern.id}
                      align={{ base: "stretch", sm: "center" }}
                      direction={{ base: "column", sm: "row" }}
                      justify="space-between"
                      gap={3}
                      bg="white"
                      border="1px solid"
                      borderColor="#F0D2A4"
                      borderRadius="8px"
                      p={3}
                    >
                      <Flex align="center" gap={3}>
                        <Flex align="center" justify="center" boxSize="30px" borderRadius="full" bg={ORANGE} color={NAVY} fontWeight="900">
                          {index + 1}
                        </Flex>
                        <Text fontWeight="800" lineHeight="1.2">
                          {concern.title}
                        </Text>
                      </Flex>
                      <Flex gap={2} align="center" justify={{ base: "flex-end", sm: "center" }}>
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor={LINE}
                          color={NAVY}
                          onClick={() => moveRank(concern.id, "up")}
                          isDisabled={index === 0}
                        >
                          Up
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor={LINE}
                          color={NAVY}
                          onClick={() => moveRank(concern.id, "down")}
                          isDisabled={index === selectedConcerns.length - 1}
                        >
                          Down
                        </Button>
                      </Flex>
                    </Flex>
                  ))}
                </Stack>
              ) : (
                <Text textAlign="center" color="#5B6681">
                  Select one or more concerns above to rank your priorities.
                </Text>
              )}

              {selectedConcerns.length > 0 && !hasCommunicationConsent ? (
                <Button
                  display={{ base: "flex", md: "none" }}
                  type="button"
                  onClick={scrollToConsentSection}
                  w="100%"
                  minH="54px"
                  bg={ORANGE}
                  color={NAVY}
                  fontWeight="900"
                  _hover={{ bg: "#E88D19" }}
                >
                  Continue to agree
                </Button>
              ) : null}

              <Button
                display={{ base: "none", md: "inline-flex" }}
                type="button"
                onClick={handleSubmit}
                isDisabled={!canSubmit || isSubmitting}
                isLoading={isSubmitting}
                loadingText="Submitting"
                alignSelf="center"
                minW={{ base: "100%", sm: "220px" }}
                bg={NAVY}
                color="white"
                _hover={{ bg: "#102A55" }}
                _disabled={{ opacity: 0.45, cursor: "not-allowed" }}
              >
                Continue
              </Button>

              {selectedConcerns.length > 0 && !hasCommunicationConsent ? (
                <Text textAlign="center" color="#5B6681" fontSize="sm" fontWeight="700">
                  Check the consent box below to continue.
                </Text>
              ) : null}

              <Box ref={consentSectionRef} maxW="720px" mx="auto" w="100%" scrollMarginTop="18px">
                <Checkbox
                  id="swca-reward-consent"
                  isChecked={hasCommunicationConsent}
                  onChange={(event) => {
                    setSubmitState("idle");
                    setHasCommunicationConsent(event.target.checked);
                  }}
                  colorScheme="orange"
                  alignItems="flex-start"
                  size="lg"
                  w="100%"
                  p={{ base: 4, md: 5 }}
                  border="2px solid"
                  borderColor={hasCommunicationConsent ? ORANGE : "#C8CEDA"}
                  borderRadius="8px"
                  bg={hasCommunicationConsent ? "#FFF3E4" : "white"}
                  boxShadow={hasCommunicationConsent ? "0 14px 30px rgba(244,123,32,0.16)" : "0 10px 24px rgba(7,26,58,0.07)"}
                  cursor="pointer"
                  transition="border-color 160ms ease, background 160ms ease, box-shadow 160ms ease"
                  _hover={{
                    borderColor: ORANGE,
                    bg: hasCommunicationConsent ? "#FFF3E4" : "#FFF9F1",
                  }}
                  sx={{
                    ".chakra-checkbox__control": {
                      width: "28px",
                      height: "28px",
                      marginTop: "2px",
                    },
                    ".chakra-checkbox__label": {
                      width: "100%",
                      marginLeft: "14px",
                    },
                  }}
                >
                  <Text as="span" display="block" fontSize={{ base: "md", md: "lg" }} lineHeight="1.35" color="#17233D" fontWeight="900">
                    Tap here to agree
                  </Text>
                  <Text as="span" display="block" mt={1} fontSize={{ base: "sm", md: "md" }} lineHeight="1.45" color="#34405A" fontWeight="700">
                    I agree to receive my reward certificate and related follow-up using the contact information I provide.
                  </Text>
                </Checkbox>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  mt={2}
                  px={0}
                  h="auto"
                  minH="28px"
                  color={NAVY}
                  fontWeight="700"
                  fontSize="sm"
                  onClick={() => setIsConsentExpanded((current) => !current)}
                  _hover={{ bg: "transparent", color: "#102A55" }}
                  aria-expanded={isConsentExpanded}
                >
                  <Box as="span" mr={2} transform={isConsentExpanded ? "rotate(180deg)" : "rotate(0deg)"} transition="transform 160ms ease">
                    v
                  </Box>
                  Consent details
                </Button>
                <Collapse in={isConsentExpanded} animateOpacity>
                  <Text fontSize={{ base: "xs", md: "sm" }} lineHeight="1.45" color="#34405A" pt={2}>
                    {CONSENT_COPY}
                  </Text>
                </Collapse>
              </Box>

              <Button
                display={{ base: "flex", md: "none" }}
                type="button"
                onClick={handleSubmit}
                isDisabled={!canSubmit || isSubmitting}
                isLoading={isSubmitting}
                loadingText="Submitting"
                w="100%"
                minH="58px"
                bg={NAVY}
                color="white"
                _hover={{ bg: "#102A55" }}
                _disabled={{ opacity: 0.45, cursor: "not-allowed" }}
              >
                Continue
              </Button>

              {submitState === "success" ? (
                <Text textAlign="center" fontWeight="700">
                  Thank you for helping us understand you better.
                </Text>
              ) : null}
            </Stack>
          </Box>
        </FormControl>
      </Box>

      {canSubmit ? (
        <Box display={{ base: "block", md: "none" }} position="fixed" left={0} right={0} bottom={0} zIndex={10} bg="rgba(255,255,255,0.96)" borderTop="1px solid" borderColor="#E5E8EF" px={4} py={3} boxShadow="0 -10px 24px rgba(7,26,58,0.12)">
          <Button
            type="button"
            onClick={handleSubmit}
            isDisabled={isSubmitting}
            isLoading={isSubmitting}
            loadingText="Submitting"
            w="100%"
            minH="58px"
            bg={NAVY}
            color="white"
            _hover={{ bg: "#102A55" }}
          >
            Continue
          </Button>
        </Box>
      ) : null}

      <Modal isOpen={isFollowUpOpen} onClose={() => !isSubmitting && setIsFollowUpOpen(false)} size="xl" isCentered scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent borderRadius="8px" mx={4}>
          <ModalHeader color={NAVY} pb={2}>
            A few quick follow-up questions
          </ModalHeader>
          <ModalCloseButton isDisabled={isSubmitting} />
          <ModalBody>
            <Stack spacing={5} minH={{ base: "360px", md: "390px" }}>
              <Box>
                <Flex justify="space-between" gap={4} mb={2}>
                  <Text color="#34405A" fontSize="sm" fontWeight="700">
                    Question {Math.min(currentFollowUpStepIndex + 1, followUpSteps.length)} of {followUpSteps.length}
                  </Text>
                  <Text color="#34405A" fontSize="sm" fontWeight="700">
                    {followUpProgressValue}%
                  </Text>
                </Flex>
                <Progress value={followUpProgressValue} size="sm" borderRadius="full" colorScheme="orange" bg="#EEF0F4" />
              </Box>

              {currentFollowUpStep ? (
                <QuestionStep
                  step={currentFollowUpStep}
                  value={currentFollowUpValue}
                  onSelect={(optionId) => {
                    if (currentFollowUpStep.kind === "concern") {
                      setFollowUpAnswer(currentFollowUpStep.concern.id, currentFollowUpStep.question, optionId);
                      advanceFollowUpStep();
                      return;
                    }

                    setIntentAnswer(currentFollowUpStep.question, optionId);
                    advanceFollowUpStep();
                  }}
                />
              ) : null}
            </Stack>
          </ModalBody>
          <ModalFooter gap={3} flexWrap="wrap">
            <Button
              variant="ghost"
              onClick={() => {
                if (currentFollowUpStepIndex > 0) {
                  setCurrentFollowUpStepIndex((current) => Math.max(0, current - 1));
                  return;
                }

                setIsFollowUpOpen(false);
              }}
              isDisabled={isSubmitting}
            >
              {currentFollowUpStepIndex > 0 ? "Previous" : "Back"}
            </Button>
            {isLastFollowUpStep ? (
              <Button
                onClick={handleFinalSubmit}
                isDisabled={!canSubmitFollowUp || isSubmitting}
                isLoading={isSubmitting}
                loadingText="Submitting"
                bg={NAVY}
                color="white"
                _hover={{ bg: "#102A55" }}
              >
                Submit and spin
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentFollowUpStepIndex((current) => Math.min(followUpSteps.length - 1, current + 1))}
                isDisabled={!currentFollowUpStepComplete || isSubmitting}
                bg={NAVY}
                color="white"
                _hover={{ bg: "#102A55" }}
              >
                Next
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

function QuestionBlock({
  question,
  value,
  onSelect,
  helper,
}: {
  question: SwcaFollowUpQuestion;
  value?: SwcaQuestionAnswerValue;
  onSelect: (optionId: string) => void;
  helper?: string;
}) {
  return (
    <Stack spacing={3}>
      <Box>
        <Text fontWeight="800" color={NAVY} fontSize={{ base: "lg", md: "xl" }} lineHeight="1.25">
          {question.label}
        </Text>
        {helper ? (
          <Text color="#5B6681" fontSize="sm" mt={1}>
            {helper}
          </Text>
        ) : null}
      </Box>
      <Stack spacing={2}>
        {question.options.map((option) => {
          const isSelected = isOptionSelected(value, option.id);

          return (
            <Button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              variant={isSelected ? "solid" : "outline"}
              bg={isSelected ? NAVY : "white"}
              color={isSelected ? "white" : NAVY}
              borderColor={isSelected ? NAVY : LINE}
              justifyContent="flex-start"
              minH="48px"
              h="auto"
              py={3}
              px={4}
              whiteSpace="normal"
              textAlign="left"
              borderRadius="8px"
              w="100%"
              _hover={isSelected ? { bg: "#102A55" } : { bg: "#F7FAFC" }}
            >
              {option.label}
            </Button>
          );
        })}
      </Stack>
    </Stack>
  );
}

function QuestionStep({
  step,
  value,
  onSelect,
}: {
  step: FollowUpStep;
  value?: SwcaQuestionAnswerValue;
  onSelect: (optionId: string) => void;
}) {
  const eyebrow = step.kind === "concern" ? `Priority ${step.priority}` : "Your interest";
  const heading = step.kind === "concern" ? step.concern.title : "A little more context";
  const helper = step.question.type === "multi_select" ? "Select all that apply." : "Select one answer.";

  return (
    <Box border="1px solid" borderColor={LINE} borderRadius="8px" p={{ base: 4, md: 5 }} bg="white">
      <Stack spacing={5}>
        <Box>
          <Text color={ORANGE} fontWeight="800" fontSize="sm" textTransform="uppercase">
            {eyebrow}
          </Text>
          <Heading as="h3" size="sm" color={NAVY} mt={1}>
            {heading}
          </Heading>
        </Box>

        <QuestionBlock question={step.question} value={value} onSelect={onSelect} helper={helper} />
      </Stack>
    </Box>
  );
}

function resolveNextAnswerValue(currentValue: SwcaQuestionAnswerValue | undefined, optionId: string, type: SwcaFollowUpQuestion["type"]) {
  if (type === "single_select") return optionId;

  const currentValues = Array.isArray(currentValue) ? currentValue : [];
  return currentValues.includes(optionId)
    ? currentValues.filter((currentOptionId) => currentOptionId !== optionId)
    : [...currentValues, optionId];
}

function isOptionSelected(value: SwcaQuestionAnswerValue | undefined, optionId: string) {
  return Array.isArray(value) ? value.includes(optionId) : value === optionId;
}

function isAnswerComplete(value: SwcaQuestionAnswerValue | undefined) {
  if (Array.isArray(value)) return value.length > 0;
  return typeof value === "string" && value.length > 0;
}

function buildFollowUpAnswerPayload(concerns: SwcaConcern[], answers: SwcaFollowUpAnswers) {
  return concerns.reduce<SwcaFollowUpAnswers>((payload, concern) => {
    payload[concern.id] = answers[concern.id] ?? {};
    return payload;
  }, {});
}

function buildIntentAnswerPayload(answers: SwcaIntentAnswers) {
  return SWCA_INTENT_QUESTIONS.reduce<SwcaIntentAnswers>((payload, question) => {
    payload[question.id] = answers[question.id];
    return payload;
  }, {});
}
