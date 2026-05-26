import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Image,
  Input,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { createTwinCard } from "../twinCard/api";
import {
  TWIN_CARD_EVENT_DATE,
  TWIN_CARD_EVENT_NAME,
  TWIN_CARD_INTERESTS,
  getTwinCardInterestLabel,
} from "../twinCard/constants";
import { trackTwinCardEvent } from "../twinCard/events";
import { fileToTwinCardImageDataUrl } from "../twinCard/image";
import { buildTwinCardPrintCss } from "../twinCard/printContract";
import { saveTwinCardLead } from "../twinCard/storage";
import type { TwinCardFormValues, TwinCardInterestId, TwinCardLead } from "../twinCard/types";

type FlowStep = "language" | "lead" | "goals" | "consent" | "camera" | "success";
type FlowLanguage = "en" | "es";

const initialForm: TwinCardFormValues = {
  firstName: "",
  contact: "",
  wellnessInterest: "track_goals",
  consentAccepted: false,
  betaInterest: true,
};

const copy = {
  en: {
    start: "Start",
    title: "Create your VeeVee Twin Card",
    event: `${TWIN_CARD_EVENT_NAME} · ${TWIN_CARD_EVENT_DATE}`,
    firstName: "First name",
    email: "Email",
    continue: "Continue",
    goalsTitle: "Choose your 3-6 month wellness goal",
    goals: {
      track_goals: "Feel stronger every week",
      prepare_for_care: "Feel ready for my next visit",
      support_loved_one: "Support my family wellness",
    },
    consentTitle: "One quick consent",
    consent:
      "I agree that VeeVee may use my photo to create my Twin Card and may email me about my card, VeeVee updates, or beta access.",
    consentDetails: "Consent details",
    consentBody:
      "Your photo is used for visual personalization only. VeeVee does not diagnose medical conditions from your photo. Your Twin Card is not a medical record.",
    cameraTitle: "Get ready for your Health Twin photo",
    cameraBody: "Look at the camera. Smile. Your Twin Card is almost ready.",
    countdownButton: "Start Countdown",
    openCamera: "Open Camera",
    generating: "Creating your Twin Card...",
    successTitle: "You're done.",
    successBody: "Go to the booth to print your Health Twin, or watch your email for confirmation.",
    restart: "Restart",
    photoError: "That photo could not be loaded. Please try again.",
    requiredError: "First name and email are required.",
  },
  es: {
    start: "Comenzar",
    title: "Crea tu VeeVee Twin Card",
    event: `${TWIN_CARD_EVENT_NAME} · ${TWIN_CARD_EVENT_DATE}`,
    firstName: "Nombre",
    email: "Email",
    continue: "Continuar",
    goalsTitle: "Elige tu meta de bienestar para 3-6 meses",
    goals: {
      track_goals: "Sentirme mas fuerte cada semana",
      prepare_for_care: "Sentirme listo para mi proxima visita",
      support_loved_one: "Apoyar el bienestar de mi familia",
    },
    consentTitle: "Un consentimiento rapido",
    consent:
      "Acepto que VeeVee use mi foto para crear mi Twin Card y me envie emails sobre mi tarjeta, novedades de VeeVee o acceso beta.",
    consentDetails: "Detalles del consentimiento",
    consentBody:
      "Tu foto se usa solo para personalizacion visual. VeeVee no diagnostica condiciones medicas usando tu foto. Tu Twin Card no es un record medico.",
    cameraTitle: "Preparate para la foto de tu Health Twin",
    cameraBody: "Mira la camara. Sonrie. Tu Twin Card casi esta lista.",
    countdownButton: "Iniciar cuenta regresiva",
    openCamera: "Abrir camara",
    generating: "Creando tu Twin Card...",
    successTitle: "Listo.",
    successBody: "Ve al booth para imprimir tu Health Twin, o espera la confirmacion por email.",
    restart: "Reiniciar",
    photoError: "No pudimos cargar esa foto. Intenta otra vez.",
    requiredError: "Nombre y email son requeridos.",
  },
} satisfies Record<FlowLanguage, any>;

