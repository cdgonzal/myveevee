import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Image,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { APP_LINKS } from "../config/links";
import { submitTwinCardBetaSurvey, type TwinCardBetaSurveyPayload } from "../twinCard/api";

type SurveySectionId = "core" | "product" | "pricing";
type QuestionType = "text" | "textarea" | "radio" | "checkbox";

type SurveyQuestion = {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[];
  placeholder?: string;
  required?: boolean;
};

const SECTIONS: Array<{
  id: SurveySectionId;
  eyebrow: string;
  title: string;
  description: string;
  continuePrompt?: string;
  questions: SurveyQuestion[];
}> = [
  {
    id: "core",
    eyebrow: "Beta Invite",
    title: "Help shape VeeVee around you.",
    description:
      "We are inviting early users to test VeeVee, find bugs, shape features, and help us make the experience more useful.",
    continuePrompt: "Have 2 more minutes? Help us shape the product.",
    questions: [
      {
        id: "beta_intent",
        label: "Are you open to being an early VeeVee beta user?",
        type: "radio",
        required: true,
        options: ["Yes, invite me", "Maybe, send me more information", "Not right now"],
      },
      {
        id: "main_reason",
        label: "What made you want a more personalized VeeVee experience?",
        type: "textarea",
        required: true,
        placeholder: "Pain, energy, care planning, records, curiosity, family support...",
      },
      {
        id: "health_focus",
        label: "What are you most focused on improving right now?",
        type: "checkbox",
        options: [
          "Pain or mobility",
          "Energy and daily routine",
          "Understanding labs or symptoms",
          "Preparing for doctor visits",
          "Organizing records",
          "Supporting a loved one",
        ],
      },
      {
        id: "current_support",
        label: "Are you currently working with a doctor, clinic, coach, or care team?",
        type: "radio",
        options: ["Yes", "No", "Not sure"],
      },
      {
        id: "hardest_part",
        label: "What is the hardest part of managing your health right now?",
        type: "textarea",
      },
      {
        id: "contact_email",
        label: "Best email",
        type: "text",
        required: true,
        placeholder: "you@example.com",
      },
      {
        id: "contact_phone",
        label: "Phone number, optional",
        type: "text",
        placeholder: "(555) 555-5555",
      },
      {
        id: "preferred_contact",
        label: "Best way to reach you",
        type: "radio",
        options: ["Email", "Text", "Phone call", "No follow-up yet"],
      },
      {
        id: "feedback_level",
        label: "How involved would you like to be?",
        type: "radio",
        options: ["Quick feedback only", "Occasional testing", "Active beta partner"],
      },
      {
        id: "follow_up_call",
        label: "Would you be open to a short follow-up call?",
        type: "radio",
        options: ["Yes", "Maybe", "No"],
      },
    ],
  },
  {
    id: "product",
    eyebrow: "Product Signal",
    title: "What should VeeVee do for you?",
    description: "These answers help us decide which beta features matter most.",
    continuePrompt: "Want to keep going? A few more questions help us understand access and pricing.",
    questions: [
      {
        id: "ai_help",
        label: "What would you want an AI health companion to help with?",
        type: "checkbox",
        options: [
          "Explain health records",
          "Prepare questions for my doctor",
          "Track symptoms or goals",
          "Summarize visits",
          "Organize medications",
          "Help family understand my care",
          "Find next steps",
        ],
      },
      {
        id: "trust_builders",
        label: "What would make you trust VeeVee more?",
        type: "textarea",
      },
      {
        id: "fears",
        label: "What would make you nervous about using AI for health?",
        type: "textarea",
      },
      {
        id: "must_have",
        label: "What one feature would make you say, I need this?",
        type: "textarea",
      },
      {
        id: "bug_tolerance",
        label: "As an early beta user, how much roughness is acceptable?",
        type: "radio",
        options: ["Very polished only", "Some bugs are okay", "I like testing early products"],
      },
    ],
  },
  {
    id: "pricing",
    eyebrow: "Access Signal",
    title: "Help us understand what feels worth paying for.",
    description: "This helps us design the right beta offer and avoid building the wrong package.",
    questions: [
      {
        id: "would_pay",
        label: "Would you pay for a tool that helps you feel more prepared, organized, and supported?",
        type: "radio",
        options: ["Yes", "Maybe", "No", "Someone else should pay"],
      },
      {
        id: "payer",
        label: "Who do you think should pay for VeeVee?",
        type: "checkbox",
        options: ["Me", "Employer", "Insurance", "Doctor or clinic", "Family member", "Not sure"],
      },
      {
        id: "monthly_price",
        label: "What monthly price feels reasonable if VeeVee is useful?",
        type: "radio",
        options: ["Free only", "$5-$10", "$15-$25", "$30-$50", "$50+"],
      },
      {
        id: "paid_beta",
        label: "Would you join a paid beta if it included extra support?",
        type: "radio",
        options: ["Yes", "Maybe", "No"],
      },
      {
        id: "worth_paying",
        label: "What would make VeeVee worth paying for?",
        type: "textarea",
      },
    ],
  },
];

