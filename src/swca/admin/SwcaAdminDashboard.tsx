import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { createSwcaAdminSession, fetchSwcaAdminReport } from "./api";
import type { SwcaAdminClaim, SwcaAdminReport, SwcaAdminSession } from "./api";

const NAVY = "#071A3A";
const ORANGE = "#F39A25";
const LINE = "#E2E8F0";
const SESSION_STORAGE_KEY = "swca-admin-session";

export default function SwcaAdminDashboard() {
  const toast = useToast();
  const [passcode, setPasscode] = useState("");
  const [session, setSession] = useState<SwcaAdminSession | null>(() => readSession());
  const [report, setReport] = useState<SwcaAdminReport | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const hasSession = Boolean(session && session.expiresAt > Math.floor(Date.now() / 1000));

  const conversionRates = useMemo(() => {
    if (!report) {
      return { claimRate: 0, contactRate: 0, profileRate: 0 };
    }

    const totalIntakes = Math.max(report.metrics.totalIntakes, 1);
    const rewardsClaimed = Math.max(report.metrics.rewardsClaimed, 1);

    return {
      claimRate: Math.round((report.metrics.rewardsClaimed / totalIntakes) * 100),
      contactRate: Math.round((report.metrics.rewardContactsSaved / rewardsClaimed) * 100),
      profileRate: Math.round((report.metrics.funnelProfileClicks / totalIntakes) * 100),
    };
  }, [report]);

  useEffect(() => {
    if (hasSession && session) {
      void loadReport(session.token);
    }
  }, [hasSession, session]);

  const handleSignIn = async () => {
    if (!passcode.trim()) {
      toast({ title: "Enter the admin passcode.", status: "warning", duration: 2200 });
      return;
    }

    setIsSigningIn(true);
    try {
      const nextSession = await createSwcaAdminSession(passcode.trim());
      setSession(nextSession);
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
      setPasscode("");
    } catch (error) {
      toast({
        title: "Admin sign-in failed.",
        description: error instanceof Error ? error.message : "Try again.",
        status: "error",
        duration: 3600,
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const loadReport = async (token = session?.token ?? "") => {
    if (!token) return;

    setIsLoadingReport(true);
    try {
      const nextReport = await fetchSwcaAdminReport(token);
      setReport(nextReport);
    } catch (error) {
      toast({
        title: "Report could not be loaded.",
        description: error instanceof Error ? error.message : "Sign in again.",
        status: "error",
        duration: 4200,
      });
      setSession(null);
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } finally {
      setIsLoadingReport(false);
    }
  };

  const handleSignOut = () => {
    setSession(null);
    setReport(null);
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  };

  return (
    <Box minH="100vh" bg="#F8FAFC" color={NAVY} px={{ base: 4, md: 8 }} py={{ base: 7, md: 10 }}>
      <Box maxW="1240px" mx="auto">
        <Flex align={{ base: "flex-start", md: "center" }} justify="space-between" gap={5} mb={7}>
          <Flex align="center" gap={3}>
            <Image src="/swca/spine-wellness-logo.png" alt="Spine and Wellness Centers of America" boxSize="72px" objectFit="contain" />
            <Box>
              <Text fontSize="sm" fontWeight="900" letterSpacing="0.12em" textTransform="uppercase" color={ORANGE}>
                Private admin
              </Text>
              <Heading as="h1" size={{ base: "lg", md: "xl" }} letterSpacing="0">
                SWCA Campaign Dashboard
              </Heading>
            </Box>
          </Flex>
          {hasSession ? (
            <Flex gap={3} wrap="wrap" justify="flex-end">
              <Button variant="outline" borderColor={LINE} onClick={() => loadReport()} isLoading={isLoadingReport}>
                Refresh
              </Button>
              <Button variant="outline" borderColor={LINE} onClick={() => exportClaims(report?.recentClaims ?? [])} isDisabled={!report}>
                Export CSV
              </Button>
              <Button bg={NAVY} color="white" _hover={{ bg: "#102A55" }} onClick={handleSignOut}>
                Sign out
              </Button>
            </Flex>
          ) : null}
        </Flex>

        {!hasSession ? (
          <Box maxW="520px" bg="white" border="1px solid" borderColor={LINE} borderRadius="8px" p={{ base: 5, md: 6 }} boxShadow="0 18px 44px rgba(7,26,58,0.08)">
            <Stack spacing={4}>
              <Box>
                <Heading as="h2" size="md">
                  Enter admin passcode
                </Heading>
                <Text mt={2} color="#526071">
                  This dashboard shows redacted campaign data only. It does not display raw email addresses or phone numbers.
                </Text>
              </Box>
              <Input
                type="password"
                value={passcode}
                onChange={(event) => setPasscode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void handleSignIn();
                }}
                placeholder="Passcode"
                bg="white"
              />
              <Button onClick={handleSignIn} isLoading={isSigningIn} bg={ORANGE} color="white" _hover={{ bg: "#D96712" }}>
                Open dashboard
              </Button>
            </Stack>
          </Box>
        ) : null}

        {hasSession && report ? (
          <Stack spacing={6}>
            <Alert status="info" borderRadius="8px" bg="#EAF4FF" color={NAVY}>
              <AlertIcon />
              Report generated {formatDateTime(report.generatedAt)}. Contact names are abbreviated and contact details are withheld.
            </Alert>

            <Tabs variant="enclosed" colorScheme="orange" isLazy>
              <TabList borderColor={LINE} overflowX="auto" overflowY="hidden">
                <Tab fontWeight="800" whiteSpace="nowrap">
                  Executive summary
                </Tab>
                <Tab fontWeight="800" whiteSpace="nowrap">
                  Live report
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel px={0} pt={5} pb={0}>
                  <ExecutiveSummary report={report} conversionRates={conversionRates} />
                </TabPanel>

                <TabPanel px={0} pt={5} pb={0}>
                  <Stack spacing={6}>
                    <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
                      <Metric label="Intakes" value={report.metrics.totalIntakes} helper={`${conversionRates.claimRate}% spun`} />
                      <Metric label="Rewards claimed" value={report.metrics.rewardsClaimed} helper={`${conversionRates.contactRate}% saved contact`} />
                      <Metric label="Reward contacts" value={report.metrics.rewardContactsSaved} helper="email or phone only" />
                      <Metric label="Profile CTA clicks" value={report.metrics.funnelProfileClicks} helper={`${conversionRates.profileRate}% of intakes`} />
                    </SimpleGrid>

                    <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4}>
                      <Distribution title="Reward distribution" items={report.rewardDistribution} />
                      <Distribution title="Contact methods" items={report.contactMethodDistribution} />
                      <Distribution title="First-party events" items={report.eventCounts} />
                    </SimpleGrid>

                    <Box bg="white" border="1px solid" borderColor={LINE} borderRadius="8px" overflow="hidden">
                      <Flex align="center" justify="space-between" p={5} borderBottom="1px solid" borderColor={LINE}>
                        <Box>
                          <Heading as="h2" size="md">
                            Recent submissions
                          </Heading>
                          <Text color="#526071" fontSize="sm">
                            Operational view for management reporting and reward follow-up status.
                          </Text>
                        </Box>
                        <Badge colorScheme="orange">{report.recentClaims.length} rows</Badge>
                      </Flex>
                      <TableContainer>
                        <Table size="sm">
                          <Thead bg="#F8FAFC">
                            <Tr>
                              <Th>Submitted</Th>
                              <Th>Status</Th>
                      <Th>Reward</Th>
                      <Th>Contact</Th>
                      <Th>Message</Th>
                      <Th>Name</Th>
                      <Th>Submission</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {report.recentClaims.map((claim) => (
                              <Tr key={claim.submissionId}>
                                <Td>{formatDateTime(claim.createdAt)}</Td>
                                <Td>{claim.status || "eligible"}</Td>
                        <Td>{claim.rewardLabel || "-"}</Td>
                        <Td>{claim.contactMethod || "-"}</Td>
                        <Td>{formatMessageStatus(claim.messageStatus)}</Td>
                        <Td>{claim.contactName || "-"}</Td>
                                <Td fontFamily="mono" fontSize="xs">
                                  {claim.submissionId}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Stack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Stack>
        ) : null}
      </Box>
    </Box>
  );
}

function ExecutiveSummary({
  report,
  conversionRates,
}: {
  report: SwcaAdminReport;
  conversionRates: { claimRate: number; contactRate: number; profileRate: number };
}) {
  return (
    <Stack spacing={5}>
      <Box bg="white" border="1px solid" borderColor={LINE} borderRadius="8px" p={{ base: 5, md: 6 }}>
        <Stack spacing={4}>
          <Box>
            <Text fontSize="sm" fontWeight="900" letterSpacing="0.12em" textTransform="uppercase" color={ORANGE}>
              Campaign objective
            </Text>
            <Heading as="h2" size={{ base: "md", md: "lg" }} mt={2}>
              Turn campaign traffic into usable follow-up opportunities.
            </Heading>
          </Box>
          <Text color="#526071" maxW="840px">
            SWCA invites people from QR codes and shared links into a short wellness intake, gives them a reward-wheel reason to finish, and then points them toward the VeeVee profile funnel.
          </Text>
        </Stack>
      </Box>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
        <Metric label="Completed intakes" value={report.metrics.totalIntakes} helper="people who finished the form" />
        <Metric label="Reward spins" value={report.metrics.rewardsClaimed} helper={`${conversionRates.claimRate}% of intakes`} />
        <Metric label="Follow-up contacts" value={report.metrics.rewardContactsSaved} helper={`${conversionRates.contactRate}% of reward spins`} />
        <Metric label="Profile clicks" value={report.metrics.funnelProfileClicks} helper={`${conversionRates.profileRate}% of intakes`} />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4}>
        <SummaryCard
          title="What the user experiences"
          items={[
            "They start from a campaign link or QR code.",
            "They complete a short wellness-priority form.",
            "They spin once, receive a reward, and leave a preferred contact method.",
            "They are guided to create a free VeeVee profile.",
          ]}
        />
        <SummaryCard
          title="What the dashboard shows"
          items={[
            "How many people completed the form.",
            "How many claimed a reward and saved contact preference.",
            "Which rewards and contact methods are most common.",
            "Recent rows with abbreviated names only.",
          ]}
        />
        <SummaryCard
          title="What S3 keeps"
          items={[
            "The durable original form record.",
            "The selected wellness priorities and ranked order.",
            "Submission timing and source details.",
            "The backup record for deeper reporting or audit needs.",
          ]}
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Box bg="#FFF7EC" border="1px solid" borderColor="#F0D2A4" borderRadius="8px" p={5}>
          <Heading as="h3" size="sm">
            Privacy posture
          </Heading>
          <Text mt={3} color="#526071">
            The dashboard is designed for management reporting. It avoids raw phone numbers and email addresses, showing abbreviated names and contact method instead.
          </Text>
        </Box>
        <Box bg="#EAF4FF" border="1px solid" borderColor="#C8DDF4" borderRadius="8px" p={5}>
          <Heading as="h3" size="sm">
            Business outcome
          </Heading>
          <Text mt={3} color="#526071">
            Management can quickly see whether the campaign is moving people from interest to intake, reward claim, follow-up contact, and profile funnel click.
          </Text>
        </Box>
      </SimpleGrid>
    </Stack>
  );
}

function SummaryCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Box bg="white" border="1px solid" borderColor={LINE} borderRadius="8px" p={5}>
      <Heading as="h3" size="sm">
        {title}
      </Heading>
      <Stack as="ul" spacing={3} mt={4} pl={5} color="#526071">
        {items.map((item) => (
          <Text as="li" key={item}>
            {item}
          </Text>
        ))}
      </Stack>
    </Box>
  );
}

function Metric({ label, value, helper }: { label: string; value: number; helper: string }) {
  return (
    <Box bg="white" border="1px solid" borderColor={LINE} borderRadius="8px" p={5}>
      <Text fontSize="sm" color="#526071" fontWeight="800" textTransform="uppercase" letterSpacing="0.08em">
        {label}
      </Text>
      <Text mt={2} fontSize="4xl" fontWeight="900" lineHeight="1">
        {value}
      </Text>
      <Text mt={2} color="#526071" fontSize="sm">
        {helper}
      </Text>
    </Box>
  );
}

function Distribution({ title, items }: { title: string; items: Record<string, number> }) {
  const rows = Object.entries(items).sort((a, b) => b[1] - a[1]);

  return (
    <Box bg="white" border="1px solid" borderColor={LINE} borderRadius="8px" p={5}>
      <Heading as="h2" size="sm">
        {title}
      </Heading>
      <Stack spacing={3} mt={4}>
        {rows.length > 0 ? (
          rows.slice(0, 8).map(([label, count]) => (
            <Flex key={label} align="center" justify="space-between" gap={4}>
              <Text color="#526071" noOfLines={1}>
                {label}
              </Text>
              <Badge bg="#FFF7EC" color={NAVY} border="1px solid" borderColor="#F0D2A4">
                {count}
              </Badge>
            </Flex>
          ))
        ) : (
          <Text color="#526071">No data yet.</Text>
        )}
      </Stack>
    </Box>
  );
}

function readSession(): SwcaAdminSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SwcaAdminSession;
    return parsed.expiresAt > Math.floor(Date.now() / 1000) ? parsed : null;
  } catch (error) {
    return null;
  }
}

function formatDateTime(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function exportClaims(claims: SwcaAdminClaim[]) {
  const header = ["submitted_at", "status", "reward", "contact_method", "message_channel", "message_status", "message_sent_at", "contact_name", "submission_id"];
  const rows = claims.map((claim) => [
    claim.createdAt,
    claim.status,
    claim.rewardLabel,
    claim.contactMethod,
    claim.messageChannel,
    claim.messageStatus,
    claim.messageSentAt,
    claim.contactName,
    claim.submissionId,
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `swca-campaign-report-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function formatMessageStatus(value: string) {
  if (!value) return "-";
  if (value === "not_supported") return "not sent";
  return value;
}
