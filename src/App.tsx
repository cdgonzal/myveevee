// File: src/App.tsx
// Version: 1.6 (2025-12-09)
// Purpose:
//   Shell layout and routing for the myVeeVee.com marketing site.
//   Routes:
//     - "/"              → Home (hero funnel to veevee.io)
//     - "/features"      → Features (AI Wellness Guides, benefits, etc.)
//     - "/how-it-works"  → How it works (3-step flow + guides + CTA)
//     - "/testimonials"  → Social proof / success stories
//     - "/terms"         → Plain-English Terms & Disclaimers page
// Visual shell:
//   - Full-page dark gradient background to match neon hero sections.
//   - Glassmorphism header & footer (blurred dark navy) with neon Log in button.
// Responsive behavior:
//   - Desktop/tablet: logo + brand + inline nav ("Features", "How it works") + Log in.
//   - Mobile: logo + brand + Log in + hamburger icon that opens a side drawer
//     with the same nav links.
// Behavior:
//   - ScrollToTop ensures each route change starts at the top of the page.
// Future iterations (not yet implemented):
//   - Animate drawer links with subtle motion.
//   - Add additional legal links (Privacy, cookies) when ready.

import { useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Link as CLink,
  Text,
  Image,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Stack,
} from "@chakra-ui/react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import Terms from "./pages/Terms";
import Features from "./pages/Features";
import Testimonials from "./pages/Testimonials";

// Scroll to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

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
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </Container>
      </Box>
      <Footer />
    </Flex>
  );
}

function Header() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box
        as="header"
        borderBottom="1px solid"
        borderColor="whiteAlpha.200"
        bg="rgba(5, 8, 22, 0.7)" // glassy dark background
        backdropFilter="saturate(150%) blur(12px)"
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Container maxW="6xl" py="3">
          <Flex align="center" justify="space-between">
            {/* Logo + brand → home link */}
            <HStack
              as={Link}
              to="/"
              spacing={3}
              align="center"
              _hover={{ textDecoration: "none" }}
            >
              <Image
                src="/logo.png"
                alt="VeeVee logo"
                boxSize={{ base: "28px", md: "32px" }}
                objectFit="contain"
              />
              <Text
                fontWeight="800"
                fontSize={{ base: "md", md: "lg" }}
                bgGradient="linear(to-r, accent.300, accent.400)"
                bgClip="text"
              >
                VeeVee
              </Text>
            </HStack>

            {/* Right side: nav + login + burger */}
            <HStack spacing={{ base: 3, md: 6 }} align="center">
              {/* Desktop nav links */}
              <HStack
                spacing={{ base: 3, md: 6 }}
                display={{ base: "none", md: "flex" }}
              >
                <CLink
                  as={Link}
                  to="/features"
                  color="whiteAlpha.900"
                  fontWeight="600"
                >
                  Why VeeVee
                </CLink>
                <CLink
                  as={Link}
                  to="/testimonials"
                  color="whiteAlpha.900"
                  fontWeight="600"
                >
                  Testimonials
                </CLink>
                <CLink
                  as={Link}
                  to="/how-it-works"
                  color="whiteAlpha.900"
                  fontWeight="600"
                >
                  How it works
                </CLink>
              </HStack>

              {/* Log in button: always visible, just slightly tighter on mobile */}
              <Button
                as="a"
                href="https://veevee.io"
                size="sm"
                borderRadius="full"
                fontWeight="700"
                px={{ base: 4, md: 5 }}
                boxShadow="0 0 20px rgba(0, 245, 160, 0.45)"
              >
                Log in
              </Button>

              {/* Mobile hamburger: only show on base–sm, hide on md+ */}
              <IconButton
                aria-label="Open navigation menu"
                icon={
                  <Box
                    as="span"
                    fontSize="22px"
                    lineHeight="1"
                    color="whiteAlpha.900"
                    mt="2px"
                  >
                    ☰
                  </Box>
                }
                variant="ghost"
                color="whiteAlpha.900"
                display={{ base: "inline-flex", md: "none" }}
                onClick={onOpen}
              />
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Mobile drawer nav */}
      <Drawer placement="right" onClose={onClose} isOpen={isOpen} size="xs">
        <DrawerOverlay />
        <DrawerContent bg="#050816" color="whiteAlpha.900">
          <DrawerCloseButton mt={2} />
          <DrawerHeader borderBottomWidth="1px" borderColor="whiteAlpha.200">
            Navigation
          </DrawerHeader>
          <DrawerBody>
            <Stack spacing={4} mt={4}>
              <CLink
                as={Link}
                to="/"
                onClick={onClose}
                fontWeight="600"
                color="whiteAlpha.900"
              >
                Home
              </CLink>
              <CLink
                as={Link}
                to="/features"
                onClick={onClose}
                fontWeight="600"
                color="whiteAlpha.900"
              >
                Why VeeVee
              </CLink>
              <CLink
                as={Link}
                to="/testimonials"
                onClick={onClose}
                fontWeight="600"
                color="whiteAlpha.900"
              >
                Testimonials
              </CLink>
              <CLink
                as={Link}
                to="/how-it-works"
                onClick={onClose}
                fontWeight="600"
                color="whiteAlpha.900"
              >
                How it works
              </CLink>
              <CLink
                href="https://veevee.io"
                isExternal
                onClick={onClose}
                fontWeight="700"
                color="accent.300"
              >
                Log in to VeeVee.io
              </CLink>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
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
          <Text color="whiteAlpha.800">
            © {new Date().getFullYear()} VeeVee Health
          </Text>
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
