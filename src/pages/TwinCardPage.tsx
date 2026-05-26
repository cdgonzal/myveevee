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
  useToast,
} from "@chakra-ui/react";
import { createTwinCard } from "../twinCard/api";
import {
  TWIN_CARD_EVENT_DATE,
  TWIN_CARD_EVENT_NAME,
  TWIN_CARD_INTERESTS,
  getTwinCardInterestLabel,
} from "../twinCard/constants";
import { trackTwinCardEvent } from "../twinCard/events";
import { fileToTwinCardPreparedImage } from "../twinCard/image";
import { buildTwinCardPrintCss } from "../twinCard/printContract";
import { saveTwinCardLead } from "../twinCard/storage";
import type { TwinCardFormValues, TwinCardInterestId, TwinCardLead } from "../twinCard/types";
import type { TwinCardImageUpload } from "../twinCard/uploadContract";

type FlowStep = "language" | "lead" | "goals" | "consent" | "camera" | "success";
type FlowLanguage = "en" | "es";

const CONFIRMATION_REDIRECT_MS = 12_000;
const CONFIRMATION_REDIRECT_SECONDS = Math.ceil(CONFIRMATION_REDIRECT_MS / 1000);
const CONFIRMATION_REDIRECT_URL = "https://myveevee.com/swca/funnel";

type ConfirmationMode = "restart" | "redirect";

type CaptureConfirmation = {
  fileName: string;
  timestamp: string;
};

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
    goalsTitle: "Choose your wellness focus",
    goals: {
      track_goals: {
        title: "Move With Less Pain",
        subtitle: "Focus on comfort and mobility.",
        bullets: ["Ease daily movement", "Reduce stiffness", "Feel more comfortable"],
      },
      prepare_for_care: {
        title: "Get Back To Life",
        subtitle: "Return to what matters most.",
        bullets: ["Do more each day", "Feel more confident", "Enjoy family and activity"],
      },
      support_loved_one: {
        title: "Explore Advanced Care",
        subtitle: "Learn about more care options.",
        bullets: ["Functional medicine", "Bracing and support", "Specialty treatments"],
      },
    },
    consentTitle: "One quick consent",
    consent:
      "I agree that VeeVee may use my photo to create my Twin Card and may email me about my card, VeeVee updates, or beta access.",
    consentDetails: "Consent details",
    consentBody:
      "Your photo and responses are used to create a visual Twin Card experience for educational, promotional, and informational purposes only. VeeVee does not diagnose, treat, prevent, or monitor any medical condition from your photo or answers. Your Twin Card is not medical advice, not a medical record, and does not replace care from a licensed clinician. By continuing, you give VeeVee permission to process your photo, create and display your Twin Card, email you about your card and VeeVee, and release VeeVee and its partners from claims related to this non-medical experience.",
    cameraTitle: "Get ready for your Health Twin photo",
    cameraBody: "Look at the camera. Smile. Your Twin Card is almost ready.",
    openCamera: "Open Camera",
    generating: "Creating your Twin Card...",
    successPill: "Success",
    successTitle: "Your Health Twin is captured.",
    successInstructions: {
      print: "Go to the booth to obtain your printed Health Twin Card.",
      email: "Receive your email confirmation with your Health Twin.",
    },
    successRestarting: "This booth will restart in",
    successRedirecting: "You will be redirected in",
    seconds: "seconds",
    restart: "Restart",
    photoError: "That photo could not be loaded. Please try again.",
    requiredError: "First name and email are required.",
    toastTitle: "Health Twin capture confirmed",
    toastDescription: "File saved",
  },
  es: {
    start: "Comenzar",
    title: "Crea tu VeeVee Twin Card",
    event: `${TWIN_CARD_EVENT_NAME} · ${TWIN_CARD_EVENT_DATE}`,
    firstName: "Nombre",
    email: "Email",
    continue: "Continuar",
    goalsTitle: "Elige tu enfoque de bienestar",
    goals: {
      track_goals: {
        title: "Moverme con menos dolor",
        subtitle: "Enfocarme en comodidad y movimiento.",
        bullets: ["Moverme mejor cada dia", "Reducir rigidez", "Sentirme mas comodo"],
      },
      prepare_for_care: {
        title: "Volver a mi vida",
        subtitle: "Regresar a lo que mas importa.",
        bullets: ["Hacer mas cada dia", "Sentirme con mas confianza", "Disfrutar familia y actividad"],
      },
      support_loved_one: {
        title: "Explorar cuidado avanzado",
        subtitle: "Conocer mas opciones de cuidado.",
        bullets: ["Medicina funcional", "Soporte y bracing", "Tratamientos especiales"],
      },
    },
    consentTitle: "Un consentimiento rapido",
    consent:
      "Acepto que VeeVee use mi foto para crear mi Twin Card y me envie emails sobre mi tarjeta, novedades de VeeVee o acceso beta.",
    consentDetails: "Detalles del consentimiento",
    consentBody:
      "Tu foto y respuestas se usan para crear una experiencia visual de Twin Card con fines educativos, promocionales e informativos solamente. VeeVee no diagnostica, trata, previene ni monitorea ninguna condicion medica usando tu foto o respuestas. Tu Twin Card no es consejo medico, no es un record medico y no reemplaza la atencion de un profesional de salud autorizado. Al continuar, das permiso a VeeVee para procesar tu foto, crear y mostrar tu Twin Card, enviarte emails sobre tu tarjeta y VeeVee, y liberas a VeeVee y sus socios de reclamos relacionados con esta experiencia no medica.",
    cameraTitle: "Preparate para la foto de tu Health Twin",
    cameraBody: "Mira la camara. Sonrie. Tu Twin Card casi esta lista.",
    openCamera: "Abrir camara",
    generating: "Creando tu Twin Card...",
    successPill: "Exito",
    successTitle: "Tu Health Twin fue capturado.",
    successInstructions: {
      print: "Ve al booth para obtener tu Health Twin Card impresa.",
      email: "Recibe tu confirmacion por email con tu Health Twin.",
    },
    successRestarting: "Este booth se reiniciara en",
    successRedirecting: "Seras redirigido en",
    seconds: "segundos",
    restart: "Reiniciar",
    photoError: "No pudimos cargar esa foto. Intenta otra vez.",
    requiredError: "Nombre y email son requeridos.",
    toastTitle: "Captura de Health Twin confirmada",
    toastDescription: "Archivo guardado",
  },
} satisfies Record<FlowLanguage, any>;

