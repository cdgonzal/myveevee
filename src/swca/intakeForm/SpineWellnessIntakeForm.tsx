import { useMemo, useState } from "react";
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
  Stack,
  Text,
  VisuallyHidden,
  useToast,
} from "@chakra-ui/react";
import { trackEvent } from "../../analytics/trackEvent";
import { trackSwcaCampaignEvent } from "../campaignEvents";
import { submitSwcaIntake } from "./api";
import { SWCA_CONCERNS, SWCA_INTAKE_FORM_ID } from "./concerns";
import type { SwcaConcern, SwcaConcernId, SwcaIntakeSubmission } from "./types";

const NAVY = "#071A3A";
const ORANGE = "#F39A25";
const LINE = "#D6D8DE";
const CONSENT_VERSION = "swca-reward-communication-v1";
const CONSENT_COPY =
  "I agree that Spine and Wellness Centers of America and VeeVee may use the contact information I provide in this reward flow to send my reward certificate and related follow-up by email or text message. Message and data rates may apply. Reply STOP to opt out of text messages.";

function moveItem(items: SwcaConcernId[], fromIndex: number, toIndex: number) {
  const nextItems = [...items];
  const [item] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, item);
  return nextItems;
}

export default function SpineWellnessIntakeForm() {
  const toast = useToast();
  const [selectedIds, setSelectedIds] = useState<SwcaConcernId[]>([]);
  const [rankedIds, setRankedIds] = useState<SwcaConcernId[]>([]);
  const [honeypot, setHoneypot] = useState("");
  const [hasCommunicationConsent, setHasCommunicationConsent] = useState(false);
  const [isConsentExpanded, setIsConsentExpanded] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const concernsById = useMemo(
    () => new Map(SWCA_CONCERNS.map((concern) => [concern.id, concern])),
    []
  );

  const selectedConcerns = rankedIds
    .map((id) => concernsById.get(id))
    .filter((concern): concern is SwcaConcern => Boolean(concern));

  const canSubmit = selectedIds.length > 0 && rankedIds.length === selectedIds.length && hasCommunicationConsent && !honeypot;

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

  const moveRank = (concernId: SwcaConcernId, direction: "up" | "down") => {
    const currentIndex = rankedIds.indexOf(concernId);
    if (currentIndex < 0) return;

    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= rankedIds.length) return;

    setRankedIds(moveItem(rankedIds, currentIndex, nextIndex));
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast({
        title: hasCommunicationConsent ? "Select and rank at least one concern." : "Please accept the reward communication consent.",
        status: "warning",
        duration: 2400,
      });
      return;
    }

    const submission: SwcaIntakeSubmission = {
      formId: SWCA_INTAKE_FORM_ID,
      sourcePath: window.location.pathname,
      pageUrl: window.location.href,
      clientSubmittedAt: new Date().toISOString(),
      userAgent: window.navigator.userAgent,
      selectedConcernIds: selectedIds,
      rankedConcernIds: rankedIds,
      concernsSnapshot: SWCA_CONCERNS,
      consentAgreement: {
        rewardCommunicationConsent: true,
        consentVersion: CONSENT_VERSION,
        consentCopy: CONSENT_COPY,
        consentedAt: new Date().toISOString(),
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
      });
      trackSwcaCampaignEvent({
        eventName: "swca_intake_submit_success",
        submissionId: result.submissionId,
        mode: result.mode,
        params: {
          selected_count: selectedIds.length,
          ranked_count: rankedIds.length,
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
      });
      trackSwcaCampaignEvent({
        eventName: "swca_intake_submit_error",
        params: {
          selected_count: selectedIds.length,
          ranked_count: rankedIds.length,
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
    <Box minH="100vh" bg="#FFFFFF" color={NAVY} px={{ base: 4, md: 8 }} py={{ base: 7, md: 10 }}>
      <Box maxW="980px" mx="auto">
        <Flex
          align={{ base: "center", md: "flex-start" }}
          justify="center"
          gap={{ base: 5, md: 8 }}
          direction={{ base: "column", md: "row" }}
          mb={{ base: 5, md: 8 }}
        >
          <Image
            src="/swca/spine-wellness-logo.png"
            alt="Spine and Wellness Centers of America"
            boxSize={{ base: "150px", md: "210px" }}
            objectFit="contain"
          />
          <Stack spacing={3} textAlign="center" flex="1" pt={{ base: 0, md: 4 }}>
            <Text fontSize={{ base: "2xl", md: "4xl" }} letterSpacing="0.16em" textTransform="uppercase" lineHeight="1">
              Help Us
            </Text>
            <Heading
              as="h1"
              fontFamily="Georgia, 'Times New Roman', serif"
              fontSize={{ base: "4xl", md: "6xl" }}
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
            <Flex align="center" justify="center" gap={3} color={ORANGE}>
              <Box h="1px" w={{ base: "82px", md: "240px" }} bg={ORANGE} />
              <Box boxSize="22px" borderLeft="3px solid" borderBottom="3px solid" borderColor={ORANGE} transform="rotate(-45deg)" />
              <Box h="1px" w={{ base: "82px", md: "240px" }} bg={ORANGE} />
            </Flex>
          </Stack>
        </Flex>

        <Stack spacing={1} textAlign="center" mb={6}>
          <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="700">
            Please check all that apply.
          </Text>
          <Text fontSize={{ base: "md", md: "lg" }} fontStyle="italic">
            This helps us customize your care and support your wellness journey.
          </Text>
        </Stack>

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

          <Stack spacing={0} borderTop="1px solid" borderColor={LINE}>
            {SWCA_CONCERNS.map((concern) => {
              const isSelected = selectedIds.includes(concern.id);

              return (
                <Flex
                  key={concern.id}
                  align={{ base: "flex-start", md: "center" }}
                  gap={{ base: 3, md: 5 }}
                  py={{ base: 4, md: 5 }}
                  borderBottom="1px solid"
                  borderColor={LINE}
                >
                  <Checkbox
                    isChecked={isSelected}
                    onChange={() => toggleConcern(concern.id)}
                    size="lg"
                    colorScheme="orange"
                    mt={{ base: 1, md: 0 }}
                    aria-label={`Select ${concern.title}`}
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

          <Box mt={{ base: 6, md: 8 }} border="1px solid" borderColor="#F3D9B4" bg="#FFF7EC" borderRadius="8px" p={{ base: 4, md: 6 }}>
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
                  Rank your selected priorities.
                </Heading>
                <Text fontStyle="italic">
                  Move the most important items to the top before submitting.
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

              <Button
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
                Submit
              </Button>

              <Box maxW="720px" mx="auto" w="100%">
                <Checkbox
                  isChecked={hasCommunicationConsent}
                  onChange={(event) => {
                    setSubmitState("idle");
                    setHasCommunicationConsent(event.target.checked);
                  }}
                  colorScheme="orange"
                  alignItems="flex-start"
                  size="sm"
                >
                  <Text as="span" fontSize={{ base: "xs", md: "sm" }} lineHeight="1.45" color="#34405A">
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

              {submitState === "success" ? (
                <Text textAlign="center" fontWeight="700">
                  Thank you for helping us understand you better.
                </Text>
              ) : null}
            </Stack>
          </Box>
        </FormControl>
      </Box>
    </Box>
  );
}
