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
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
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
import {
  getTwinCardGenerationStatusColorScheme,
  getTwinCardGenerationStatusLabel,
  getTwinCardRenderStatusColorScheme,
  getTwinCardRenderStatusLabel,
  isTwinCardGenerationStatusPrintable,
  isTwinCardRenderStatusPrintReady,
} from "../twinCard/statusContract";
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
  const latestImageReviewCards = useMemo(() => cards.slice(0, 5), [cards]);

  const unlockDashboard = async () => {
    if (pin !== DASHBOARD_PIN) {
      setState("denied");
      return;
    }

    setState("loading");
    const apiCards = await withTimeout(fetchRecentTwinCards(DASHBOARD_PIN), 6000).catch(() => null);
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
              <SimpleGrid columns={{ base: 1, md: 5 }} spacing={4}>
                <StatBox label="Runs" value={String(stats.total)} />
                <StatBox label="Print Ready" value={String(stats.printReady)} />
                <StatBox label="AI Complete" value={String(stats.completed)} />
                <StatBox label="Photo Fallback" value={String(stats.fallback)} />
                <StatBox label="Bedrock Cost" value={formatCurrency(stats.estimatedBedrockCost)} />
                <StatBox label="Consented" value={String(stats.consented)} />
              </SimpleGrid>

              <Tabs variant="soft-rounded" colorScheme="blue" isLazy>
                <TabList gap={2} flexWrap="wrap">
                  <Tab>Runs</Tab>
                  <Tab>Image Review</Tab>
                </TabList>
                <TabPanels pt={5}>
                  <TabPanel p={0}>
                    <Grid templateColumns={{ base: "1fr", xl: "minmax(0, 1.55fr) minmax(360px, 0.95fr)" }} gap={5} alignItems="start">
                      <Box overflowX="auto" bg="white" border="1px solid #dbeaf5" borderRadius="8px">
                        <Table size="sm">
                          <Thead>
                            <Tr>
                              <Th>Created</Th>
                              <Th>Name</Th>
                              <Th>Email</Th>
                              <Th>Goal</Th>
                              <Th>Avatar</Th>
                              <Th>Print</Th>
                              <Th>Bedrock</Th>
                              <Th>AI Input</Th>
                              <Th>S3 Files</Th>
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
                                <Td><RenderStatusBadge status={card.renderStatus} /></Td>
                                <Td whiteSpace="nowrap">{formatBedrockUsage(card)}</Td>
                                <Td whiteSpace="nowrap">{formatImageSize(card)}</Td>
                                <Td minW="220px">
                                  <ArtifactLinks card={card} />
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>

                      <RunDetails card={selectedCard} />
                    </Grid>
                  </TabPanel>
                  <TabPanel p={0}>
                    <ImageReview cards={latestImageReviewCards} />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

function ArtifactLinks({ card }: { card: TwinCardApiCard }) {
  const links = [
    { label: "Run", url: card.runJsonUrl },
    { label: "Source", url: card.sourceImageUrl },
    { label: "Avatar", url: card.generatedAvatarUrl },
    { label: "Layout", url: card.printLayoutUrl },
    { label: isCanonPrintPng(card) ? "Print PNG" : "Print", url: card.printImageUrl },
  ].filter((link) => Boolean(link.url));

  if (!links.length) return <Text color="#6b7890">Local only</Text>;

  return (
    <HStack spacing={2} flexWrap="wrap" onClick={(event) => event.stopPropagation()}>
      {links.map((link) => (
        <Link key={link.label} href={link.url} isExternal color="#1177BA" fontWeight="700">
          {link.label}
        </Link>
      ))}
    </HStack>
  );
}

function ImageReview({ cards }: { cards: TwinCardApiCard[] }) {
  if (!cards.length) {
    return (
      <Box bg="white" border="1px solid #dbeaf5" borderRadius="8px" p={5}>
        <Text color="#516176">No runs yet.</Text>
      </Box>
    );
  }

  return (
    <Stack spacing={4}>
      {cards.map((card) => (
        <Box key={card.cardId} bg="white" border="1px solid #dbeaf5" borderRadius="8px" p={{ base: 4, md: 5 }}>
          <Stack spacing={4}>
            <Flex justify="space-between" gap={4} align={{ base: "flex-start", md: "center" }} direction={{ base: "column", md: "row" }}>
              <Stack spacing={1}>
                <HStack spacing={2} flexWrap="wrap">
                  <Heading as="h2" size="sm">{card.firstName}</Heading>
                  <StatusBadge status={card.generationStatus} />
                  <RenderStatusBadge status={card.renderStatus} />
                </HStack>
                <Text color="#516176" fontSize="sm">
                  {formatDate(card.createdAt)} | {formatDevice(card)} | {card.generationProvider}
                </Text>
              </Stack>
              <ArtifactLinks card={card} />
            </Flex>

            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4}>
              <ImageComparePanel title="Raw Capture" imageUrl={card.sourceImageUrl} s3Key={card.sourceImageS3Key} />
              <ImageComparePanel title="Generated Avatar" imageUrl={card.generatedAvatarUrl} s3Key={card.generatedAvatarS3Key} />
              <ImageComparePanel
                title={isCanonPrintPng(card) ? "Canon Print PNG" : "Print Asset"}
                imageUrl={card.printImageUrl}
                s3Key={card.printImageS3Key}
              />
            </SimpleGrid>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

function ImageComparePanel({ title, imageUrl, s3Key }: { title: string; imageUrl?: string; s3Key?: string }) {
  return (
    <Stack spacing={2}>
      <Flex justify="space-between" gap={3} align="center">
        <Text fontWeight="900">{title}</Text>
        {imageUrl ? (
          <Link href={imageUrl} isExternal color="#1177BA" fontSize="sm" fontWeight="700">
            Open
          </Link>
        ) : null}
      </Flex>
      <Box bg="#eef4f8" border="1px solid #d5e5f0" borderRadius="8px" overflow="hidden" h={{ base: "320px", md: "420px" }}>
        {imageUrl ? (
          <Image src={imageUrl} alt={title} w="100%" h="100%" objectFit="contain" bg="#f8fbfd" />
        ) : (
          <Flex h="100%" align="center" justify="center" px={4} textAlign="center">
            <Text color="#6b7890">No image URL available.</Text>
          </Flex>
        )}
      </Box>
      <Text color="#6b7890" fontSize="xs" wordBreak="break-all">{s3Key ?? "-"}</Text>
    </Stack>
  );
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("Twin Card dashboard request timed out.")), timeoutMs);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      }
    );
  });
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
          <Field label="Device" value={formatDevice(card)} />
          <Field label="Goal" value={card.wellnessInterestLabel} />
          <Field label="Consent" value={card.consentAccepted ? "Yes" : "No"} />
          <Field label="Provider" value={card.generationProvider} />
          <Field label="Bedrock Usage" value={formatBedrockUsage(card)} />
          <Field label="Bedrock Cost" value={formatCurrency(card.bedrockUsage?.totalEstimatedCostUsd)} />
          <Field label="Recipe" value={card.avatarRecipeVersion ?? card.avatarRecipeId ?? "-"} />
          <Field label="Print" value={getTwinCardRenderStatusLabel(card.renderStatus)} />
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
          <StorageLine label="Print Layout SVG" s3Key={card.printLayoutS3Key} url={card.printLayoutUrl} />
          <StorageLine label="Canon Print PNG" s3Key={card.printImageS3Key} url={card.printImageUrl} />
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
  return (
    <Badge colorScheme={getTwinCardGenerationStatusColorScheme(status)}>
      {getTwinCardGenerationStatusLabel(status)}
    </Badge>
  );
}

