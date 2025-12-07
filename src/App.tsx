// File: src/App.tsx
// Version: 1.3 (2025-12-07)
// Purpose:
//   Shell layout and routing for the myVeeVee.com marketing site.
//   Routes:
//     - "/"              → Home (hero funnel to veevee.io)
//     - "/how-it-works"  → How it works (3-step flow + guides + CTA)
//     - "/terms"         → Plain-English Terms & Disclaimers page
// Visual shell:
//   - Full-page dark gradient background to match neon hero sections.
//   - Glassmorphism header & footer (blurred dark navy) with neon Log in button.
// Future iterations (not yet implemented):
//   - Mobile nav menu (burger) for smaller screens.
//   - Additional legal links (Privacy Policy, cookie notices, etc.).

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
      bgGradient="linear(to-b, #050816, #070B1F)"
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
      borderColor="whiteAlpha.200"
      bg="rgba(5, 8, 22, 0.7)"           // glassy dark background
      backdropFilter="saturate(150%) blur(12px)"
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Container maxW="6xl" py="3">
        <Flex align="center" justify="space-between">
          <Text fontWeight="800" color="whiteAlpha.900">
            VeeVee
          </Text>
          <HStack spacing="6" align="center">
            <CLink
              as={Link}
              to="/"
              color="whiteAlpha.900"
              fontWeight="600"
            >
              Home
            </CLink>
            <CLink
              as={Link}
              to="/how-it-works"
              color="whiteAlpha.900"
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
              px={5}
              boxShadow="0 0 20px rgba(0, 245, 160, 0.45)"
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
      borderColor="whiteAlpha.200"
      bg="rgba(5, 8, 22, 0.7)"
      backdropFilter="saturate(150%) blur(12px)"
    >
      <Container maxW="6xl" py="3">
        <Flex align="center" justify="space-between" fontSize="sm">
          <Text color="whiteAlpha.800">© 2025 VeeVee Health</Text>
          <HStack spacing="4">
            <CLink href="https://veevee.io" isExternal color="whiteAlpha.900">
              Log in
            </CLink>
            <CLink
              href="https://investveevee.com"
              isExternal
              color="whiteAlpha.900"
            >
              For investors
            </CLink>
            <CLink as={Link} to="/terms" color="whiteAlpha.900">
              Terms &amp; Disclaimers
            </CLink>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
