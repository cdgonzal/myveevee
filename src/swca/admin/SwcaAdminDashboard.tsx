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
        ) : null}
      </Box>
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
  const header = ["submitted_at", "status", "reward", "contact_method", "contact_name", "submission_id"];
  const rows = claims.map((claim) => [
    claim.createdAt,
    claim.status,
    claim.rewardLabel,
    claim.contactMethod,
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