function RenderStatusBadge({ status }: { status?: string }) {
  return (
    <Badge colorScheme={getTwinCardRenderStatusColorScheme(status)}>
      {getTwinCardRenderStatusLabel(status)}
    </Badge>
  );
}

function buildStats(cards: TwinCardApiCard[]) {
  return {
    total: cards.length,
    completed: cards.filter((card) => card.generationStatus === "completed").length,
    fallback: cards.filter((card) => card.generationStatus === "fallback_used").length,
    printReady: cards.filter(
      (card) =>
        isTwinCardGenerationStatusPrintable(card.generationStatus) &&
        isTwinCardRenderStatusPrintReady(card.renderStatus)
    ).length,
    consented: cards.filter((card) => card.consentAccepted).length,
    estimatedBedrockCost: cards.reduce((sum, card) => sum + Number(card.bedrockUsage?.totalEstimatedCostUsd ?? 0), 0),
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
    bedrockUsage: lead.bedrockUsage,
    avatarRecipeId: lead.avatarRecipeId,
    avatarRecipeVersion: lead.avatarRecipeVersion,
    renderStatus: lead.renderStatus,
    fulfillmentStatus: lead.fulfillmentStatus,
    eventName: lead.eventName,
    boothDeviceId: lead.boothDeviceId,
    deviceMetadata: lead.deviceMetadata,
    language: lead.language,
    imageUpload: lead.imageUpload,
    sourceImageUrl: lead.sourceImageUrl,
    generatedAvatarUrl: lead.generatedAvatarUrl,
    runS3Key: lead.runS3Key,
    runJsonUrl: lead.runJsonUrl,
    printLayoutS3Key: lead.printLayoutS3Key,
    printLayoutUrl: lead.printLayoutUrl,
    printLayoutContentType: lead.printLayoutContentType,
    printImageContentType: lead.printImageContentType,
    printImageS3Key: lead.printImageS3Key,
    printImageUrl: lead.printImageUrl,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

function formatImageSize(card: TwinCardApiCard) {
  const upload = card.imageUpload;
  if (!upload) return "-";
  return `${upload.normalizedWidthPx}x${upload.normalizedHeightPx}`;
}

function formatBedrockUsage(card: TwinCardApiCard) {
  const usage = card.bedrockUsage;
  if (!usage) return "-";
  const units = usage.totalBillableUnits;
  const unit = usage.billingUnit || "generation";
  return `${units} ${unit}${units === 1 ? "" : "s"} / ${formatCurrency(usage.totalEstimatedCostUsd)}`;
}

function formatCurrency(value?: number | null) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return `$${number.toFixed(4)}`;
}

function isCanonPrintPng(card: TwinCardApiCard) {
  return card.printImageContentType === "image/png" || (card.printImageS3Key ?? "").endsWith(".png");
}

function formatDevice(card: TwinCardApiCard) {
  const device = card.deviceMetadata;
  if (!device) return card.boothDeviceId ?? "-";
  return `${device.deviceType} / ${device.deviceFamily}`;
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
