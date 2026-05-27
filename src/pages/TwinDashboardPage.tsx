import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Collapse,
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
  useToast,
} from "@chakra-ui/react";
import { apiCardToLead, fetchRecentTwinCards, markTwinCardPrinted, type TwinCardApiCard } from "../twinCard/api";
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
const DASHBOARD_DEBUG_STORAGE_KEY = "vv:twin-dashboard-debug";

type DashboardState = "locked" | "loading" | "ready" | "denied";

export default function TwinDashboardPage() {
  const [pin, setPin] = useState("");
  const [state, setState] = useState<DashboardState>("locked");
  const [cards, setCards] = useState<TwinCardApiCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState("");
  const [printingCardId, setPrintingCardId] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState("");
  const toast = useToast();

  const selectedCard = cards.find((card) => card.cardId === selectedCardId) ?? cards[0] ?? null;
  const stats = useMemo(() => buildStats(cards), [cards]);
  const printReadyCards = useMemo(() => cards.filter(isPrintReadyCard), [cards]);

  const handlePrintCard = async (card: TwinCardApiCard) => {
    if (!card.printImageUrl) return;

    setPrintingCardId(card.cardId);
    void openPrintWindow(card);
    const updatedCard = await markTwinCardPrinted(card.cardId, DASHBOARD_PIN).catch(() => null);
    if (updatedCard) {
      setCards((current) => current.map((item) => (item.cardId === updatedCard.cardId ? updatedCard : item)));
      toast({
        title: "Print recorded",
        description: `${updatedCard.firstName} has been marked printed ${updatedCard.printedCount ?? 1} time${(updatedCard.printedCount ?? 1) === 1 ? "" : "s"}.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Print opened, count not saved",
        description: "The browser print dialog opened, but the dashboard could not update the printed count.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }
    setPrintingCardId("");
  };

  const loadDashboardCards = async () => {
    const apiCards = await withTimeout(fetchRecentTwinCards(DASHBOARD_PIN), 6000).catch(() => null);
    const nextCards = apiCards ?? listTwinCardLeads().map(localLeadToApiCard);
    debugDashboard("unlock result", {
      source: apiCards ? "api" : "localStorageFallback",
      count: nextCards.length,
      cards: nextCards.map(summarizeCardForDebug),
    });
    setCards(nextCards);
    setSelectedCardId((current) => current || nextCards[0]?.cardId || "");
    setLastRefreshedAt(new Date().toISOString());
    return nextCards;
  };

  const unlockDashboard = async () => {
    if (pin !== DASHBOARD_PIN) {
      setState("denied");
      return;
    }

    setState("loading");
    await loadDashboardCards();
    setState("ready");
  };

  const refreshDashboard = async () => {
    setRefreshing(true);
    await loadDashboardCards();
    setRefreshing(false);
  };

  useEffect(() => {
    if (state !== "ready") return undefined;
    const intervalId = window.setInterval(() => {
      void loadDashboardCards();
    }, 10000);
    return () => window.clearInterval(intervalId);
  }, [state]);

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
              {state === "ready" ? (
                <>
                  <Text color="#516176" fontSize="sm">
                    Updated {lastRefreshedAt ? formatDate(lastRefreshedAt) : "-"}
                  </Text>
                  <Button
                    variant="outline"
                    borderColor="#b7d6e8"
                    isLoading={refreshing}
                    onClick={() => void refreshDashboard()}
                  >
                    Refresh
                  </Button>
                </>
              ) : null}
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
              <Stack spacing={4}>
                <SimpleGrid columns={{ base: 1, md: 3, xl: 6 }} spacing={4}>
                  <StatBox label="Runs" value={String(stats.total)} />
                  <StatBox label="Replays" value={String(stats.replays)} />
                  <StatBox label="Cards Generated" value={String(stats.cardsGenerated)} />
                  <StatBox label="Cards Printed" value={String(stats.cardsPrinted)} />
                  <StatBox label="AI Complete" value={String(stats.completed)} />
                  <StatBox label="Consented" value={String(stats.consented)} />
                </SimpleGrid>
                <CostPill costs={stats.costs} />
              </Stack>

              <Tabs variant="soft-rounded" colorScheme="blue" isLazy>
                <TabList gap={2} flexWrap="wrap">
                  <Tab>Runs</Tab>
                  <Tab>Images</Tab>
                  <Tab>Cards</Tab>
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
                              <Th>Time</Th>
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
                                <Td whiteSpace="nowrap">{formatRunTiming(card)}</Td>
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
                    <ImageReview cards={cards} />
                  </TabPanel>
                  <TabPanel p={0}>
                    <CardsPrintPanel
                      cards={printReadyCards}
                      generatedCount={stats.cardsGenerated}
                      printedCount={stats.cardsPrinted}
                      printingCardId={printingCardId}
                      onPrintCard={handlePrintCard}
                    />
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
    { label: "Replay Report", url: card.replayReportUrl },
    { label: "Replay Manifest", url: card.replayManifestUrl },
    { label: "Source", url: card.sourceImageUrl },
    { label: "Avatar", url: card.generatedAvatarUrl },
    { label: "Layout", url: card.printLayoutUrl },
    { label: isCanonPrintPng(card) ? "Print PNG" : "Print", url: card.printImageUrl },
  ].filter((link) => Boolean(link.url));

  if (!links.length) return <Text color="#6b7890">Local only</Text>;

  debugDashboard("artifact links", {
    cardId: card.cardId,
    recordType: card.recordType,
    links: links.map((link) => ({
      label: link.label,
      hasUrl: Boolean(link.url),
      urlHost: readUrlHost(link.url),
    })),
  });

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

type ReplayComparisonGroup = {
  id: string;
  runId: string;
  sourceCardId: string;
  firstName: string;
  wellnessInterestLabel: string;
  createdAt: string;
  source: TwinCardApiCard;
  nano?: TwinCardApiCard;
  gpt?: TwinCardApiCard;
};

function ImageReview({ cards }: { cards: TwinCardApiCard[] }) {
  const [expandedGroupIds, setExpandedGroupIds] = useState<string[]>([]);
  const replayGroups = useMemo(() => buildReplayComparisonGroups(cards), [cards]);
  const liveCards = useMemo(() => cards.filter((card) => !isReplayCard(card)).slice(0, 3), [cards]);

  if (!cards.length) {
    return (
      <Box bg="white" border="1px solid #dbeaf5" borderRadius="8px" p={5}>
        <Text color="#516176">No runs yet.</Text>
      </Box>
    );
  }

  const toggleDetails = (groupId: string) => {
    setExpandedGroupIds((current) =>
      current.includes(groupId) ? current.filter((id) => id !== groupId) : [...current, groupId]
    );
  };

  return (
    <Stack spacing={6}>
      <Stack spacing={4}>
        <Box>
          <Heading as="h2" size="md" color="#061B38">
            Latest Live Images
          </Heading>
          <Text color="#516176" fontSize="sm" mt={1}>
            Raw capture, generated avatar, and model details from the latest production runs.
          </Text>
        </Box>
        {liveCards.length ? (
          liveCards.map((card) => <LiveImageRunCard key={card.cardId} card={card} />)
        ) : (
          <Box bg="white" border="1px solid #dbeaf5" borderRadius="8px" p={5}>
            <Text color="#516176">No live production image runs yet.</Text>
          </Box>
        )}
      </Stack>

      {replayGroups.length ? (
        <Stack spacing={4}>
          <Box>
            <Heading as="h2" size="md" color="#061B38">
              Replay Comparisons
            </Heading>
            <Text color="#516176" fontSize="sm" mt={1}>
              Side-by-side model tests from the latest replay batch.
            </Text>
          </Box>
        {replayGroups.map((group) => {
          const isExpanded = expandedGroupIds.includes(group.id);
          return (
            <Box key={group.id} bg="white" border="1px solid #dbeaf5" borderRadius="8px" p={{ base: 4, md: 5 }}>
              <Stack spacing={4}>
                <Flex justify="space-between" gap={4} align={{ base: "flex-start", md: "center" }} direction={{ base: "column", md: "row" }}>
                  <Stack spacing={1}>
                    <HStack spacing={2} flexWrap="wrap">
                      <Heading as="h2" size="sm">{group.firstName}</Heading>
                      <Badge colorScheme="purple">Replay Compare</Badge>
                    </HStack>
                    <Text color="#516176" fontSize="sm">
                      {formatDate(group.createdAt)} | {group.wellnessInterestLabel} | {group.runId}
                    </Text>
                  </Stack>
                  <Button
                    size="sm"
                    variant="outline"
                    borderColor="#b7d6e8"
                    onClick={() => toggleDetails(group.id)}
                    rightIcon={<Text as="span" fontWeight="900">{isExpanded ? "⌃" : "⌄"}</Text>}
                  >
                    Details
                  </Button>
                </Flex>

                <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4}>
                  <ReplayImagePanel
                    title="Raw Capture"
                    imageUrl={group.source.sourceImageUrl}
                    s3Key={group.source.sourceImageS3Key}
                    metrics={`Source | ${formatBytes(group.source.sourceImageBytes)}`}
                    isExpanded={isExpanded}
                    details={[
                      ["Card", group.sourceCardId],
                      ["S3", group.source.sourceImageS3Key ?? "-"],
                      ["Image", formatOriginal(group.source)],
                    ]}
                  />
                  <ReplayImagePanel
                    title="Nano Banana 2 Edit"
                    imageUrl={group.nano?.generatedAvatarUrl}
                    s3Key={group.nano?.generatedAvatarS3Key}
                    metrics={formatReplayMetrics(group.nano)}
                    isExpanded={isExpanded}
                    details={buildReplayDetails(group.nano)}
                  />
                  <ReplayImagePanel
                    title="GPT Image 2 Edit"
                    imageUrl={group.gpt?.generatedAvatarUrl}
                    s3Key={group.gpt?.generatedAvatarS3Key}
                    metrics={formatReplayMetrics(group.gpt)}
                    isExpanded={isExpanded}
                    details={buildReplayDetails(group.gpt)}
                  />
                </SimpleGrid>
              </Stack>
            </Box>
          );
        })}
        </Stack>
      ) : null}
    </Stack>
  );
}

function LiveImageRunCard({ card }: { card: TwinCardApiCard }) {
  return (
    <Box bg="white" border="1px solid #dbeaf5" borderRadius="8px" p={{ base: 4, md: 5 }}>
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
          <ModelEvaluationPanel card={card} />
        </SimpleGrid>
      </Stack>
    </Box>
  );
}

function CardsPrintPanel({
  cards,
  generatedCount,
  printedCount,
  printingCardId,
  onPrintCard,
}: {
  cards: TwinCardApiCard[];
  generatedCount: number;
  printedCount: number;
  printingCardId: string;
  onPrintCard: (card: TwinCardApiCard) => void | Promise<void>;
}) {
  if (!cards.length) {
    return (
      <Box bg="white" border="1px solid #dbeaf5" borderRadius="8px" p={5}>
        <Text color="#516176">No print-ready cards yet.</Text>
      </Box>
    );
  }

  return (
    <Stack spacing={4}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <StatBox label="Cards Generated" value={String(generatedCount)} />
        <StatBox label="Cards Printed" value={String(printedCount)} />
      </SimpleGrid>

      <Box overflowX="auto" bg="white" border="1px solid #dbeaf5" borderRadius="8px">
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Card</Th>
              <Th>Goal</Th>
              <Th>Created</Th>
              <Th>Print Ready Asset</Th>
              <Th isNumeric>Printed</Th>
              <Th>Last Printed</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {cards.map((card) => (
              <Tr key={card.cardId}>
                <Td>
                  <HStack spacing={3} minW="230px">
                    <Box bg="#eef4f8" border="1px solid #d5e5f0" borderRadius="6px" overflow="hidden" w="64px" h="96px" flex="0 0 auto">
                      {card.printImageUrl ? (
                        <Image src={card.printImageUrl} alt={`${card.firstName} Twin Card`} w="100%" h="100%" objectFit="cover" />
                      ) : null}
                    </Box>
                    <Stack spacing={0}>
                      <Text fontWeight="900">{card.firstName}</Text>
                      <Text color="#516176" fontSize="sm">{card.cardId}</Text>
                      {isReplayCard(card) ? <Badge colorScheme="purple" w="fit-content">Replay</Badge> : null}
                    </Stack>
                  </HStack>
                </Td>
                <Td>{card.wellnessInterestLabel}</Td>
                <Td whiteSpace="nowrap">{formatDate(card.createdAt)}</Td>
                <Td>
                  <Stack spacing={1}>
                    {card.printImageUrl ? (
                      <Link
                        href={card.printImageUrl}
                        download={buildTwinCardFileName(card)}
                        isExternal
                        color="#1177BA"
                        fontWeight="800"
                      >
                        Canon PNG
                      </Link>
                    ) : null}
                    <Text color="#6b7890" fontSize="xs" wordBreak="break-all">{card.printImageS3Key ?? "-"}</Text>
                  </Stack>
                </Td>
                <Td isNumeric fontWeight="900">{card.printedCount ?? 0}</Td>
                <Td whiteSpace="nowrap">{card.lastPrintedAt ? formatDate(card.lastPrintedAt) : "-"}</Td>
                <Td>
                  <Button
                    size="sm"
                    bg="#1177BA"
                    color="white"
                    _hover={{ bg: "#0b5d94" }}
                    isDisabled={!card.printImageUrl}
                    isLoading={printingCardId === card.cardId}
                    onClick={() => void onPrintCard(card)}
                  >
                    Print Card
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Stack>
  );
}

function ReplayImagePanel({
  title,
  imageUrl,
  s3Key,
  metrics,
  isExpanded,
  details,
}: {
  title: string;
  imageUrl?: string;
  s3Key?: string;
  metrics: string;
  isExpanded: boolean;
  details: Array<[string, string]>;
}) {
  return (
    <Stack spacing={2}>
      <Flex justify="space-between" gap={3} align="center" minH="24px">
        <Text fontWeight="900">{title}</Text>
        {imageUrl ? (
          <Link href={imageUrl} isExternal color="#1177BA" fontSize="sm" fontWeight="700">
            Open
          </Link>
        ) : null}
      </Flex>
      <Box bg="#eef4f8" border="1px solid #d5e5f0" borderRadius="8px" overflow="hidden" h={{ base: "240px", md: "260px" }}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            w="100%"
            h="100%"
            objectFit="contain"
            bg="#f8fbfd"
            onLoad={(event) => {
              const image = event.currentTarget;
              debugDashboard("image loaded", {
                title,
                s3Key,
                urlHost: readUrlHost(imageUrl),
                naturalWidth: image.naturalWidth,
                naturalHeight: image.naturalHeight,
              });
            }}
            onError={(event) => {
              debugDashboard("image error", {
                title,
                s3Key,
                urlHost: readUrlHost(imageUrl),
                currentSrc: event.currentTarget.currentSrc,
              });
            }}
          />
        ) : (
          <Flex h="100%" align="center" justify="center" px={4} textAlign="center">
            <Text color="#6b7890">No image URL available.</Text>
          </Flex>
        )}
      </Box>
      <Text color="#516176" fontSize="sm" fontWeight="800">{metrics}</Text>
      <Collapse in={isExpanded} animateOpacity>
        <Box bg="#f8fbfd" border="1px solid #e5f0f7" borderRadius="8px" p={3}>
          <Stack spacing={2}>
            {details.map(([label, value]) => (
              <Stack key={label} spacing={0}>
                <Text color="#6b7890" fontSize="xs" textTransform="uppercase">{label}</Text>
                <Text color="#061b38" fontSize="sm" wordBreak="break-word">{value}</Text>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Collapse>
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
      <Box bg="#eef4f8" border="1px solid #d5e5f0" borderRadius="8px" overflow="hidden" h={{ base: "260px", md: "260px" }}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            w="100%"
            h="100%"
            objectFit="contain"
            bg="#f8fbfd"
            onLoad={(event) => {
              const image = event.currentTarget;
              debugDashboard("image loaded", {
                title,
                s3Key,
                urlHost: readUrlHost(imageUrl),
                naturalWidth: image.naturalWidth,
                naturalHeight: image.naturalHeight,
              });
            }}
            onError={(event) => {
              debugDashboard("image error", {
                title,
                s3Key,
                urlHost: readUrlHost(imageUrl),
                currentSrc: event.currentTarget.currentSrc,
              });
            }}
          />
        ) : (
          debugDashboard("image missing url", { title, s3Key }),
          <Flex h="100%" align="center" justify="center" px={4} textAlign="center">
            <Text color="#6b7890">No image URL available.</Text>
          </Flex>
        )}
      </Box>
      <Text color="#6b7890" fontSize="xs" wordBreak="break-all">{s3Key ?? "-"}</Text>
    </Stack>
  );
}

function ModelEvaluationPanel({ card }: { card: TwinCardApiCard }) {
  const winningAttempt = getWinningAttempt(card);
  const attempts = card.bedrockProviderAttempts ?? [];

  return (
    <Stack spacing={3}>
      <Box bg="#f3faff" border="1px solid #b7d6e8" borderRadius="8px" p={3}>
        <Stack spacing={1}>
          <Text color="#0a6ea8" fontSize="xs" fontWeight="900" textTransform="uppercase">Winning model</Text>
          <Text fontWeight="900" wordBreak="break-word">{winningAttempt?.providerId ?? getBedrockModelId(card)}</Text>
          <Text color="#516176" fontSize="sm">{winningAttempt?.provider ?? card.generationProvider}</Text>
          <Text color="#516176" fontSize="sm">{formatBedrockUsage(card)}</Text>
        </Stack>
      </Box>

      <Box bg="white" border="1px solid #dbeaf5" borderRadius="8px" p={3}>
        <Stack spacing={2}>
          <Heading as="h3" size="sm">Attempt Details</Heading>
          {attempts.length ? (
            attempts.map((attempt, index) => (
              <Box key={`${attempt.providerId}-${index}`} borderTop={index ? "1px solid #e5f0f7" : "0"} pt={index ? 2 : 0}>
                <HStack spacing={2} flexWrap="wrap">
                  <Badge colorScheme={attempt.status === "completed" ? "green" : attempt.status === "skipped" ? "yellow" : "red"}>
                    {attempt.status}
                  </Badge>
                  <Text fontWeight="800" fontSize="sm" wordBreak="break-word">{attempt.providerId}</Text>
                </HStack>
                <Text color="#516176" fontSize="sm">{attempt.provider ?? "-"}</Text>
                <Text color="#516176" fontSize="sm">
                  {formatUsageUnits(attempt.usage)} / {formatCurrency(attempt.usage?.estimatedCostUsd)}
                </Text>
                <Text color="#516176" fontSize="sm">
                  {formatMs(attempt.durationMs)}{attempt.requestId ? ` / ${attempt.requestId}` : ""}
                </Text>
                {attempt.message ? <Text color="#8a5a00" fontSize="sm">{attempt.message}</Text> : null}
              </Box>
            ))
          ) : (
            <Text color="#516176" fontSize="sm">No provider attempts stored yet.</Text>
          )}
        </Stack>
      </Box>

      <StorageLine
        label={isCanonPrintPng(card) ? "Canon Print PNG" : "Print Asset"}
        s3Key={card.printImageS3Key}
        url={card.printImageUrl}
      />
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
          <HStack spacing={2} flexWrap="wrap">
            {isReplayCard(card) ? <Badge colorScheme="purple">Replay</Badge> : null}
            <Text color="#516176" fontSize="sm">{card.cardId}</Text>
          </HStack>
        </Stack>

        <SimpleGrid columns={2} spacing={3}>
          <Field label="Contact" value={card.contact ?? "-"} />
          <Field label="Language" value={(card.language ?? "-").toUpperCase()} />
          <Field label="Device" value={formatDevice(card)} />
          <Field label="Goal" value={card.wellnessInterestLabel} />
          <Field label="Consent" value={card.consentAccepted ? "Yes" : "No"} />
          <Field label="Provider" value={card.generationProvider} />
          {isReplayCard(card) ? <Field label="Replay Model" value={card.replayModelId ?? "-"} /> : null}
          {isReplayCard(card) ? <Field label="Replay Provider" value={card.replayProvider ?? "-"} /> : null}
          <Field label="Bedrock Usage" value={formatBedrockUsage(card)} />
          <Field label="Bedrock Cost" value={formatCurrency(card.bedrockUsage?.totalEstimatedCostUsd)} />
          <Field label="Recipe" value={card.avatarRecipeVersion ?? card.avatarRecipeId ?? "-"} />
          <Field label="Print" value={getTwinCardRenderStatusLabel(card.renderStatus)} />
          <Field label="Updated" value={formatDate(card.updatedAt)} />
        </SimpleGrid>

        <Divider />

        <Stack spacing={2}>
          <Heading as="h3" size="sm">Timing</Heading>
          <SimpleGrid columns={2} spacing={3}>
            <Field label="Upload" value={formatMs(card.uploadDurationMs)} />
            <Field label="Avatar" value={formatMs(card.avatarGenerationDurationMs ?? getWinningAttempt(card)?.durationMs)} />
            <Field label="Card Render" value={formatMs(card.printCompositionDurationMs)} />
            <Field label="Total Run" value={formatRunTiming(card)} />
            <Field label="Source Uploaded" value={formatDate(card.sourceUploadedAt)} />
            <Field label="Generated" value={formatDate(card.generatedAt)} />
            <Field label="Rendered" value={formatDate(card.renderedAt)} />
          </SimpleGrid>
        </Stack>

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
          {isReplayCard(card) ? <StorageLine label="Replay Report" s3Key={card.replayReportS3Key} url={card.replayReportUrl} /> : null}
          {isReplayCard(card) ? <StorageLine label="Replay Manifest" s3Key={card.replayManifestS3Key} url={card.replayManifestUrl} /> : null}
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

type ProviderCostSummary = {
  bedrock: number;
  fal: number;
  total: number;
};

function CostPill({ costs }: { costs: ProviderCostSummary }) {
  return (
    <Box bg="#061b38" color="white" border="1px solid #061b38" borderRadius="999px" px={4} py={3}>
      <Stack spacing={2}>
        <Text color="#b8d7ec" fontSize="sm" fontWeight="800">Tracked Cost</Text>
        <HStack spacing={3} flexWrap="wrap">
          <CostSegment label="Bedrock" value={costs.bedrock} />
          <CostSegment label="fal.ai" value={costs.fal} />
          <CostSegment label="Total" value={costs.total} isPrimary />
        </HStack>
      </Stack>
    </Box>
  );
}

function CostSegment({ label, value, isPrimary = false }: { label: string; value: number; isPrimary?: boolean }) {
  return (
    <HStack
      spacing={1}
      bg={isPrimary ? "white" : "rgba(255,255,255,0.12)"}
      color={isPrimary ? "#061b38" : "white"}
      borderRadius="999px"
      px={2.5}
      py={1}
    >
      <Text fontSize="xs" fontWeight="800">{label}</Text>
      <Text fontSize="sm" fontWeight="900">{formatCurrency(value)}</Text>
    </HStack>
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

function buildReplayComparisonGroups(cards: TwinCardApiCard[]): ReplayComparisonGroup[] {
  const replayCards = cards
    .filter(isReplayCard)
    .filter((card) => isNanoModel(card.replayModelId) || isGptImageModel(card.replayModelId));
  if (!replayCards.length) return [];

  const latestRunId = replayCards
    .map((card) => readReplayRunId(card))
    .filter(Boolean)
    .sort((left, right) => Date.parse(readLatestCreatedAtForRun(replayCards, right)) - Date.parse(readLatestCreatedAtForRun(replayCards, left)))[0];
  if (!latestRunId) return [];

  const groups = new Map<string, ReplayComparisonGroup>();
  for (const card of replayCards.filter((item) => readReplayRunId(item) === latestRunId)) {
    const sourceCardId = readReplaySourceCardId(card);
    if (!sourceCardId) continue;

    const existing = groups.get(sourceCardId) ?? {
      id: `${latestRunId}:${sourceCardId}`,
      runId: latestRunId,
      sourceCardId,
      firstName: card.firstName,
      wellnessInterestLabel: card.wellnessInterestLabel,
      createdAt: card.createdAt,
      source: card,
    };

    existing.source = existing.source.sourceImageUrl ? existing.source : card;
    existing.createdAt = Date.parse(card.createdAt) > Date.parse(existing.createdAt) ? card.createdAt : existing.createdAt;
    if (isNanoModel(card.replayModelId)) existing.nano = card;
    if (isGptImageModel(card.replayModelId)) existing.gpt = card;
    groups.set(sourceCardId, existing);
  }

  return [...groups.values()]
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .slice(0, 3);
}

function readLatestCreatedAtForRun(cards: TwinCardApiCard[], runId: string) {
  return cards
    .filter((card) => readReplayRunId(card) === runId)
    .map((card) => card.createdAt)
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0] ?? "";
}

function readReplayRunId(card: TwinCardApiCard) {
  if (card.replayRunId) return card.replayRunId;
  const match = card.cardId.match(/^replay#([^#]+)/);
  return match?.[1] ?? "";
}

function readReplaySourceCardId(card: TwinCardApiCard) {
  if (card.replaySourceCardId) return card.replaySourceCardId;
  const match = card.cardId.match(/^replay#[^#]+#([^#]+)/);
  return match?.[1] ?? "";
}

function isNanoModel(modelId?: string) {
  return modelId === "fal-ai/nano-banana-2/edit";
}

function isGptImageModel(modelId?: string) {
  return modelId === "openai/gpt-image-2/edit";
}

function formatReplayMetrics(card?: TwinCardApiCard) {
  if (!card) return "Not available";
  return `${formatCurrency(card.bedrockUsage?.totalEstimatedCostUsd)} | ${formatMs(getReplayDurationMs(card))}`;
}

function buildReplayDetails(card?: TwinCardApiCard): Array<[string, string]> {
  if (!card) return [["Status", "Not available"]];
  const attempt = card.bedrockProviderAttempts?.[0];
  return [
    ["Model", card.replayModelId ?? getBedrockModelId(card)],
    ["Provider", card.replayProvider ?? attempt?.provider ?? card.generationProvider],
    ["Status", card.generationStatus],
    ["Cost", formatCurrency(card.bedrockUsage?.totalEstimatedCostUsd)],
    ["Usage", formatUsageUnits(card.bedrockUsage)],
    ["Duration", formatMs(getReplayDurationMs(card))],
    ["Request ID", attempt?.requestId ?? "-"],
    ["Bytes", formatBytes(card.generatedAvatarBytes)],
    ["S3", card.generatedAvatarS3Key ?? "-"],
  ];
}

function getReplayDurationMs(card: TwinCardApiCard) {
  return card.bedrockProviderAttempts?.[0]?.durationMs;
}

function buildStats(cards: TwinCardApiCard[]) {
  const costs = buildProviderCostSummary(cards);
  const printReadyCards = cards.filter(isPrintReadyCard);
  return {
    total: cards.length,
    replays: cards.filter(isReplayCard).length,
    completed: cards.filter((card) => card.generationStatus === "completed").length,
    fallback: cards.filter((card) => card.generationStatus === "fallback_used").length,
    printReady: printReadyCards.length,
    cardsGenerated: printReadyCards.length,
    cardsPrinted: printReadyCards.reduce((sum, card) => sum + Number(card.printedCount ?? 0), 0),
    consented: cards.filter((card) => card.consentAccepted).length,
    costs,
  };
}

function isPrintReadyCard(card: TwinCardApiCard) {
  return (
    Boolean(card.printImageUrl) &&
    isTwinCardGenerationStatusPrintable(card.generationStatus) &&
    isTwinCardRenderStatusPrintReady(card.renderStatus)
  );
}

function buildProviderCostSummary(cards: TwinCardApiCard[]): ProviderCostSummary {
  const costs = cards.reduce(
    (sum, card) => {
      const cost = Number(card.bedrockUsage?.totalEstimatedCostUsd ?? 0);
      if (!Number.isFinite(cost) || cost <= 0) return sum;
      if (isFalCost(card)) {
        sum.fal += cost;
      } else if (isBedrockCost(card)) {
        sum.bedrock += cost;
      }
      return sum;
    },
    { bedrock: 0, fal: 0 }
  );

  return {
    ...costs,
    total: costs.bedrock + costs.fal,
  };
}

function isFalCost(card: TwinCardApiCard) {
  const provider = card.replayProvider?.toLowerCase();
  const modelId = card.replayModelId?.toLowerCase();
  const usage = card.bedrockUsage as
    | (NonNullable<TwinCardApiCard["bedrockUsage"]> & { billingProvider?: string })
    | undefined;
  const lineItems = usage?.lineItems ?? [];

  return (
    provider === "fal" ||
    provider === "fal.ai" ||
    modelId?.startsWith("fal-ai/") === true ||
    lineItems.some((item) => {
      const runtimeItem = item as typeof item & { billingProvider?: string; provider?: string };
      return (
        runtimeItem.billingProvider?.toLowerCase() === "fal_ai" ||
        runtimeItem.billingProvider?.toLowerCase() === "fal.ai" ||
        runtimeItem.provider?.toLowerCase() === "fal" ||
        runtimeItem.modelId?.toLowerCase().startsWith("fal-ai/") === true
      );
    })
  );
}

function isBedrockCost(card: TwinCardApiCard) {
  const usage = card.bedrockUsage as
    | (NonNullable<TwinCardApiCard["bedrockUsage"]> & { billingProvider?: string })
    | undefined;
  if (!usage) return false;
  if (usage.billingProvider === "aws_bedrock") return true;
  return usage.lineItems?.some((item) => item.billingProvider === "aws_bedrock") ?? false;
}

function isReplayCard(card: TwinCardApiCard) {
  return card.recordType === "replay" || card.cardId.startsWith("replay#");
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
    bedrockProviderAttempts: lead.bedrockProviderAttempts,
    avatarRecipeId: lead.avatarRecipeId,
    avatarRecipeVersion: lead.avatarRecipeVersion,
    renderStatus: lead.renderStatus,
    fulfillmentStatus: lead.fulfillmentStatus,
    printedAt: lead.printedAt,
    lastPrintedAt: lead.lastPrintedAt,
    printedCount: lead.printedCount,
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
    sourceUploadedAt: lead.sourceUploadedAt,
    generatedAt: lead.generatedAt,
    renderedAt: lead.renderedAt,
    avatarGenerationStartedAt: lead.avatarGenerationStartedAt,
    printCompositionStartedAt: lead.printCompositionStartedAt,
    uploadDurationMs: lead.uploadDurationMs,
    avatarGenerationDurationMs: lead.avatarGenerationDurationMs,
    printCompositionDurationMs: lead.printCompositionDurationMs,
    totalRunDurationMs: lead.totalRunDurationMs,
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
  return `${formatUsageUnits(usage)} / ${formatCurrency(usage.totalEstimatedCostUsd)}`;
}

function formatRunTiming(card: TwinCardApiCard) {
  const total = card.totalRunDurationMs ?? calculateDurationMs(card.createdAt, card.renderedAt ?? card.generatedAt ?? card.updatedAt);
  return formatMs(total);
}

function calculateDurationMs(startedAt?: string, completedAt?: string) {
  const started = Date.parse(startedAt ?? "");
  const completed = Date.parse(completedAt ?? "");
  if (!Number.isFinite(started) || !Number.isFinite(completed) || completed < started) return undefined;
  return completed - started;
}

function formatUsageUnits(usage?: { totalBillableUnits?: number; billableUnits?: number; billingUnit?: string } | null) {
  if (!usage) return "-";
  const units = Number(usage.totalBillableUnits ?? usage.billableUnits);
  const unit = usage.billingUnit || "generation";
  if (!Number.isFinite(units)) return "-";
  return `${units} ${unit}${units === 1 ? "" : "s"}`;
}

function formatCurrency(value?: number | null) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return `$${number.toFixed(4)}`;
}

function isCanonPrintPng(card: TwinCardApiCard) {
  return card.printImageContentType === "image/png" || (card.printImageS3Key ?? "").endsWith(".png");
}

function getWinningAttempt(card: TwinCardApiCard) {
  return card.bedrockProviderAttempts?.find((attempt) => attempt.status === "completed") ?? null;
}

function getBedrockModelId(card: TwinCardApiCard) {
  return card.bedrockUsage?.lineItems?.find((item) => item.billableUnits > 0)?.modelId ?? card.generationProvider;
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

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

async function openPrintWindow(card: TwinCardApiCard) {
  if (!card.printImageUrl) return;
  const printWindow = window.open("", "_blank", "width=900,height=1100");
  if (!printWindow) {
    window.open(card.printImageUrl, "_blank", "noopener,noreferrer");
    return;
  }

  printWindow.opener = null;
  const fileName = buildTwinCardFileName(card);
  writePrintDocument(printWindow, {
    title: fileName,
    body: `<div class="status">Loading print-ready card...</div>`,
  });

  try {
    const response = await fetch(card.printImageUrl, { mode: "cors" });
    if (!response.ok) {
      throw new Error(`Print image request failed with ${response.status}.`);
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    writePrintDocument(printWindow, {
      title: fileName,
      body: `<img src="${escapeHtml(objectUrl)}" alt="${escapeHtml(card.firstName)} Twin Card" />`,
      autoPrint: true,
    });
  } catch {
    writePrintDocument(printWindow, {
      title: fileName,
      body: `
        <div class="status">
          <strong>Print image could not load in the popup.</strong>
          <a href="${escapeHtml(card.printImageUrl)}" download="${escapeHtml(fileName)}" target="_blank" rel="noreferrer">Open Canon PNG directly</a>
        </div>
      `,
    });
  }
}

function writePrintDocument(
  printWindow: Window,
  options: {
    title: string;
    body: string;
    autoPrint?: boolean;
  }
) {
  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
<html>
<head>
  <title>${escapeHtml(options.title)}</title>
  <style>
    @page { size: 4in 6in; margin: 0; }
    html, body { margin: 0; width: 100%; min-height: 100%; background: #fff; }
    body { display: grid; place-items: center; }
    img { width: 4in; height: 6in; object-fit: contain; display: block; }
    .status { font: 16px Arial, sans-serif; color: #061b38; padding: 24px; text-align: center; }
    .status a { color: #1177BA; display: block; font-weight: 700; margin-top: 12px; }
  </style>
</head>
<body>
  ${options.body}
  ${options.autoPrint ? "<script>window.addEventListener('load', function(){ window.focus(); window.print(); });</script>" : ""}
</body>
</html>`);
  printWindow.document.close();
}

function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildTwinCardFileName(card: TwinCardApiCard) {
  const name = sanitizeFileNamePart(card.firstName || "guest");
  const timestamp = formatFileTimestamp(card.renderedAt ?? card.createdAt ?? new Date().toISOString());
  return `${name}_twin_card_${timestamp}.png`;
}

function sanitizeFileNamePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "guest";
}

function formatFileTimestamp(value: string) {
  const date = new Date(value);
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const yyyy = String(safeDate.getFullYear());
  const mm = String(safeDate.getMonth() + 1).padStart(2, "0");
  const dd = String(safeDate.getDate()).padStart(2, "0");
  const hh = String(safeDate.getHours()).padStart(2, "0");
  const min = String(safeDate.getMinutes()).padStart(2, "0");
  const ss = String(safeDate.getSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}_${hh}${min}${ss}`;
}

function formatMs(value?: number) {
  const number = Number(value);
  return Number.isFinite(number) ? `${number} ms` : "-";
}

function isDashboardDebugEnabled() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("debugTwinDashboard") === "1" || window.localStorage.getItem(DASHBOARD_DEBUG_STORAGE_KEY) === "1";
}

function debugDashboard(message: string, payload?: unknown) {
  if (!isDashboardDebugEnabled()) return;
  console.log(`[twin-dashboard] ${message}`, payload ?? "");
}

function summarizeCardForDebug(card: TwinCardApiCard) {
  return {
    cardId: card.cardId,
    recordType: card.recordType,
    firstName: card.firstName,
    status: card.generationStatus,
    replayModelId: card.replayModelId,
    sourceImageS3Key: card.sourceImageS3Key,
    generatedAvatarS3Key: card.generatedAvatarS3Key,
    printImageS3Key: card.printImageS3Key,
    hasSourceImageUrl: Boolean(card.sourceImageUrl),
    hasGeneratedAvatarUrl: Boolean(card.generatedAvatarUrl),
    hasPrintImageUrl: Boolean(card.printImageUrl),
    sourceImageUrlHost: readUrlHost(card.sourceImageUrl),
    generatedAvatarUrlHost: readUrlHost(card.generatedAvatarUrl),
    printImageUrlHost: readUrlHost(card.printImageUrl),
  };
}

function readUrlHost(url?: string) {
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return "invalid-url";
  }
}
