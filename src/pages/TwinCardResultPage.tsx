import { useEffect, useState } from "react";
import { Box, Button, Heading, Image, Link, SimpleGrid, Stack, Text } from "@chakra-ui/react";
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
    window.print();
  };

  return (
    <Box minH="100vh" bg="#f7fbff" color="#061b38">
      <Box as="style">{printCss}</Box>
      <Box maxW="1080px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 6, md: 10 }}>
        <Stack spacing={8}>
          <Stack direction="row" align="center" spacing={3}>
            <Image src="/brand/2026/icon.svg" alt="VeeVee" h="34px" />
            <Image src="/brand/2026/wordmark.svg" alt="VeeVee" h="13px" />
          </Stack>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 8, lg: 10 }} alignItems="center">
            <Stack spacing={5}>
              <Text fontSize="xs" fontWeight="900" letterSpacing="0.16em" textTransform="uppercase" color="#1177BA">
                {TWIN_CARD_EVENT_NAME}
              </Text>
              <Heading as="h1" fontSize={{ base: "38px", md: "54px" }} lineHeight="1" letterSpacing="0">
                Your VeeVee Twin Card is ready.
              </Heading>
              <Text fontSize="lg" color="#35445d">
                Your Twin Card is your first step into VeeVee: a personal health companion that helps you prepare for
                care, organize health context, and explore next steps.
              </Text>

              {loading ? <Text color="#5d6880">Loading card...</Text> : null}
              {!loading && !lead ? (
                <Text color="#8a3b3b">This Twin Card could not be found on this device or the card API.</Text>
              ) : null}

              <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
                <Button as={RouterLink} to={APP_LINKS.internal.healthTwin}>
                  Join Beta
                </Button>
                <Button as={RouterLink} to={APP_LINKS.internal.home} variant="outline">
                  Learn More
                </Button>
                <Button as="a" href={APP_LINKS.external.authenticatedConsole} variant="outline">
                  Sign In
                </Button>
              </Stack>

              <Link as={RouterLink} to={APP_LINKS.internal.twinCard} color="#1177BA" fontWeight="900">
                Create another Twin Card
              </Link>
            </Stack>

            <Stack align="center" spacing={4}>
              {lead ? <TwinCardPrintView lead={lead} /> : null}
              {lead ? <Button onClick={printCard}>Print Card</Button> : null}
            </Stack>
          </SimpleGrid>
        </Stack>
      </Box>
    </Box>
  );
}

const printCss = buildTwinCardPrintCss();
