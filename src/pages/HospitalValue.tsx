import {
  Box,
  Heading,
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
  useColorModeValue,
} from "@chakra-ui/react";
import { HOSPITAL_VALUE_ROWS } from "./marketingContent";

export default function HospitalValue() {
  const pageGradient = useColorModeValue(
    "linear(to-b, #FFFFFF, #9CE7FF)",
    "linear(to-b, surface.900, surface.800)"
  );
  const border = useColorModeValue("border.default", "border.default");
  const muted = useColorModeValue("text.muted", "text.muted");
  const subtle = useColorModeValue("text.subtle", "text.subtle");
  const panelBg = useColorModeValue("rgba(255, 255, 255, 0.82)", "rgba(6, 37, 76, 0.70)");
  const tableHeadBg = useColorModeValue("brand.50", "surface.700");
  const positiveColor = useColorModeValue("green.600", "green.300");

  return (
    <Box as="main" minH="100vh" bgGradient={pageGradient} color="text.primary" py={{ base: 10, md: 20 }}>
      <Stack spacing={{ base: 8, md: 12 }} maxW="6xl" mx="auto" px={{ base: 6, md: 10 }}>
        <Box borderWidth="1px" borderColor={border} borderRadius="3xl" bg={panelBg} boxShadow="0 24px 50px rgba(6, 37, 76, 0.12)" p={{ base: 6, md: 8 }}>
          <Stack spacing={4}>
            <Text fontSize="sm" letterSpacing="0.18em" textTransform="uppercase" color="accent.soft">
              HOSPITAL VALUE
            </Text>
            <Heading as="h1" size={{ base: "lg", md: "xl" }} fontWeight="800">
              A simple way to think about VeeVee value for hospitals.
            </Heading>
            <Text color={muted} maxW="4xl" fontSize={{ base: "md", md: "lg" }}>
              VeeVee can help hospitals bring in new revenue, reduce labor costs, and lower risk, often making the system pay for itself quickly.
            </Text>
          </Stack>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Box borderWidth="1px" borderColor={border} borderRadius="2xl" bg={panelBg} p={5}>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="accent.soft" mb={2}>
              Revenue engine
            </Text>
            <Heading as="h2" size="sm" mb={2}>
              One billed patient can cover one bed-month
            </Heading>
            <Text color={muted} fontSize="sm">
              With RPM or RTM billing, one patient can roughly cover the monthly cost of one VeeVee bed.
            </Text>
          </Box>
          <Box borderWidth="1px" borderColor={border} borderRadius="2xl" bg={panelBg} p={5}>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="accent.soft" mb={2}>
              Labor savings
            </Text>
            <Heading as="h2" size="sm" mb={2}>
              Replacing sitters changes the math fast
            </Heading>
            <Text color={muted} fontSize="sm">
              Even a small drop in 1:1 sitter use can offset a large part of the rollout.
            </Text>
          </Box>
          <Box borderWidth="1px" borderColor={border} borderRadius="2xl" bg={panelBg} p={5}>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="accent.soft" mb={2}>
              Risk mitigation
            </Text>
            <Heading as="h2" size="sm" mb={2}>
              One prevented fall matters
            </Heading>
            <Text color={muted} fontSize="sm">
              Fewer falls and safer workflows can protect both patients and hospital budgets.
            </Text>
          </Box>
        </SimpleGrid>

        <Box borderWidth="1px" borderColor={border} borderRadius="2xl" bg={panelBg} p={{ base: 6, md: 8 }}>
          <Stack spacing={5}>
            <Heading as="h2" size="md">
              Summary: The VeeVee Value Table
            </Heading>
            <TableContainer borderWidth="1px" borderColor={border} borderRadius="xl" overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead bg={tableHeadBg}>
                  <Tr>
                    <Th>Rollout</Th>
                    <Th isNumeric>Monthly cost</Th>
                    <Th isNumeric>New revenue</Th>
                    <Th isNumeric>Labor savings</Th>
                    <Th isNumeric>Net monthly impact</Th>
                    <Th>Payback period</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {HOSPITAL_VALUE_ROWS.map((row) => (
                    <Tr key={row.rollout}>
                      <Td fontWeight="700">{row.rollout}</Td>
                      <Td isNumeric>{row.monthlyCost}</Td>
                      <Td isNumeric>{row.revenue}</Td>
                      <Td isNumeric>{row.laborSavings}</Td>
                      <Td isNumeric color={positiveColor} fontWeight="700">
                        {row.netImpact}
                      </Td>
                      <Td fontWeight="700">{row.payback}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {HOSPITAL_VALUE_ROWS.map((row) => (
                <Box key={`${row.rollout}-note`} borderWidth="1px" borderColor={border} borderRadius="xl" p={4}>
                  <Heading as="h3" size="xs" mb={2}>
                    {row.rollout}
                  </Heading>
                  <Text color={muted} fontSize="sm">
                    {row.valueNote}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>

            <Text fontSize="xs" color={subtle}>
              Illustrative example only. Actual results depend on staffing, patient mix, workflows, reimbursement, and rollout design.
            </Text>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