export default function TwinCardPage() {
  const toast = useToast();
  const [step, setStep] = useState<FlowStep>("language");
  const [language, setLanguage] = useState<FlowLanguage>("en");
  const [form, setForm] = useState<TwinCardFormValues>(initialForm);
  const [showConsentDetails, setShowConsentDetails] = useState(false);
  const [confirmationCountdown, setConfirmationCountdown] = useState(CONFIRMATION_REDIRECT_SECONDS);
  const [confirmationMode, setConfirmationMode] = useState<ConfirmationMode>("redirect");
  const [captureConfirmation, setCaptureConfirmation] = useState<CaptureConfirmation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const t = copy[language];

  useEffect(() => {
    trackTwinCardEvent("public.twin_card.viewed");
  }, []);

  useEffect(() => {
    if (step !== "success") return undefined;

    setConfirmationCountdown(CONFIRMATION_REDIRECT_SECONDS);
    const interval = window.setInterval(() => {
      setConfirmationCountdown((current) => Math.max(current - 1, 0));
    }, 1000);

    const timer = window.setTimeout(() => {
      if (confirmationMode === "restart") {
        restart();
        return;
      }
      window.location.assign(CONFIRMATION_REDIRECT_URL);
    }, CONFIRMATION_REDIRECT_MS);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timer);
    };
  }, [confirmationMode, step]);

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

  const openCamera = () => {
    setError("");
    cameraInputRef.current?.click();
  };

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setIsGenerating(true);

    try {
      const preparedImage = await fileToTwinCardPreparedImage(file);
      trackTwinCardEvent("public.twin_card.photo_selected");
      const generatedLead = await createTwinCard(buildLead(preparedImage.dataUrl, preparedImage.upload));
      const confirmation = buildCaptureConfirmation(preparedImage.upload.originalFileName);
      setCaptureConfirmation(confirmation);
      setConfirmationMode(getConfirmationMode());
      saveTwinCardLead(generatedLead);
      trackTwinCardEvent(
        generatedLead.generationStatus === "fallback_used"
          ? "public.twin_card.fallback_used"
          : "public.twin_card.generation_completed",
        generatedLead
      );
      toast({
        title: t.toastTitle,
        description: `${t.toastDescription}: ${confirmation.fileName} · ${confirmation.timestamp}`,
        status: "success",
        duration: 7000,
        isClosable: true,
        position: "top",
      });
      setStep("success");
    } catch {
      setError(t.photoError);
    } finally {
      setIsGenerating(false);
    }
  };

  const buildLead = (photoDataUrl: string, imageUpload: TwinCardImageUpload): TwinCardLead => {
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
      renderStatus: "not_started",
      fulfillmentStatus: "not_printed",
      eventName: TWIN_CARD_EVENT_NAME,
      boothDeviceId: buildBoothDeviceId(),
      deviceMetadata: buildDeviceMetadata(),
      language,
      imageUpload,
      createdAt: now,
      updatedAt: now,
    };
  };

  const restart = () => {
    setStep("language");
    setForm(initialForm);
    setShowConsentDetails(false);
    setIsGenerating(false);
    setConfirmationCountdown(CONFIRMATION_REDIRECT_SECONDS);
    setConfirmationMode("redirect");
    setCaptureConfirmation(null);
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
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  {TWIN_CARD_INTERESTS.map((goal) => (
                    <Box
                      key={goal.id}
                      as="button"
                      type="button"
                      textAlign="left"
                      minH={{ base: "176px", md: "248px" }}
                      h="100%"
                      p={{ base: 5, md: 6 }}
                      border="1px solid"
                      borderColor="rgba(12, 35, 64, 0.14)"
                      borderRadius="20px"
                      bg="linear-gradient(180deg, #ffffff 0%, #f7fbff 100%)"
                      boxShadow="0 16px 40px rgba(20, 43, 72, 0.11)"
                      transition="transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease"
                      _hover={{
                        transform: "translateY(-3px)",
                        borderColor: "#2f74d0",
                        boxShadow: "0 22px 48px rgba(28, 78, 138, 0.18)",
                      }}
                      _focusVisible={{
                        outline: "3px solid rgba(47, 116, 208, 0.32)",
                        outlineOffset: "3px",
                      }}
                      onClick={() => chooseGoal(goal.id)}
                    >
                      <Stack spacing={4} h="100%">
                        <Box w="44px" h="5px" borderRadius="999px" bg="#2f74d0" />
                        <Stack spacing={2}>
                          <Heading as="h3" size="md" color="#172033">
                            {t.goals[goal.id as keyof typeof t.goals].title}
                          </Heading>
                          <Text color="#516176" fontSize={{ base: "md", md: "sm" }} lineHeight="1.45">
                            {t.goals[goal.id as keyof typeof t.goals].subtitle}
                          </Text>
                        </Stack>
                        <Stack spacing={2} pt={1}>
                          {t.goals[goal.id as keyof typeof t.goals].bullets.map((bullet: string) => (
                            <HStack key={bullet} align="flex-start" spacing={2}>
                              <Box
                                flex="0 0 auto"
                                mt="0.45em"
                                w="7px"
                                h="7px"
                                borderRadius="999px"
                                bg="#62b879"
                              />
                              <Text color="#26364f" fontSize="sm" lineHeight="1.35">
                                {bullet}
                              </Text>
                            </HStack>
                          ))}
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                </SimpleGrid>
              </Stack>
            ) : null}

            {step === "consent" ? (
              <Stack spacing={5}>
                <StepHeader title={t.consentTitle} eyebrow={t.event} />
                <Checkbox
                  size="lg"
                  isChecked={form.consentAccepted}
                  onChange={acceptConsent}
                  onClick={acceptConsent}
                  w="100%"
                  alignItems="center"
                  p={{ base: 5, md: 6 }}
                  border="2px solid"
                  borderColor={form.consentAccepted ? "#168047" : "#b7d6e8"}
                  borderRadius="18px"
                  bg={form.consentAccepted ? "#e8fbef" : "#f7fbff"}
                  boxShadow="0 14px 34px rgba(17, 119, 186, 0.12)"
                  cursor="pointer"
                  transition="border-color 160ms ease, background 160ms ease, box-shadow 160ms ease, transform 160ms ease"
                  _hover={{
                    borderColor: "#1177BA",
                    boxShadow: "0 18px 42px rgba(17, 119, 186, 0.18)",
                    transform: "translateY(-1px)",
                  }}
                  sx={{
                    ".chakra-checkbox__control": {
                      width: "34px",
                      height: "34px",
                      borderRadius: "10px",
                      borderWidth: "3px",
                      flex: "0 0 34px",
                    },
                    ".chakra-checkbox__label": {
                      marginInlineStart: "16px",
                      fontSize: "1.05rem",
                      fontWeight: "800",
                      lineHeight: "1.45",
                      color: "#172033",
                    },
                  }}
                >
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
                <Button minH="72px" fontSize="xl" onClick={openCamera} isLoading={isGenerating} isDisabled={isGenerating}>
                  {t.openCamera}
                </Button>
                <Input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  display="none"
                  onChange={(event) => handlePhoto(event.target.files?.[0])}
                />
                {error ? <Text color="#8a3b3b">{error}</Text> : null}
              </Stack>
            ) : null}

            {step === "success" ? (
              <Stack spacing={7} textAlign="center" align="center">
                <Box
                  px={4}
                  py={2}
                  borderRadius="999px"
                  bg="#d9fbe6"
                  color="#146c3a"
                  fontSize="sm"
                  fontWeight="900"
                  letterSpacing="0"
                  textTransform="uppercase"
                >
                  {t.successPill}
                </Box>
                <Box
                  w="132px"
                  h="132px"
                  borderRadius="full"
                  bg="#e8fbef"
                  color="#168047"
                  display="grid"
                  placeItems="center"
                  fontSize="70px"
                  fontWeight="900"
                >
                  ✓
                </Box>
                <Stack spacing={3}>
                  <Heading as="h1" fontSize={{ base: "42px", md: "58px" }} lineHeight="1">
                    {t.successTitle}
                  </Heading>
                </Stack>
                {captureConfirmation ? (
                  <Box bg="#f1fbf5" border="1px solid #c8efd6" borderRadius="12px" px={4} py={3} color="#1d613c">
                    <Text fontWeight="800">{captureConfirmation.fileName}</Text>
                    <Text fontSize="sm">{captureConfirmation.timestamp}</Text>
                  </Box>
                ) : null}
                <Stack spacing={3} textAlign="left" w="100%" maxW="560px">
                  <HStack align="flex-start" spacing={3}>
                    <Box mt="2px" color="#168047" fontWeight="900">
                      1
                    </Box>
                    <Text fontSize="lg" color="#26364f">
                      {t.successInstructions.print}
                    </Text>
                  </HStack>
                  <HStack align="flex-start" spacing={3}>
                    <Box mt="2px" color="#168047" fontWeight="900">
                      2
                    </Box>
                    <Text fontSize="lg" color="#26364f">
                      {t.successInstructions.email}
                    </Text>
                  </HStack>
                </Stack>
                <Box bg="#f7fbff" border="1px solid #dbeaf5" borderRadius="12px" px={5} py={4} w="100%" maxW="520px">
                  <Text color="#516176" fontSize="sm" fontWeight="700">
                    {confirmationMode === "restart" ? t.successRestarting : t.successRedirecting}
                  </Text>
                  <Text color="#061b38" fontSize="34px" lineHeight="1.1" fontWeight="900">
                    {confirmationCountdown} {t.seconds}
                  </Text>
                </Box>
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

function buildCaptureConfirmation(fileName: string): CaptureConfirmation {
  return {
    fileName: fileName || "camera-capture.jpg",
    timestamp: new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "medium",
    }).format(new Date()),
  };
}

function getConfirmationMode(): ConfirmationMode {
  const device = buildDeviceMetadata();

  if (device.deviceFamily === "mobile_phone") {
    return "redirect";
  }

  return "restart";
}

function buildBoothDeviceId() {
  const device = buildDeviceMetadata();
  return `${device.deviceType}:${device.platform}:${device.viewportWidth}x${device.viewportHeight}`.slice(0, 80);
}

function buildDeviceMetadata() {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform || "unknown";
  const maxTouchPoints = window.navigator.maxTouchPoints || 0;
  const isIpad = /iPad/i.test(userAgent) || (platform === "MacIntel" && maxTouchPoints > 1);
  const isIphone = /iPhone|iPod/i.test(userAgent);
  const isAndroidPhone = /Android.*Mobile/i.test(userAgent);
  const isTablet = /Tablet|Android(?!.*Mobile)/i.test(userAgent);
  const isSmallTouchViewport = window.innerWidth < 768 && maxTouchPoints > 0;
  const deviceType = isIpad
    ? "ipad"
    : isIphone
      ? "iphone"
      : isAndroidPhone
        ? "android_phone"
        : isTablet
          ? "tablet"
          : maxTouchPoints > 0 && !isSmallTouchViewport
            ? "tablet"
            : maxTouchPoints > 0 && isSmallTouchViewport
              ? "unknown"
              : "desktop";
  const deviceFamily =
    deviceType === "ipad" || deviceType === "tablet"
      ? "booth_tablet"
      : deviceType === "iphone" || deviceType === "android_phone"
        ? "mobile_phone"
        : deviceType === "desktop"
          ? "desktop"
          : "unknown";

  return {
    deviceType,
    deviceFamily,
    platform,
    userAgent,
    maxTouchPoints,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
  } as const;
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
