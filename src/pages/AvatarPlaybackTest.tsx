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
import { useState } from "react";

type PlaybackState = "waiting" | "loaded" | "can-play" | "playing" | "error";

const WEBM_SRC = "/avatar/hero-avatar-2.webm";
const MP4_SRC = "/avatar/hero-avatar-2.mp4";

function statusColor(status: PlaybackState) {
  if (status === "error") {
    return "red";
  }

  if (status === "playing" || status === "can-play" || status === "loaded") {
    return "green";
  }

  return "blue";
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
  const cardBg = useColorModeValue("rgba(255,255,255,0.88)", "rgba(6,37,76,0.72)");
  const border = useColorModeValue("rgba(23,49,140,0.12)", "rgba(156,231,255,0.18)");

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
            onLoadedData={() => record("loaded", "loadeddata fired")}
            onCanPlay={() => record("can-play", "canplay fired")}
            onPlay={() => record("playing", "play fired")}
            onError={(event) =>
              record("error", event.currentTarget.error?.message || "video error fired without a MediaError message")
            }
          >
            {mode === "webm" ? <source src={WEBM_SRC} type="video/webm" /> : null}
            {mode === "mp4" ? <source src={MP4_SRC} type="video/mp4" /> : null}
            {mode === "combined" ? (
              <>
                <source src={WEBM_SRC} type="video/webm" />
                <source src={MP4_SRC} type="video/mp4" />
              </>
            ) : null}
          </Box>
        </Box>

        <Text fontSize="sm" color="text.muted">
          {detail}
        </Text>
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
