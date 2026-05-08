import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Link as CLink,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";

type PlaybackState = "waiting" | "loaded" | "can-play" | "playing" | "error";
type AssetCheck = {
  src: string;
  status: string;
  contentType: string;
  contentLength: string;
  bodyPrefix: string;
  error?: string;
};

const WEBM_SRC = "/avatar/hero-avatar-2.webm";
const MP4_SRC = "/avatar/hero-avatar-2.mp4";
const MEDIA_ERROR_CODES: Record<number, string> = {
  1: "MEDIA_ERR_ABORTED",
  2: "MEDIA_ERR_NETWORK",
  3: "MEDIA_ERR_DECODE",
  4: "MEDIA_ERR_SRC_NOT_SUPPORTED",
};

function statusColor(status: PlaybackState) {
  if (status === "error") {
    return "red";
  }

  if (status === "playing" || status === "can-play" || status === "loaded") {
    return "green";
  }

  return "blue";
}

function describeMediaError(error: MediaError | null) {
  if (!error) {
    return "No MediaError object was provided by the browser.";
  }

  const codeName = MEDIA_ERROR_CODES[error.code] ?? "UNKNOWN_MEDIA_ERROR";
  return `${codeName} (${error.code}): ${error.message || "No browser-provided message."}`;
}

function describeVideoElement(video: HTMLVideoElement) {
  return [
    `currentSrc: ${video.currentSrc || "(empty)"}`,
    `networkState: ${video.networkState}`,
    `readyState: ${video.readyState}`,
    `paused: ${video.paused}`,
    `duration: ${Number.isFinite(video.duration) ? video.duration : String(video.duration)}`,
    `error: ${describeMediaError(video.error)}`,
  ].join("\n");
}

