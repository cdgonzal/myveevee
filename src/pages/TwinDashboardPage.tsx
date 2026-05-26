import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Heading,
  HStack,
  Image,
  Input,
  Link,
  SimpleGrid,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { apiCardToLead, fetchRecentTwinCards, type TwinCardApiCard } from "../twinCard/api";
import { listTwinCardLeads } from "../twinCard/storage";
import { APP_LINKS } from "../config/links";
import type { TwinCardLead } from "../twinCard/types";

const DASHBOARD_PIN = "5353";

type DashboardState = "locked" | "loading" | "ready" | "denied";

export default function TwinDashboardPage() {
  const [pin, setPin] = useState("");
  const [state, setState] = useState<DashboardState>("locked");
  const [cards, setCards] = useState<TwinCardApiCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState("");

  const selectedCard = cards.find((card) => card.cardId === selectedCardId) ?? cards[0] ?? null;
  const stats = useMemo(() => buildStats(cards), [cards]);

  const unlockDashboard = async () => {
    if (pin !== DASHBOARD_PIN) {
      setState("denied");
      return;
    }

    setState("loading");
    const apiCards = await fetchRecentTwinCards(DASHBOARD_PIN);
    const nextCards = apiCards ?? listTwinCardLeads().map(localLeadToApiCard);
    setCards(nextCards);
    setSelectedCardId(nextCards[0]?.cardId ?? "");
    setState("ready");
  };

  return (
    <Box minH="100vh" bg="#f7fbff" color="#061b38">
      <Box maxW="1360px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 6, md: 9 }}>
        <Stack spacing={7}>
          <Flex align={{ base: "flex-start", md: "center" }} justify="space-between" gap={5} direction={{ base: "column", md: "row" }}>
            <HStack spacing={3}>
              <Image src="/brand/2026/icon.svg" alt="VeeVee" h="34px" />
              <Image src="/brand/2026/wordmark.svg" alt="VeeVee" h="13px" />
            </HStack>
            <HStack spacing={3}>
              <Button as="a" href={APP_LINKS.internal.twinCard} variant="outline" borderColor="#b7d6e8">
                Create Card
              </Button>
              <Button as="a" href={APP_LINKS.internal.twinCardAdmin} bg="#1177BA" color="white" _hover={{ bg: "#0b5d94" }}>
                Print View
              </Button>
            </HStack>
          </Flex>

          <Stack spacing={1}>
            <Heading as="h1" size="xl">Twin Dashboard</Heading>
            <Text color="#516176">All Twin Card runs, responses, storage links, and image normalization details.</Text>
          </Stack>

          {state !== "ready" ? (
            <Box bg="white" border="1px solid #dbeaf5" borderRadius="8px" p={{ base: 5, md: 7 }} maxW="460px">
              <Stack spacing={4}>
                <Heading as="h2" size="md">Enter PIN</Heading>
                <Input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(event) => setPin(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void unlockDashboard();
                  }}
                  autoFocus
                />
                {state === "denied" ? <Text color="#b42318">Invalid PIN.</Text> : null}
                <Button onClick={unlockDashboard} isLoading={state === "loading"} bg="#1177BA" color="white" _hover={{ bg: "#0b5d94" }}>
                  Unlock
                </Button>
              </Stack>
            </Box>
          ) : (
            <>
              <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                <StatBox label="Runs" value={String(stats.total)} />
                <StatBox label="Completed" value={String(stats.completed)} />
                <StatBox label="Fallback" value={String(stats.fallback)} />
                <StatBox label="Consented" value={String(stats.consented)} />
              </SimpleGrid>

              <Grid templateColumns={{ base: "1fr", xl: "minmax(0, 1.55fr) minmax(360px, 0.95fr)" }} gap={5} alignItems="start">
                <Box overflowX="auto" bg="white" border="1px solid #dbeaf5" borderRadius="8px">
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Created</Th>
                        <Th>Name</Th>
                        <Th>Email</Th>
                        <Th>Goal</Th>
                        <Th>Status</Th>
                        <Th>AI Input</Th>
                        <Th>S3</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {cards.map((card) => (
                        <Tr
                          key={card.cardId}
                          bg={card.cardId === selectedCard?.cardId ? "#eefaff" : undefined}
                          onClick={() => setSelectedCardId(card.cardId)}
                          cursor="pointer"
                        >
                          <Td whiteSpace="nowrap">{formatDate(card.createdAt)}</Td>
                          <Td fontWeight="700">{card.firstName}</Td>
                          <Td>{card.contact ?? "-"}</Td>
                          <Td>{card.wellnessInterestLabel}</Td>
                          <Td><StatusBadge status={card.generationStatus} /></Td>
                          <Td whiteSpace="nowrap">{formatImageSize(card)}</Td>
                          <Td>{card.runS3Key ? "Run JSON" : "Local only"}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>

                <RunDetails card={selectedCard} />
              </Grid>
            </>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

function RunDetails({ card }: { card: TwinCardApiCard | null }) {
  if (!card) {
    return (
      <Box bg="white" border="1px solid #dbeaf5" borderRadius="8px" p={5}>
        <Text color="#516176">No runs yet.</Text>
      </Box>
    );
  }

  return (
    <Box bg="white" border="1px solid #dbeaf5" borderRadius="8px" p={{ base: 5, md: 6 }}>
      <Stack spacing={5}>
        <Stack spacing={1}>
          <HStack justify="space-between" align="start">
            <Heading as="h2" size="md">{card.firstName}</Heading>
            <StatusBadge status={card.generationStatus} />
          </HStack>
          <Text color="#516176" fontSize="sm">{card.cardId}</Text>
        </Stack>

        <SimpleGrid columns={2} spacing={3}>
          <Field label="Contact" value={card.contact ?? "-"} />
          <Field label="Language" value={(card.language ?? "-").toUpperCase()} />
          <Field label="Goal" value={card.wellnessInterestLabel} />
          <Field label="Consent" value={card.consentAccepted ? "Yes" : "No"} />
          <Field label="Provider" value={card.generationProvider} />
          <Field label="Updated" value={formatDate(card.updatedAt)} />
        </SimpleGrid>

        <Divider />

        <Stack spacing={2}>
          <Heading as="h3" size="sm">Image Contract</Heading>
          <SimpleGrid columns={2} spacing={3}>
            <Field label="Original" value={formatOriginal(card)} />
            <Field label="Normalized" value={formatNormalized(card)} />
            <Field label="Payload" value={formatBytes(card.imageUpload?.normalizedBytesEstimate ?? card.sourceImageBytes)} />
            <Field label="Contract" value={card.imageUpload?.contractId ?? "-"} />
          </SimpleGrid>
        </Stack>

        <Divider />

        <Stack spacing={2}>
          <Heading as="h3" size="sm">Storage</Heading>
          <StorageLine label="Run JSON" s3Key={card.runS3Key} url={card.runJsonUrl} />
          <StorageLine label="Source Image" s3Key={card.sourceImageS3Key} url={card.sourceImageUrl} />
          <StorageLine label="Generated Avatar" s3Key={card.generatedAvatarS3Key} url={card.generatedAvatarUrl} />
          <StorageLine label="Result Page" s3Key={card.cardResultUrl} url={card.cardResultUrl} />
        </Stack>
      </Stack>
    </Box>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <Box bg="white" border="1px solid #dbeaf5" borderRadius="8px" p={4}>
      <Text color="#516176" fontSize="sm">{label}</Text>
      <Text fontSize="3xl" fontWeight="900">{value}</Text>
    </Box>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Stack spacing={0}>
      <Text color="#6b7890" fontSize="xs" textTransform="uppercase">{label}</Text>
      <Text fontWeight="700" wordBreak="break-word">{value}</Text>
    </Stack>
  );
}

function StorageLine({ label, s3Key, url }: { label: string; s3Key?: string; url?: string }) {
  return (
    <Stack spacing={0}>
      <Text color="#6b7890" fontSize="xs" textTransform="uppercase">{label}</Text>
      {url ? (
        <Link href={url} color="#1177BA" isExternal wordBreak="break-all">
          {s3Key ?? url}
        </Link>
      ) : (
        <Text wordBreak="break-all">{s3Key ?? "-"}</Text>
      )}
    </Stack>
  );
}

function StatusBadge({ status }: { status: string }) {
  const scheme = status === "completed" ? "green" : status === "fallback_used" ? "orange" : "blue";
  return <Badge colorScheme={scheme}>{status}</Badge>;
}

function buildStats(cards: TwinCardApiCard[]) {
  return {
    total: cards.length,
    completed: cards.filter((card) => card.generationStatus === "completed").length,
    fallback: cards.filter((card) => card.generationStatus === "fallback_used").length,
    consented: cards.filter((card) => card.consentAccepted).length,
  };
}

function localLeadToApiCard(lead: TwinCardLead): TwinCardApiCard {
  return {
    cardId: lead.cardId,
    firstName: lead.firstName,
    contact: lead.contact,
    contactType: lead.contactType,
    wellnessInterest: lead.wellnessInterest,
    wellnessInterestLabel: lead.wellnessInterestLabel,
    consentAccepted: lead.consentAccepted,
    betaInterest: lead.betaInterest,
    cardResultUrl: lead.cardResultUrl,
    generationStatus: lead.generationStatus,
    generationProvider: lead.generationProvider,
    generationMessage: lead.generationMessage,
    eventName: lead.eventName,
    boothDeviceId: lead.boothDeviceId,
    language: lead.language,
    imageUpload: lead.imageUpload,
    sourceImageUrl: lead.sourceImageUrl,
    generatedAvatarUrl: lead.generatedAvatarUrl,
    runS3Key: lead.runS3Key,
    runJsonUrl: lead.runJsonUrl,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

function formatImageSize(card: TwinCardApiCard) {
  const upload = card.imageUpload;
  if (!upload) return "-";
  return `${upload.normalizedWidthPx}x${upload.normalizedHeightPx}`;
}

function formatOriginal(card: TwinCardApiCard) {
  const upload = card.imageUpload;
  if (!upload) return "-";
  return `${upload.originalWidthPx}x${upload.originalHeightPx}, ${formatBytes(upload.originalFileBytes)}`;
}

function formatNormalized(card: TwinCardApiCard) {
  const upload = card.imageUpload;
  if (!upload) return "-";
  return `${upload.normalizedWidthPx}x${upload.normalizedHeightPx}, ${upload.normalizedMimeType}`;
}

function formatBytes(value?: number) {
  if (!value) return "-";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