export default function TwinCardPersonalizePage() {
  const { cardId = "" } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [sectionIndex, setSectionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [completedSections, setCompletedSections] = useState<SurveySectionId[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const section = SECTIONS[sectionIndex];
  const isLastSection = sectionIndex === SECTIONS.length - 1;
  const answeredCount = useMemo(() => Object.values(responses).filter(hasAnswer).length, [responses]);

  const updateResponse = (id: string, value: string | string[]) => {
    setResponses((current) => ({ ...current, [id]: value }));
    setError("");
  };

  const saveSection = async (action: "continue" | "finish") => {
    const missing = section.questions.find((question) => question.required && !hasAnswer(responses[question.id]));
    if (missing) {
      setError("Please answer the required questions before continuing.");
      return;
    }

    setIsSaving(true);
    const nextCompleted = [...new Set([...completedSections, section.id])];
    const payload: TwinCardBetaSurveyPayload = {
      source: "twin_card_result",
      stage: action === "finish" ? "completed" : `completed_${section.id}`,
      completedSections: nextCompleted,
      responses,
      contact: pickContact(responses),
    };

    try {
      const saved = cardId ? await submitTwinCardBetaSurvey(cardId, payload) : null;
      if (!saved) throw new Error("Survey save failed.");
      setCompletedSections(nextCompleted);

      if (action === "finish") {
        navigate(APP_LINKS.internal.swcaFunnel);
        return;
      }

      setSectionIndex((current) => Math.min(current + 1, SECTIONS.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("We could not save your answers. Please try again.");
      toast({
        title: "Survey was not saved",
        description: "Please check your connection and try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const finishNow = async () => {
    await saveSection("finish");
  };

  return (
    <Box minH="100vh" bg="#f7fbff" color="#061b38">
      <Box maxW="760px" mx="auto" px={{ base: 5, md: 8 }} py={{ base: 6, md: 10 }}>
        <Stack minH={{ base: "calc(100vh - 48px)", md: "calc(100vh - 80px)" }} justify="center" spacing={7}>
          <HStack spacing={3} justify="center">
            <Image src="/brand/2026/icon.svg" alt="VeeVee" h="38px" />
            <Image src="/brand/2026/wordmark.svg" alt="VeeVee" h="14px" />
          </HStack>

          <Box bg="white" border="1px solid #dbeaf5" borderRadius="8px" p={{ base: 5, md: 8 }} boxShadow="0 18px 45px rgba(6, 37, 76, 0.08)">
            <Stack spacing={7}>
              <Stack spacing={3}>
                <Text fontSize="xs" fontWeight="900" letterSpacing="0.16em" textTransform="uppercase" color="#1177BA">
                  {section.eyebrow} · {answeredCount} answers
                </Text>
                <Heading as="h1" fontSize={{ base: "30px", md: "44px" }} lineHeight="1.05" letterSpacing="0">
                  {section.title}
                </Heading>
                <Text color="#35445d" fontSize={{ base: "md", md: "lg" }}>
                  {section.description}
                </Text>
              </Stack>

              <Stack spacing={5}>
                {section.questions.map((question) => (
                  <QuestionField
                    key={question.id}
                    question={question}
                    value={responses[question.id]}
                    onChange={(value) => updateResponse(question.id, value)}
                  />
                ))}
              </Stack>

              {error ? <Text color="#8a3b3b" fontWeight="800">{error}</Text> : null}

              <Stack spacing={3}>
                {!isLastSection && section.continuePrompt ? (
                  <Text color="#516176" textAlign="center">
                    {section.continuePrompt}
                  </Text>
                ) : null}
                {!isLastSection ? (
                  <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
                    <Button flex="1" onClick={() => saveSection("continue")} isLoading={isSaving}>
                      Yes, keep going
                    </Button>
                    <Button flex="1" variant="outline" onClick={finishNow} isLoading={isSaving}>
                      Finish for now
                    </Button>
                  </Stack>
                ) : (
                  <Button onClick={finishNow} isLoading={isSaving}>
                    Finish and continue to VeeVee
                  </Button>
                )}
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: SurveyQuestion;
  value?: string | string[];
  onChange: (value: string | string[]) => void;
}) {
  return (
    <FormControl isRequired={question.required}>
      <FormLabel fontWeight="900" color="#172033">
        {question.label}
      </FormLabel>
      {question.type === "text" ? (
        <Input value={typeof value === "string" ? value : ""} placeholder={question.placeholder} onChange={(event) => onChange(event.target.value)} />
      ) : null}
      {question.type === "textarea" ? (
        <Textarea
          value={typeof value === "string" ? value : ""}
          placeholder={question.placeholder}
          minH="112px"
          onChange={(event) => onChange(event.target.value)}
        />
      ) : null}
      {question.type === "radio" ? (
        <RadioGroup value={typeof value === "string" ? value : ""} onChange={onChange}>
          <Stack spacing={2}>
            {(question.options ?? []).map((option) => (
              <Radio key={option} value={option} colorScheme="blue">
                {option}
              </Radio>
            ))}
          </Stack>
        </RadioGroup>
      ) : null}
      {question.type === "checkbox" ? (
        <CheckboxGroup value={Array.isArray(value) ? value : []} onChange={(next) => onChange(next.map(String))}>
          <Stack spacing={2}>
            {(question.options ?? []).map((option) => (
              <Checkbox key={option} value={option} colorScheme="blue">
                {option}
              </Checkbox>
            ))}
          </Stack>
        </CheckboxGroup>
      ) : null}
    </FormControl>
  );
}

function hasAnswer(value?: string | string[]) {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(String(value ?? "").trim());
}

function pickContact(responses: Record<string, string | string[]>) {
  return {
    email: stringValue(responses.contact_email),
    phone: stringValue(responses.contact_phone),
    preferredContact: stringValue(responses.preferred_contact),
    followUpCall: stringValue(responses.follow_up_call),
  };
}

function stringValue(value?: string | string[]) {
  return typeof value === "string" ? value : "";
}
