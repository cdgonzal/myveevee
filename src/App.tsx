// File: src/App.tsx
// Version: 1.5 (2025-12-07)
// Updates:
//   - Added "/features" route
//   - Added "Features" link in the header
//   - Made logo + brand title a clickable link to home
//   - Maintains neon dark-glass header styling

import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Link as CLink,
  Text,
  Image,
} from "@chakra-ui/react";
import { Link, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import Terms from "./pages/Terms";
import Features from "./pages/Features"; // NEW

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
            <Route path="/features" element={<Features />} />
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
      bg="rgba(5, 8, 22, 0.75)"
      backdropFilter="blur(10px)"
      position="sticky"
      top={0}
      zIndex={20}
    >
      <Container maxW="6xl" py="3">
        <Flex align="center" justify="space-between">

          {/* LOGO + BRAND → click to go home */}
          <CLink as={Link} to="/" _hover={{ textDecoration: "none" }}>
            <Flex align="center" gap={3}>
              <Image
                src="/logo.png"
                alt="VeeVee Logo"
                boxSize="32px"
                objectFit="contain"
                filter="drop-shadow(0 0 8px rgba(0,245,160,0.55))"
              />

              <Text
                fontWeight="800"
                fontSize="xl"
                bgGradient="linear(to-r, accent.300, accent.400)"
                bgClip="text"
                textShadow="0 0 12px rgba(0, 245, 160, 0.3)"
              >
                VeeVee
              </Text>
            </Flex>
          </CLink>

          {/* NAVIGATION */}
          <HStack spacing="6" align="center">
            <CLink as={Link} to="/features" color="whiteAlpha.900" fontWeight="600"
              _hover={{ color: "accent.300" }}>
              Features
            </CLink>

            <CLink as={Link} to="/how-it-works" color="whiteAlpha.900" fontWeight="600"
              _hover={{ color: "accent.300" }}>
              How it works
            </CLink>

            <Button
              as="a"
              href="https://veevee.io"
              size="sm"
              borderRadius="full"
              fontWeight="700"
              px={5}
              bg="accent.400"
              color="#050816"
              boxShadow="0 0 18px rgba(0,245,160,0.45)"
              _hover={{ bg: "accent.300" }}
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
      backdropFilter="blur(12px)"
    >
      <Container maxW="6xl" py="3">
        <Flex align="center" justify="space-between" fontSize="sm">
          <Text color="whiteAlpha.800">© {new Date().getFullYear()} VeeVee Health</Text>

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
