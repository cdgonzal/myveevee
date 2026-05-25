import { Box, Image, Stack, Text } from "@chakra-ui/react";
import { QRCodeSVG } from "qrcode.react";
import { TWIN_CARD_EVENT_DATE, TWIN_CARD_EVENT_NAME } from "./constants";
import type { TwinCardLead } from "./types";

type TwinCardPrintViewProps = {
  lead: TwinCardLead;
  resultUrl?: string;
};

export function TwinCardPrintView({ lead, resultUrl = lead.cardResultUrl }: TwinCardPrintViewProps) {
  const avatarSrc = lead.generatedAvatarUrl ?? lead.generatedAvatarDataUrl ?? lead.sourceImageUrl ?? lead.sourceImageDataUrl;

  return (
    <Box
      className="twin-card-print-area"
      w={{ base: "min(100%, 360px)", md: "360px" }}
      h={{ base: "504px", md: "504px" }}
      bg="#ffffff"
      color="#061b38"
      border="1px solid rgba(6, 37, 76, 0.14)"
      borderRadius="8px"
      overflow="hidden"
      boxShadow="0 24px 55px rgba(6, 37, 76, 0.18)"
      position="relative"
    >
      <Box bg="#06254C" color="white" px={5} py={4}>
        <Stack spacing={1}>
          <Text fontSize="11px" fontWeight="900" letterSpacing="0.16em" textTransform="uppercase" color="#9CE7FF">
            VeeVee
          </Text>
          <Text fontSize="25px" lineHeight="1" fontWeight="900">
            VeeVee Twin Card
          </Text>
          <Text fontSize="11px" color="whiteAlpha.800">
            {TWIN_CARD_EVENT_NAME} · {TWIN_CARD_EVENT_DATE}
          </Text>
        </Stack>
      </Box>

      <Stack spacing={4} px={5} py={5} align="center">
        <Box
          w="230px"
          h="230px"
          borderRadius="8px"
          bg="linear-gradient(135deg, #e9fbff, #f8fbff)"
          border="1px solid rgba(17, 119, 186, 0.18)"
          overflow="hidden"
          display="grid"
          placeItems="center"
        >
          {avatarSrc ? (
            <Image src={avatarSrc} alt={`${lead.firstName} VeeVee Twin avatar`} w="100%" h="100%" objectFit="cover" />
          ) : (
            <Text fontSize="64px" fontWeight="900" color="#1177BA">
              {lead.firstName.slice(0, 1).toUpperCase()}
            </Text>
          )}
        </Box>

        <Stack spacing={1} align="center" textAlign="center">
          <Text fontSize="30px" lineHeight="1" fontWeight="900">
            {lead.firstName}
          </Text>
          <Text fontSize="14px" fontWeight="800" color="#1177BA">
            Health Twin Activated
          </Text>
          <Text fontSize="12px" color="#35445d">
            Focus: {lead.wellnessInterestLabel}
          </Text>
        </Stack>

        <Stack direction="row" spacing={3} align="center" w="100%" justify="center">
          <Box bg="white" p={2} border="1px solid rgba(6, 37, 76, 0.12)" borderRadius="6px">
            <QRCodeSVG value={resultUrl} size={76} level="M" includeMargin={false} />
          </Box>
          <Stack spacing={0} maxW="140px">
            <Text fontSize="13px" fontWeight="900">
              Continue your journey
            </Text>
            <Text fontSize="10px" color="#5d6880" lineHeight="1.35">
              Scan for your card page and VeeVee beta access.
            </Text>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}