export default function TwinCardPage() {
  const [step, setStep] = useState<FlowStep>("language");
  const [language, setLanguage] = useState<FlowLanguage>("en");
  const [form, setForm] = useState<TwinCardFormValues>(initialForm);
  const [showConsentDetails, setShowConsentDetails] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const t = copy[language];

  useEffect(() => {
    trackTwinCardEvent("public.twin_card.viewed");
  }, []);

  const updateForm = <K extends keyof TwinCardFormValues>(key: K, value: TwinCardFormValues[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const chooseLanguage = (nextLanguage: FlowLanguage) => {
    setLanguage(nextLanguage);
    setStep("lead");
    trackTwinCardEvent("public.twin_card.lead_started");
  };

  const submitLead = () => {
    if (!form.firstName.trim() || !form.contact.trim()) {
      setError(t.requiredError);
      return;
    }
    setError("");
    trackTwinCardEvent("public.twin_card.lead_submitted");
    setStep("goals");
  };

  const chooseGoal = (goal: TwinCardInterestId) => {
    updateForm("wellnessInterest", goal);
    setStep("consent");
  };

  const acceptConsent = () => {
    updateForm("consentAccepted", true);
    setStep("camera");
  };

  const startCountdown = () => {
    setError("");
    setCameraReady(false);
    setCountdown(4);
    let next = 4;
    const timer = window.setInterval(() => {
      next -= 1;
      if (next <= 0) {
        window.clearInterval(timer);
        setCountdown(null);
        setCameraReady(true);
        cameraInputRef.current?.click();
        return;
      }
      setCountdown(next);
    }, 650);
  };

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setIsGenerating(true);

    try {
      const photoDataUrl = await fileToTwinCardImageDataUrl(file);
      trackTwinCardEvent("public.twin_card.photo_selected");
      const generatedLead = await createTwinCard(buildLead(photoDataUrl));
      saveTwinCardLead(generatedLead);
      trackTwinCardEvent(
        generatedLead.generationStatus === "fallback_used"
          ? "public.twin_card.fallback_used"
          : "public.twin_card.generation_completed",
        generatedLead
      );
      setStep("success");
    } catch {
      setError(t.photoError);
    } finally {
      setIsGenerating(false);
    }
  };

  const buildLead = (photoDataUrl: string): TwinCardLead => {
    const now = new Date().toISOString();
    const cardId = crypto.randomUUID();

    return {
      id: cardId,
      cardId,
      firstName: form.firstName.trim(),
      contact: form.contact.trim(),
      contactType: "email",
      wellnessInterest: form.wellnessInterest,
      wellnessInterestLabel: getTwinCardInterestLabel(form.wellnessInterest),
      consentAccepted: true,
      betaInterest: true,
      sourceImageDataUrl: photoDataUrl,
      cardResultUrl: `${window.location.origin}/twin-card/result/${cardId}`,
      generationStatus: "generating",
      generationProvider: "bedrock",
      eventName: TWIN_CARD_EVENT_NAME,
      boothDeviceId: window.navigator.userAgent.slice(0, 80),
      createdAt: now,
      updatedAt: now,
    };
  };

  const restart = () => {
    setStep("language");
    setForm(initialForm);
    setShowConsentDetails(false);
    setCountdown(null);
    setCameraReady(false);
    setIsGenerating(false);
    setError("");
  };

  return (
    <Box minH="100vh" bg="#f7fbff" color="#061b38">
      <Box as="style">{printCss}</Box>
      <Box maxW="760px" mx="auto" px={{ base: 5, md: 8 }} py={{ base: 6, md: 10 }}>
        <Stack minH={{ base: "calc(100vh - 48px)", md: "calc(100vh - 80px)" }} justify="center" spacing={8}>
          <HStack spacing={3} justify="center">
            <Image src="/brand/2026/icon.svg" alt="VeeVee" h="38px" />
            <Image src="/brand/2026/wordmark.svg" alt="VeeVee" h="14px" />
          </HStack>

          <Box bg="white" border="1px solid #dbeaf5" borderRadius="8px" p={{ base: 5, md: 8 }} boxShadow="0 18px 45px rgba(6, 37, 76, 0.08)">
            {step === "language" ? (
              <Stack spacing={8} textAlign="center">
                <Stack spacing={3}>
                  <Text fontSize="xs" fontWeight="900" letterSpacing="0.16em" textTransform="uppercase" color="#1177BA">
                    {copy.en.event}
                  </Text>
                  <Heading as="h1" fontSize={{ base: "38px", md: "56px" }} lineHeight="1" letterSpacing="0">
                    VeeVee Twin Card
                  </Heading>
                </Stack>
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <Button minH="72px" fontSize="xl" onClick={() => chooseLanguage("en")}>
                    Start
                  </Button>
                  <Button minH="72px" fontSize="xl" onClick={() => chooseLanguage("es")}>
                    Comenzar
                  </Button>
                </SimpleGrid>
              </Stack>
            ) : null}

            {step === "lead" ? (
              <Stack spacing={5}>
                <StepHeader title={t.title} eyebrow={t.event} />
                <FormControl isRequired isInvalid={Boolean(error)}>
                  <FormLabel>{t.firstName}</FormLabel>
                  <Input value={form.firstName} onChange={(event) => updateForm("firstName", event.target.value)} autoFocus />
                </FormControl>
                <FormControl isRequired isInvalid={Boolean(error)}>
                  <FormLabel>{t.email}</FormLabel>
                  <Input type="email" value={form.contact} onChange={(event) => updateForm("contact", event.target.value)} />
                  <FormErrorMessage>{error}</FormErrorMessage>
                </FormControl>
                <Button onClick={submitLead}>{t.continue}</Button>
              </Stack>
            ) : null}

            {step === "goals" ? (
              <Stack spacing={5}>
                <StepHeader title={t.goalsTitle} eyebrow={t.event} />
                <Stack spacing={3}>
                  {TWIN_CARD_INTERESTS.map((goal) => (
                    <Button
                      key={goal.id}
                      minH={{ base: "70px", md: "82px" }}
                      whiteSpace="normal"
                      onClick={() => chooseGoal(goal.id)}
                    >
                      {t.goals[goal.id as keyof typeof t.goals]}
                    </Button>
                  ))}
                </Stack>
              </Stack>
            ) : null}

            {step === "consent" ? (
              <Stack spacing={5}>
                <StepHeader title={t.consentTitle} eyebrow={t.event} />
                <Checkbox size="lg" isChecked={form.consentAccepted} onChange={acceptConsent}>
                  {t.consent}
                </Checkbox>
                <Button
                  variant="ghost"
                  justifyContent="space-between"
                  px={0}
                  onClick={() => setShowConsentDetails((current) => !current)}
                >
                  <Text as="span">{t.consentDetails}</Text>
                  <Text as="span" transform={showConsentDetails ? "rotate(180deg)" : "none"} transition="transform 160ms ease">
                    v
                  </Text>
                </Button>
                <Collapse in={showConsentDetails} animateOpacity>
                  <Box bg="#eefaff" border="1px solid #dbeaf5" borderRadius="8px" p={4}>
                    <Text color="#35445d">{t.consentBody}</Text>
                  </Box>
                </Collapse>
              </Stack>
            ) : null}

            {step === "camera" ? (
              <Stack spacing={6} textAlign="center">
                <StepHeader title={t.cameraTitle} eyebrow={t.event} />
                <Text fontSize="lg" color="#35445d">
                  {isGenerating ? t.generating : t.cameraBody}
                </Text>
                {countdown ? (
                  <Text fontSize="90px" lineHeight="1" fontWeight="900" color="#1177BA">
                    {countdown}
                  </Text>
                ) : !cameraReady ? (
                  <Button minH="72px" fontSize="xl" onClick={startCountdown} isLoading={isGenerating}>
                    {t.countdownButton}
                  </Button>
                ) : null}
                <Input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  display="none"
                  onChange={(event) => handlePhoto(event.target.files?.[0])}
                />
                {cameraReady ? (
                  <Button variant="outline" onClick={() => cameraInputRef.current?.click()} isDisabled={isGenerating}>
                    {t.openCamera}
                  </Button>
                ) : null}
                {error ? <Text color="#8a3b3b">{error}</Text> : null}
              </Stack>
            ) : null}

            {step === "success" ? (
              <Stack spacing={7} textAlign="center" align="center">
                <Box
                  w="132px"
                  h="132px"
                  borderRadius="full"
                  bg="#e9fbff"
                  color="#1177BA"
                  display="grid"
                  placeItems="center"
                  fontSize="76px"
                  fontWeight="900"
                >
                  OK
                </Box>
                <Stack spacing={3}>
                  <Heading as="h1" fontSize={{ base: "42px", md: "58px" }} lineHeight="1">
                    {t.successTitle}
                  </Heading>
                  <Text fontSize="xl" color="#35445d">
                    {t.successBody}
                  </Text>
                </Stack>
                <Button variant="outline" onClick={restart}>
                  {t.restart}
                </Button>
              </Stack>
            ) : null}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

function StepHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <Stack spacing={2} textAlign="center">
      <Text fontSize="xs" fontWeight="900" letterSpacing="0.16em" textTransform="uppercase" color="#1177BA">
        {eyebrow}
      </Text>
      <Heading as="h1" fontSize={{ base: "32px", md: "48px" }} lineHeight="1.05" letterSpacing="0">
        {title}
      </Heading>
    </Stack>
  );
}

const printCss = buildTwinCardPrintCss();