async function checkAsset(src: string): Promise<AssetCheck> {
  try {
    const response = await fetch(src, {
      cache: "no-store",
      headers: { Range: "bytes=0-160" },
    });
    const bodyPrefix = await response.text().catch(() => "[binary or unreadable response]");

    return {
      src,
      status: `${response.status} ${response.statusText}`,
      contentType: response.headers.get("content-type") ?? "(missing)",
      contentLength: response.headers.get("content-length") ?? "(missing)",
      bodyPrefix: bodyPrefix.slice(0, 160),
    };
  } catch (error) {
    return {
      src,
      status: "fetch failed",
      contentType: "(unknown)",
      contentLength: "(unknown)",
      bodyPrefix: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function VideoProbe({
  title,
  description,
  mode,
}: {
  title: string;
  description: string;
  mode: "webm" | "mp4" | "combined";
}) {
  const [status, setStatus] = useState<PlaybackState>("waiting");
  const [detail, setDetail] = useState("Waiting for browser playback.");
  const [assetChecks, setAssetChecks] = useState<AssetCheck[]>([]);
  const cardBg = useColorModeValue("rgba(255,255,255,0.88)", "rgba(6,37,76,0.72)");
  const border = useColorModeValue("rgba(23,49,140,0.12)", "rgba(156,231,255,0.18)");
  const sources = useMemo(
    () =>
      mode === "webm"
        ? [WEBM_SRC]
        : mode === "mp4"
          ? [MP4_SRC]
          : [WEBM_SRC, MP4_SRC],
    [mode]
  );

  const record = (nextStatus: PlaybackState, nextDetail: string) => {
    setStatus(nextStatus);
    setDetail(nextDetail);
    console.log("[AvatarPlaybackTest]", {
      title,
      mode,
      status: nextStatus,
      detail: nextDetail,
    });
  };

  useEffect(() => {
    let isMounted = true;

    Promise.all(sources.map((src) => checkAsset(src))).then((checks) => {
      if (!isMounted) {
        return;
      }

      setAssetChecks(checks);
      console.log("[AvatarPlaybackTest] asset checks", { title, mode, checks });
    });

    return () => {
      isMounted = false;
    };
  }, [mode, title, sources]);

  return (
    <Box borderWidth="1px" borderColor={border} borderRadius="2xl" bg={cardBg} p={{ base: 4, md: 5 }}>
      <Stack spacing={4}>
        <HStack justify="space-between" align="flex-start" gap={4}>
          <Box>
            <Heading as="h2" size="md">
              {title}
            </Heading>
            <Text color="text.muted" fontSize="sm" mt={1}>
              {description}
            </Text>
          </Box>
          <Badge colorScheme={statusColor(status)} borderRadius="full" px={3} py={1}>
            {status}
          </Badge>
        </HStack>

        <Box
          borderRadius="xl"
          overflow="hidden"
          bg="linear-gradient(135deg, rgba(223,245,255,0.92) 0%, rgba(196,235,255,0.84) 48%, rgba(155,214,255,0.74) 100%)"
          border="1px solid rgba(54,197,255,0.16)"
          aspectRatio="4 / 3"
        >
          <Box
            as="video"
            controls
            muted
            loop
            playsInline
            preload="metadata"
            w="100%"
            h="100%"
            objectFit="contain"
            onLoadedMetadata={(event) => record("loaded", `loadedmetadata fired\n${describeVideoElement(event.currentTarget)}`)}
            onLoadedData={(event) => record("loaded", `loadeddata fired\n${describeVideoElement(event.currentTarget)}`)}
            onCanPlay={(event) => record("can-play", `canplay fired\n${describeVideoElement(event.currentTarget)}`)}
            onPlay={(event) => record("playing", `play fired\n${describeVideoElement(event.currentTarget)}`)}
            onStalled={(event) => record("error", `stalled fired\n${describeVideoElement(event.currentTarget)}`)}
            onSuspend={(event) => record(status, `suspend fired\n${describeVideoElement(event.currentTarget)}`)}
            onAbort={(event) => record("error", `abort fired\n${describeVideoElement(event.currentTarget)}`)}
            onError={(event) =>
              record("error", `video error fired\n${describeVideoElement(event.currentTarget)}`)
            }
          >
            {mode === "webm" ? (
              <source
                src={WEBM_SRC}
                type="video/webm"
                onError={() => record("error", `source error fired for ${WEBM_SRC}`)}
              />
            ) : null}
            {mode === "mp4" ? (
              <source
                src={MP4_SRC}
                type="video/mp4"
                onError={() => record("error", `source error fired for ${MP4_SRC}`)}
              />
            ) : null}
            {mode === "combined" ? (
              <>
                <source
                  src={WEBM_SRC}
                  type="video/webm"
                  onError={() => record("error", `source error fired for ${WEBM_SRC}`)}
                />
                <source
                  src={MP4_SRC}
                  type="video/mp4"
                  onError={() => record("error", `source error fired for ${MP4_SRC}`)}
                />
              </>
            ) : null}
          </Box>
        </Box>

        <Text fontSize="sm" color="text.muted" whiteSpace="pre-wrap">
          {detail}
        </Text>

        <Stack spacing={2}>
          <Text fontSize="xs" fontWeight="900" letterSpacing="0.12em" textTransform="uppercase" color="accent.soft">
            Asset response check
          </Text>
          {assetChecks.map((check) => (
            <Box key={check.src} borderWidth="1px" borderColor={border} borderRadius="lg" p={3}>
              <Text fontSize="xs" fontWeight="800">
                {check.src}
              </Text>
              <Text fontSize="xs" color="text.muted" whiteSpace="pre-wrap" mt={1}>
                {[
                  `status: ${check.status}`,
                  `content-type: ${check.contentType}`,
                  `content-length: ${check.contentLength}`,
                  check.error ? `fetch error: ${check.error}` : `first bytes/text: ${check.bodyPrefix || "(empty)"}`,
                ].join("\n")}
              </Text>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

export default function AvatarPlaybackTest() {
  return (
    <Stack spacing={8}>
      <Box>
        <Badge colorScheme="blue" borderRadius="full" px={3} py={1} mb={3}>
          Hidden Diagnostic
        </Badge>
        <Heading as="h1" size="xl" mb={3}>
          Avatar Playback Test
        </Heading>
        <Text color="text.muted" maxW="3xl">
          This page tests the public avatar video assets exactly as the hero consumes them. Use the direct file
          links first, then confirm at least one video block can play.
        </Text>
      </Box>

      <HStack spacing={3} flexWrap="wrap">
        <Button as={CLink} href={WEBM_SRC} isExternal borderRadius="full">
          Open WEBM
        </Button>
        <Button as={CLink} href={MP4_SRC} isExternal borderRadius="full">
          Open MP4
        </Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={5}>
        <VideoProbe title="WEBM Only" description="Direct VP9/WebM source." mode="webm" />
        <VideoProbe title="MP4 Only" description="Direct H.264/MP4 fallback source." mode="mp4" />
        <VideoProbe title="Browser Choice" description="WEBM first, then MP4 fallback." mode="combined" />
      </SimpleGrid>
    </Stack>
  );
}
