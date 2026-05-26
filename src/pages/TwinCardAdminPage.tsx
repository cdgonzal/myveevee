import { useEffect, useState } from "react";
import { Box, Button, Heading, HStack, Image, Link, Stack, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { apiCardToLead, fetchRecentTwinCards, type TwinCardApiCard } from "../twinCard/api";
import { buildTwinCardPrintCss } from "../twinCard/printContract";
import { listTwinCardLeads } from "../twinCard/storage";
import { getTwinCardGenerationStatusLabel } from "../twinCard/statusContract";
import { TwinCardPrintView } from "../twinCard/TwinCardPrintView";
import type { TwinCardLead } from "../twinCard/types";
import { APP_LINKS } from "../config/links";

export default function TwinCardAdminPage() {
  const [cards, setCards] = useState<TwinCardLead[]>(() => listTwinCardLeads());
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.cardId ?? "");

  useEffect(() => {
    let cancelled = false;
    fetchRecentTwinCards("5353").then((apiCards) => {
      if (!cancelled && apiCards) {
        const nextCards = apiCards.map((card: TwinCardApiCard) => apiCardToLead(card));
        setCards(nextCards);
        setSelectedCardId((current) => current || nextCards[0]?.cardId || "");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCard = cards.find((card) => card.cardId === selectedCardId) ?? cards[0] ?? null;

  return (
    <Box minH="100vh" bg="#f7fbff" color="#061b38">
      <Box as="style">{printCss}</Box>
      <Box maxW="1180px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 6, md: 10 }}>
        <Stack spacing={7}>
          <HStack spacing={3}>
            <Image src="/brand/2026/icon.svg" alt="VeeVee" h="34px" />
            <Image src="/brand/2026/wordmark.svg" alt="VeeVee" h="13px" />
          </HStack>

          <Stack spacing={2}>
            <Heading as="h1" size="xl">Twin Card Staff View</Heading>
            <Text color="#5d6880">Recent cards from the booth device or the Twin Card API.</Text>
          </Stack>

          <HStack>
            <Button onClick={() => window.print()} isDisabled={!selectedCard}>
              Print Selected Card
            </Button>
            <Button as={RouterLink} to={APP_LINKS.internal.twinCard} variant="outline">
              Create Card
            </Button>
          </HStack>

          {selectedCard ? <TwinCardPrintView lead={selectedCard} /> : null}

          <Box overflowX="auto" bg="white" border="1px solid #dbeaf5" borderRadius="8px">
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Created</Th>
                  <Th>Name</Th>
                  <Th>Focus</Th>
                  <Th>Status</Th>
                  <Th>Open</Th>
                </Tr>
              </Thead>
              <Tbody>
                {cards.map((card) => (
                  <Tr key={card.cardId} bg={card.cardId === selectedCard?.cardId ? "#eefaff" : undefined} onClick={() => setSelectedCardId(card.cardId)} cursor="pointer">
                    <Td>{new Date(card.createdAt).toLocaleString()}</Td>
                    <Td>{card.firstName}</Td>
                    <Td>{card.wellnessInterestLabel}</Td>
                    <Td>{getTwinCardGenerationStatusLabel(card.generationStatus)}</Td>
                    <Td>
                      <Link as={RouterLink} to={`/twin-card/result/${card.cardId}`} color="#1177BA">
                        Result
                      </Link>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

const printCss = buildTwinCardPrintCss();
