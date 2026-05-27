import { useEffect, useState } from "react";
import { Box, Button, Heading, Image, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { apiCardToLead, fetchTwinCard } from "../twinCard/api";
import { TWIN_CARD_EVENT_NAME } from "../twinCard/constants";
import { trackTwinCardEvent } from "../twinCard/events";
import { buildTwinCardPrintCss } from "../twinCard/printContract";
import { getTwinCardLead } from "../twinCard/storage";
import { TwinCardPrintView } from "../twinCard/TwinCardPrintView";
import type { TwinCardLead } from "../twinCard/types";
import { APP_LINKS } from "../config/links";

export default function TwinCardResultPage() {
  const { cardId = "" } = useParams();
  const [lead, setLead] = useState<TwinCardLead | null>(() => getTwinCardLead(cardId));
  const [loading, setLoading] = useState(Boolean(cardId));

  useEffect(() => {
    let cancelled = false;
    trackTwinCardEvent("public.twin_card.result_page_viewed", lead ?? undefined);

    fetchTwinCard(cardId).then((card) => {
      if (!cancelled) {
        if (card) setLead(apiCardToLead(card, lead ?? undefined));
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [cardId]);

  const printCard = () => {
    if (lead) trackTwinCardEvent("public.twin_card.print_clicked", lead);
    if (lead?.printImageUrl) {
      openPrintCardWindow(lead);
      return;
    }
    window.print();
  };

  const downloadFileName = lead ? buildTwinCardFileName(lead) : "veevee_twin_card.png";

  return (
    <Box minH="100vh" bg="#f7fbff" color="#061b38">
      <Box as="style">{printCss}</Box>
      <Box maxW="1080px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 6, md: 10 }}>
        <Stack spacing={8}>
          <Stack direction="row" align="center" spacing={3}>
            <Image src="/brand/2026/icon.svg" alt="VeeVee" h="34px" />
            <Image src="/brand/2026/wordmark.svg" alt="VeeVee" h="13px" />
          </Stack>

          <Stack spacing={6} align="center" textAlign="center">
            <Stack spacing={3} maxW="620px">
              <Text fontSize="xs" fontWeight="900" letterSpacing="0.16em" textTransform="uppercase" color="#1177BA">
                {TWIN_CARD_EVENT_NAME}
              </Text>
              <Heading as="h1" fontSize={{ base: "30px", md: "42px" }} lineHeight="1.05" letterSpacing="0">
                Your Twin Card is ready.
              </Heading>
            </Stack>

            {loading ? <Text color="#5d6880">Loading card...</Text> : null}
            {!loading && !lead ? (
              <Text color="#8a3b3b">This Twin Card could not be found on this device or the card API.</Text>
            ) : null}

            <Stack align="center" spacing={5} w="100%">
              {lead?.printImageUrl ? (
                <Box
                  className="twin-card-print-area"
                  bg="white"
                  border="1px solid rgba(6, 37, 76, 0.14)"
                  borderRadius="8px"
                  boxShadow="0 24px 55px rgba(6, 37, 76, 0.18)"
                  overflow="hidden"
                  w={{ base: "min(100%, 360px)", md: "360px" }}
                >
                  <Image
                    src={lead.printImageUrl}
                    alt={`${lead.firstName} VeeVee Twin Card`}
                    w="100%"
                    display="block"
                  />
                </Box>
              ) : lead ? (
                <TwinCardPrintView lead={lead} />
              ) : null}
              {lead ? (
                <Stack spacing={3} w="100%" maxW="420px">
                  <Button
                    as={RouterLink}
                    to={APP_LINKS.internal.healthTwin}
                    minH="54px"
                    borderRadius="999px"
                    bg="#061b38"
                    color="white"
                    _hover={{ bg: "#0b2b57" }}
                  >
                    Get More Personalized
                  </Button>
                  <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
                    <Button onClick={printCard} flex="1" variant="outline">
                      Print
                    </Button>
                  {lead.printImageUrl ? (
                    <Button
                      as="a"
                      href={lead.printImageUrl}
                      download={downloadFileName}
                      flex="1"
                      variant="outline"
                    >
                      Download Card
                    </Button>
                  ) : null}
                  </Stack>
                </Stack>
              ) : null}
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

const printCss = buildTwinCardPrintCss();

function openPrintCardWindow(lead: TwinCardLead) {
  if (!lead.printImageUrl) return;
  const printWindow = window.open("", "_blank", "width=900,height=1100");
  if (!printWindow) {
    window.open(lead.printImageUrl, "_blank", "noopener,noreferrer");
    return;
  }

  printWindow.opener = null;
  writePrintDocument(printWindow, {
    title: buildTwinCardFileName(lead),
    imageUrl: lead.printImageUrl,
    alt: `${lead.firstName} Twin Card`,
  });
}

function writePrintDocument(
  printWindow: Window,
  options: {
    title: string;
    imageUrl: string;
    alt: string;
  }
) {
  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
<html>
<head>
  <title>${escapeHtml(options.title)}</title>
  <style>
    @page { size: 4in 6in; margin: 0; }
    html, body { margin: 0; padding: 0; width: 4in; min-height: 6in; background: #fff; }
    body { overflow: hidden; }
    img { width: 4in; height: 6in; object-fit: fill; display: block; margin: 0; padding: 0; }
    .status { font: 16px Arial, sans-serif; color: #061b38; padding: 24px; text-align: center; }
    @media screen {
      html, body { width: 100%; min-height: 100%; }
      body { display: grid; place-items: center; overflow: auto; }
      img { box-shadow: 0 18px 50px rgba(6,27,56,0.22); }
    }
  </style>
</head>
<body>
  <img id="twin-card-print-image" src="${escapeHtml(options.imageUrl)}" alt="${escapeHtml(options.alt)}" />
  <script>
    const image = document.getElementById("twin-card-print-image");
    function printWhenReady() {
      window.focus();
      setTimeout(function(){ window.print(); }, 250);
    }
    image.addEventListener("load", printWhenReady, { once: true });
    image.addEventListener("error", function(){
      document.body.innerHTML = '<div class="status">Print image did not load. Close this window and click Print Card again.</div>';
    }, { once: true });
    if (image.complete && image.naturalWidth > 0) printWhenReady();
  </script>
</body>
</html>`);
  printWindow.document.close();
}

function buildTwinCardFileName(lead: TwinCardLead) {
  const name = sanitizeFileNamePart(lead.firstName || "guest");
  const timestamp = formatFileTimestamp(lead.renderedAt ?? lead.createdAt ?? new Date().toISOString());
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

function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
