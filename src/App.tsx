// File: src/App.tsx
// Version: 1.2 (2025-12-07)
// Purpose:
//   Shell layout and routing for the myVeeVee.com marketing site.
//   Routes:
//     - "/"            → Home (hero funnel to veevee.io)
//     - "/how-it-works" → How it works (3-step flow + guides + CTA)
//     - "/terms"       → Plain-English Terms & Disclaimers page
// Notes:
//   - Header navigation stays minimal and funnel-focused.
//   - Footer now exposes a direct link to Terms & Disclaimers for legal clarity.
// Future iterations (not yet implemented):
//   - Dark-mode header/footer to fully match page backgrounds.
//   - Mobile nav menu (burger) for smaller screens.
//   - Additional legal links (Privacy Policy, cookie notices, etc.) as they are finalized.

import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Link as CLink,
  Text,
} from "@chakra-ui/react";
import { Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import Terms from "./pages/Terms";

export default function App() {
  return (
    <Flex
      minH="100vh"
      direction="column"
      bgGradient="linear(180deg, brand.50, white)"
    >
      <Header />
      <Box as="main" flex="1">
        <Container maxW="6xl" py={{ base: 8, md: 12 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </Container>
      </Box>
      <Footer />
    </Flex>
  );
}

function Header() {
  return (
    <Box
      as="header"
      borderBottom="1px solid"
      borderColor="brand.200"
      bg="whiteAlpha.70"
      backdropFilter="saturate(120%) blur(6px)"
    >
      <Container maxW="6xl" py="3">
        <Flex align="center" justify="space-between">
          <Text fontWeight="800" color="surface.900">
            VeeVee
          </Text>
          <HStack spacing="6" align="center">
            <CLink
              as={Link}
              to="/"
              color="surface.900"
              fontWeight="600"
            >
              Home
            </CLink>
            <CLink
              as={Link}
              to="/how-it-works"
              color="surface.900"
              fontWeight="600"
            >
              How it works
            </CLink>
            <Button
              as="a"
              href="https://veevee.io"
              size="sm"
              borderRadius="full"
              fontWeight="700"
            >
              Log in
            </Button>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}

function Footer() {
  return (
    <Box
      as="footer"
      borderTop="1px solid"
      borderColor="brand.200"
      bg="whiteAlpha.70"
      backdropFilter="saturate(120%) blur(6px)"
    >
      <Container maxW="6xl" py="3">
        <Flex align="center" justify="space-between" fontSize="sm">
          <Text>© 2025 VeeVee Health</Text>
          <HStack spacing="4">
            <CLink href="https://veevee.io" isExternal>
              Log in
            </CLink>
            <CLink href="https://investveevee.com" isExternal>
              For investors
            </CLink>
            <CLink as={Link} to="/terms">
              Terms &amp; Disclaimers
            </CLink>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
