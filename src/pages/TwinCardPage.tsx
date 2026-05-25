import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Image,
  Input,
  Link,
  Radio,
  RadioGroup,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { createTwinCard } from "../twinCard/api";
import { TWIN_CARD_EVENT_DATE, TWIN_CARD_EVENT_LOCATION, TWIN_CARD_EVENT_NAME, TWIN_CARD_INTERESTS, getTwinCardInterestLabel } from "../twinCard/constants";
import { downloadTwinCardSvg } from "../twinCard/cardDownload";
import { trackTwinCardEvent } from "../twinCard/events";
import { fileToTwinCardImageDataUrl } from "../twinCard/image";
import { saveTwinCardLead } from "../twinCard/storage";
import { TwinCardPrintView } from "../twinCard/TwinCardPrintView";
import type { TwinCardFormValues, TwinCardLead } from "../twinCard/types";
import { APP_LINKS } from "../config/links";

type FlowStep = "form" | "photo" | "generating" | "preview";

const initialForm: TwinCardFormValues = {
  firstName: "",
  contact: "",
  wellnessInterest: "prepare_for_care",
  consentAccepted: false,
  betaInterest: true,
};

export default function TwinCardPage() {
  const [step, setStep] = useState<FlowStep>("form");
  const [form, setForm] = useState<TwinCardFormValues>(initialForm);
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [lead, setLead] = useState<TwinCardLead | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    trackTwinCardEvent("public.twin_card.viewed");
  }, []);

  const formIsValid = form.firstName.trim() && form.contact.trim() && form.consentAccepted;
  const resultPath = lead ? `/twin-card/result/${lead.cardId}` : APP_LINKS.internal.twinCard;

  const updateForm = <K extends keyof TwinCardFormValues>(key: K, value: TwinCardFormValues[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    try {
      const dataUrl = await fileToTwinCardImageDataUrl(file);
      setPhotoDataUrl(dataUrl);
      trackTwinCardEvent("public.twin_card.photo_selected");
    } catch {
      setError("That photo could not be loaded. Please try a different image.");
    }
  };

  const generateCard = async () => {
    if (!photoDataUrl) {
      setError("Please take or upload a photo first.");
      return;
    }

    const now = new Date().toISOString();
    const cardId = crypto.randomUUID();
    const localLead: TwinCardLead = {
      id: cardId,
      cardId,
      firstName: form.firstName.trim(),
      contact: form.contact.trim(),
      contactType: form.contact.includes("@") ? "email" : /\d/.test(form.contact) ? "phone" : "unknown",
      wellnessInterest: form.wellnessInterest,
      wellnessInterestLabel: getTwinCardInterestLabel(form.wellnessInterest),
      consentAccepted: form.consentAccepted,
      betaInterest: form.betaInterest,
      sourceImageDataUrl: photoDataUrl,
      cardResultUrl: `${window.location.origin}/twin-card/result/${cardId}`,
      generationStatus: "generating",
      generationProvider: "bedrock",
      eventName: TWIN_CARD_EVENT_NAME,
      boothDeviceId: window.navigator.userAgent.slice(0, 80),
      createdAt: now,
      updatedAt: now,
    };

    setStep("generating");
    trackTwinCardEvent("public.twin_card.generation_requested", localLead);
    const generatedLead = await createTwinCard(localLead);
    saveTwinCardLead(generatedLead);
    setLead(generatedLead);
    setStep("preview");
    trackTwinCardEvent(
      generatedLead.generationStatus === "fallback_used"
        ? "public.twin_card.fallback_used"
        : "public.twin_card.generation_completed",
      generatedLead
    );
  };

  const printCard = () => {
    if (lead) {
      trackTwinCardEvent("public.twin_card.print_clicked", lead);
    }
    window.print();
  };

  const resetFlow = () => {
    setStep("form");
    setForm(initialForm);
    setPhotoDataUrl("");
    setLead(null);
    setError("");
  };

  return (
    <Box minH="100vh" bg="#f7fbff" color="#061b38">
      <Box as="style">{printCss}</Box>
      <Box maxW="1180px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 5, md: 8 }}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 6, lg: 8 }} alignItems="start">
          <Stack spacing={6}>
            <HStack spacing={3}>
              <Image src="/brand/2026/icon.svg" alt="VeeVee" h="34px" />
              <Image src="/brand/2026/wordmark.svg" alt="VeeVee" h="13px" />
            </HStack>

            <Stack spacing={3}>
              <Text fontSize="xs" fontWeight="900" letterSpacing="0.16em" textTransform="uppercase" color="#1177BA">
                {TWIN_CARD_EVENT_NAME} · {TWIN_CARD_EVENT_DATE}
              </Text>
              <Heading as="h1" fontSize={{ base: "38px", md: "56px" }} lineHeight="1" letterSpacing="0">
                Create your VeeVee Twin Card.
              </Heading>
              <Text fontSize={{ base: "md", md: "lg" }} color="#35445d" maxW="620px">
                Enter your first name, choose what you want your Twin to help with, and take a photo. Your card is a
                visual keepsake for the expo, not a medical record.
              </Text>
            </Stack>

            <HStack spacing={3} wrap="wrap">
              {["Lead", "Photo", "Card", "Print"].map((label, index) => (
                <Box key={label} px={3} py={2} borderRadius="8px" bg={stepIndex(step) >= index ? "#06254C" : "white"} color={stepIndex(step) >= index ? "white" : "#48617f"} border="1px solid #dbeaf5" fontSize="sm" fontWeight="800">
                  {label}
                </Box>
              ))}
            </HStack>

            <Box bg="white" border="1px solid #dbeaf5" borderRadius="8px" p={{ base: 4, md: 6 }} boxShadow="0 18px 45px rgba(6, 37, 76, 0.08)">
              {step === "form" ? (
                <Stack spacing={4}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>First name</FormLabel>
                      <Input value={form.firstName} onChange={(event) => updateForm("firstName", event.target.value)} placeholder="Charlie" />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Email or phone</FormLabel>
                      <Input value={form.contact} onChange={(event) => updateForm("contact", event.target.value)} placeholder="name@email.com" />
                    </FormControl>
                  </SimpleGrid>
                  <FormControl>
                    <FormLabel>Wellness interest</FormLabel>
                    <RadioGroup value={form.wellnessInterest} onChange={(value) => updateForm("wellnessInterest", value as TwinCardFormValues["wellnessInterest"])}>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        {TWIN_CARD_INTERESTS.map((interest) => (
                          <Radio key={interest.id} value={interest.id} border="1px solid #dbeaf5" borderRadius="8px" p={3}>
                            {interest.label}
                          </Radio>
                        ))}
                      </SimpleGrid>
                    </RadioGroup>
                  </FormControl>
                  <Checkbox isChecked={form.betaInterest} onChange={(event) => updateForm("betaInterest", event.target.checked)}>
                    I am interested in VeeVee beta access.
                  </Checkbox>
                  <Checkbox isChecked={form.consentAccepted} onChange={(event) => updateForm("consentAccepted", event.target.checked)}>
                    I agree that VeeVee may use my photo to generate my Twin Card and may contact me about VeeVee updates or beta access.
                  </Checkbox>
                  <Button isDisabled={!formIsValid} onClick={() => { setStep("photo"); trackTwinCardEvent("public.twin_card.lead_submitted"); }}>
                    Continue to Photo
                  </Button>
                </Stack>
              ) : null}

              {step === "photo" ? (
                <Stack spacing={4}>
                  <FormControl isInvalid={Boolean(error)}>
                    <FormLabel>Take or upload a photo</FormLabel>
                    <Input type="file" accept="image/*" capture="user" py={1} onChange={(event) => handlePhoto(event.target.files?.[0])} />
                    <FormErrorMessage>{error}</FormErrorMessage>
                  </FormControl>
                  {photoDataUrl ? <Image src={photoDataUrl} alt="Selected Twin Card source" borderRadius="8px" maxH="320px" objectFit="cover" /> : null}
                  <Text fontSize="sm" color="#5d6880">
                    Your photo is used to create your visual Twin Card. VeeVee does not diagnose medical conditions from your photo.
                  </Text>
                  <HStack>
                    <Button variant="outline" onClick={() => setStep("form")}>Back</Button>
                    <Button onClick={generateCard} isDisabled={!photoDataUrl}>Create Card</Button>
                  </HStack>
                </Stack>
              ) : null}

              {step === "generating" ? (
                <Stack spacing={3} minH="220px" justify="center">
                  <Heading as="h2" size="md">Creating your VeeVee Twin Card...</Heading>
                  <Text color="#5d6880">This usually takes a moment. Your photo is used only to create your visual Twin Card.</Text>
                </Stack>
              ) : null}

              {step === "preview" && lead ? (
                <Stack spacing={4}>
                  <Text fontWeight="800" color={lead.generationStatus === "fallback_used" ? "#8a5a00" : "#1177BA"}>
                    {lead.generationMessage ?? "Your VeeVee Twin Card is ready."}
                  </Text>
                  <HStack wrap="wrap">
                    <Button onClick={printCard}>Print Card</Button>
                    <Button variant="outline" onClick={() => { downloadTwinCardSvg(lead); trackTwinCardEvent("public.twin_card.download_clicked", lead); }}>Save Image</Button>
                    <Button variant="outline" onClick={resetFlow}>Try Again</Button>
                    <Button as={RouterLink} to={resultPath} variant="outline">Open Result</Button>
                  </HStack>
                  <Link as={RouterLink} to={APP_LINKS.internal.healthTwin} color="#1177BA" fontWeight="900">
                    Join the VeeVee Beta
                  </Link>
                </Stack>
              ) : null}
            </Box>

            <Text fontSize="sm" color="#5d6880">
              Event location: {TWIN_CARD_EVENT_LOCATION}. The Twin Card is a brand and wellness identity artifact, not a medical report.
            </Text>
          </Stack>

          <Stack spacing={4} align="center">
            {lead ? (
              <TwinCardPrintView lead={lead} />
            ) : (
              <PreviewPlaceholder form={form} photoDataUrl={photoDataUrl} />
            )}
          </Stack>
        </SimpleGrid>
      </Box>
    </Box>
  );
}

