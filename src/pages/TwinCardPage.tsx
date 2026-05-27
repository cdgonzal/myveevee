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
const CARD_NAVY = "#061b38";
const CARD_GOLD = "#d88a05";
const CARD_PAPER = "#fffdf8";

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
    title: "Create your Digital Health Twin",
    event: `${TWIN_CARD_EVENT_NAME} · ${TWIN_CARD_EVENT_DATE}`,
    firstName: "First name",
    email: "Email",
    continue: "Continue",
    goalsTitle: "Select One Goal",
    goals: {
      track_goals: {
        title: "Move With Less Pain",
        subtitle: "Because everyday movement should feel easier.",
        bullets: ["Comfort", "Mobility", "Confidence"],
      },
      prepare_for_care: {
        title: "Get Back To Life",
        subtitle: "Because your care should help you do more.",
        bullets: ["Daily activity", "Family time", "Momentum"],
      },
      support_loved_one: {
        title: "Explore Advanced Care",
        subtitle: "Because whole-body options can open new paths.",
        bullets: ["Functional care", "Bracing", "Specialty options"],
      },
    },
    consentTitle: "One quick consent",
    consent:
      "I agree to let VeeVee use my photo and answers to create and email my Twin Card.",
    consentDetails: "Consent details",
    consentBody:
      "Your photo, first name, email, selected wellness focus, and responses may be collected, stored, processed, transformed, analyzed, and used by VeeVee and service providers acting on VeeVee's behalf, including cloud hosting, storage, email, printing, AI, image-generation, image-editing, model-evaluation, quality-review, replay, testing, and operations providers. These services may process your information to create, improve, evaluate, display, print, email, and support your Twin Card experience. Your Twin Card is for educational, promotional, entertainment, and informational purposes only. VeeVee does not diagnose, treat, prevent, monitor, or predict any medical condition from your photo or answers. Your Twin Card is not medical advice, not a medical record, not a clinical assessment, not a medical device, and does not replace care from a licensed clinician. By continuing, you give VeeVee permission to process and share your information as described, create and display your Twin Card, contact you about your card and VeeVee, and release VeeVee, SWCA, their affiliates, vendors, service providers, and partners from claims related to this voluntary, non-medical experience to the fullest extent permitted by law.",
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
    title: "Crea tu Digital Health Twin",
    event: `${TWIN_CARD_EVENT_NAME} · ${TWIN_CARD_EVENT_DATE}`,
    firstName: "Nombre",
    email: "Email",
    continue: "Continuar",
    goalsTitle: "Selecciona una meta",
    goals: {
      track_goals: {
        title: "Moverme con menos dolor",
        subtitle: "Porque moverte cada dia debe sentirse mas facil.",
        bullets: ["Comodidad", "Movimiento", "Confianza"],
      },
      prepare_for_care: {
        title: "Volver a mi vida",
        subtitle: "Porque tu cuidado debe ayudarte a hacer mas.",
        bullets: ["Actividad diaria", "Familia", "Momentum"],
      },
      support_loved_one: {
        title: "Explorar cuidado avanzado",
        subtitle: "Porque nuevas opciones pueden abrir caminos.",
        bullets: ["Medicina funcional", "Bracing", "Opciones especiales"],
      },
    },
    consentTitle: "Un consentimiento rapido",
    consent:
      "Acepto que VeeVee use mi foto y respuestas para crear y enviarme mi Twin Card.",
    consentDetails: "Detalles del consentimiento",
    consentBody:
      "Tu foto, nombre, email, enfoque de bienestar seleccionado y respuestas pueden ser recopilados, almacenados, procesados, transformados, analizados y usados por VeeVee y proveedores de servicios que actuan en nombre de VeeVee, incluyendo proveedores de nube, almacenamiento, email, impresion, AI, generacion de imagenes, edicion de imagenes, evaluacion de modelos, revision de calidad, replay, pruebas y operaciones. Estos servicios pueden procesar tu informacion para crear, mejorar, evaluar, mostrar, imprimir, enviar por email y apoyar tu experiencia de Twin Card. Tu Twin Card es solo para fines educativos, promocionales, de entretenimiento e informativos. VeeVee no diagnostica, trata, previene, monitorea ni predice ninguna condicion medica usando tu foto o respuestas. Tu Twin Card no es consejo medico, no es un record medico, no es una evaluacion clinica, no es un dispositivo medico y no reemplaza la atencion de un profesional de salud autorizado. Al continuar, das permiso a VeeVee para procesar y compartir tu informacion como se describe, crear y mostrar tu Twin Card, contactarte sobre tu tarjeta y VeeVee, y liberas a VeeVee, SWCA, sus afiliados, vendedores, proveedores de servicios y socios de reclamos relacionados con esta experiencia voluntaria y no medica en la maxima medida permitida por la ley.",
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
    <Box minH="100vh" bg={CARD_PAPER} color={CARD_NAVY}>
      <Box as="style">{printCss}</Box>
      <Box maxW="760px" mx="auto" px={{ base: 5, md: 8 }} py={{ base: 6, md: 10 }}>
        <Stack minH={{ base: "calc(100vh - 48px)", md: "calc(100vh - 80px)" }} justify="center" spacing={8}>
          <HStack spacing={3} justify="center">
            <Image src="/brand/2026/icon.svg" alt="VeeVee" h="38px" />
            <Image src="/brand/2026/wordmark.svg" alt="VeeVee" h="14px" />
          </HStack>

          <Box bg="white" border={`1px solid rgba(216, 138, 5, 0.28)`} borderRadius="8px" p={{ base: 5, md: 8 }} boxShadow="0 18px 45px rgba(6, 27, 56, 0.08)">
            {step === "language" ? (
              <Stack spacing={8} textAlign="center">
                <Stack spacing={3}>
                  <Text fontSize="xs" fontWeight="900" letterSpacing="0.16em" textTransform="uppercase" color={CARD_GOLD}>
                    {copy.en.event}
                  </Text>
                  <DigitalTwinTitle />
                </Stack>
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <Button minH="72px" fontSize="xl" bg={CARD_NAVY} color="white" _hover={{ bg: "#0b2448" }} onClick={() => chooseLanguage("en")}>
                    Start
                  </Button>
                  <Button minH="72px" fontSize="xl" bg={CARD_GOLD} color="white" _hover={{ bg: "#bd7604" }} onClick={() => chooseLanguage("es")}>
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
                  {TWIN_CARD_INTERESTS.map((goal, index) => (
                    <Box
                      key={goal.id}
                      as="button"
                      type="button"
                      textAlign="left"
                      minH={{ base: "190px", md: "270px" }}
                      h="100%"
                      p={{ base: 5, md: 5 }}
                      border="2px solid"
                      borderColor="rgba(216, 138, 5, 0.32)"
                      borderRadius="8px"
                      bg="linear-gradient(180deg, #ffffff 0%, #fffaf0 100%)"
                      boxShadow="0 16px 40px rgba(20, 43, 72, 0.11)"
                      transition="transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease"
                      _hover={{
                        transform: "translateY(-3px)",
                        borderColor: CARD_GOLD,
                        boxShadow: "0 22px 48px rgba(216, 138, 5, 0.16)",
                      }}
                      _focusVisible={{
                        outline: "3px solid rgba(216, 138, 5, 0.28)",
                        outlineOffset: "3px",
                      }}
                      onClick={() => chooseGoal(goal.id)}
                    >
                      <Stack spacing={4} h="100%" justify="space-between">
                        <HStack spacing={3} align="center">
                          <Box
                            w="42px"
                            h="42px"
                            borderRadius="8px"
                            bg={CARD_GOLD}
                            color="white"
                            display="grid"
                            placeItems="center"
                            fontSize="xl"
                            fontWeight="900"
                            flex="0 0 auto"
                          >
                            {index + 1}
                          </Box>
                          <Text color={CARD_GOLD} fontSize="xs" fontWeight="900" letterSpacing="0.14em" textTransform="uppercase">
                            Select
                          </Text>
                        </HStack>
                        <Stack spacing={3}>
                          <Heading as="h3" fontSize={{ base: "2xl", md: "xl" }} lineHeight="1.02" color={CARD_NAVY}>
                            {t.goals[goal.id as keyof typeof t.goals].title}
                          </Heading>
                          <Text color="#35445d" fontSize={{ base: "md", md: "sm" }} lineHeight="1.35" fontWeight="700">
                            {t.goals[goal.id as keyof typeof t.goals].subtitle}
                          </Text>
                        </Stack>
                        <HStack spacing={2} pt={1} flexWrap="wrap">
                          {t.goals[goal.id as keyof typeof t.goals].bullets.map((bullet: string) => (
                            <Box
                              key={bullet}
                              px={3}
                              py={1.5}
                              borderRadius="999px"
                              bg="rgba(6, 27, 56, 0.06)"
                              color={CARD_NAVY}
                              fontSize="xs"
                              fontWeight="900"
                            >
                              {bullet}
                            </Box>
                          ))}
                        </HStack>
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
      <Text fontSize="xs" fontWeight="900" letterSpacing="0.16em" textTransform="uppercase" color={CARD_GOLD}>
        {eyebrow}
      </Text>
      <Heading
        as="h1"
        fontSize={{ base: "32px", md: "48px" }}
        lineHeight="1.05"
        letterSpacing="0"
        color={CARD_NAVY}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontWeight="700"
      >
        {title}
      </Heading>
    </Stack>
  );
}

function DigitalTwinTitle() {
  return (
    <Stack spacing={0} align="center">
      <Heading
        as="h1"
        fontSize={{ base: "44px", md: "68px" }}
        lineHeight="0.95"
        letterSpacing="0"
        color={CARD_NAVY}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontWeight="500"
      >
        Meet Your
      </Heading>
      <Text
        as="div"
        fontSize={{ base: "64px", md: "104px" }}
        lineHeight="0.9"
        color={CARD_GOLD}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontWeight="700"
      >
        Digital
      </Text>
      <Heading
        as="div"
        fontSize={{ base: "42px", md: "66px" }}
        lineHeight="0.95"
        letterSpacing="0"
        color={CARD_NAVY}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontWeight="700"
      >
        Health Twin
      </Heading>
      <Box w={{ base: "210px", md: "340px" }} h="2px" bg={CARD_NAVY} mt={3} transform="skewX(-18deg)" opacity={0.9} />
    </Stack>
  );
}

const printCss = buildTwinCardPrintCss();