function PreviewPlaceholder({ form, photoDataUrl }: { form: TwinCardFormValues; photoDataUrl: string }) {
  const previewLead = useMemo<TwinCardLead>(() => {
    const now = new Date().toISOString();
    return {
      id: "preview",
      cardId: "preview",
      firstName: form.firstName.trim() || "Charlie",
      contact: form.contact,
      contactType: "unknown",
      wellnessInterest: form.wellnessInterest,
      wellnessInterestLabel: getTwinCardInterestLabel(form.wellnessInterest),
      consentAccepted: form.consentAccepted,
      betaInterest: form.betaInterest,
      sourceImageDataUrl: photoDataUrl,
      generatedAvatarDataUrl: photoDataUrl,
      cardResultUrl: "https://myveevee.com/twin-card/result/preview",
      generationStatus: "not_started",
      generationProvider: "fallback",
      eventName: TWIN_CARD_EVENT_NAME,
      createdAt: now,
      updatedAt: now,
    };
  }, [form, photoDataUrl]);

  return <TwinCardPrintView lead={previewLead} />;
}

function stepIndex(step: FlowStep) {
  return step === "form" ? 0 : step === "photo" ? 1 : step === "generating" ? 2 : 3;
}

const printCss = `
@media print {
  body * { visibility: hidden !important; }
  .twin-card-print-area, .twin-card-print-area * { visibility: visible !important; }
  .twin-card-print-area {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 5in !important;
    height: 7in !important;
    box-shadow: none !important;
  }
  @page { size: 5in 7in; margin: 0; }
}
`;
