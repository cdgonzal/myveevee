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
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import Terms from "./pages/Terms";
import Features from "./pages/Features";
import Testimonials from "./pages/Testimonials";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  const pageGradient = useColorModeValue(
    "linear(to-b, gray.50, blue.50)",
    "linear(to-b, #050816, #070B1F)"
  );

  return (
    <Flex minH="100vh" direction="column" bgGradient={pageGradient}>
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
  const headerBg = useColorModeValue("bg.glass", "bg.glass");
  const borderColor = useColorModeValue("border.default", "border.default");
  const navColor = useColorModeValue("text.primary", "text.primary");
  const brandGradient = useColorModeValue(
    "linear(to-r, brand.300, accent.500)",
    "linear(to-r, accent.300, accent.400)"
  );
  const drawerBg = useColorModeValue("white", "surface.900");

  return (
    <>
      <Box
        as="header"
        borderBottom="1px solid"
        borderColor={borderColor}
        bg={headerBg}
        backdropFilter="saturate(150%) blur(12px)"
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Container maxW="6xl" py="3">
          <Flex align="center" justify="space-between">
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
                bgGradient={brandGradient}
                bgClip="text"
              >
                VeeVee
              </Text>
            </HStack>

            <HStack spacing={{ base: 3, md: 4 }} align="center">
              <HStack
                spacing={{ base: 3, md: 6 }}
                display={{ base: "none", md: "flex" }}
              >
                <CLink as={Link} to="/features" color={navColor} fontWeight="600">
                  Why VeeVee
                </CLink>
                <CLink as={Link} to="/testimonials" color={navColor} fontWeight="600">
                  Testimonials
                </CLink>
                <CLink as={Link} to="/how-it-works" color={navColor} fontWeight="600">
                  How it works
                </CLink>
              </HStack>

              <ColorModeToggle />

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

              <IconButton
                aria-label="Open navigation menu"
                icon={<Box as="span" fontSize="12px" lineHeight="1">Menu</Box>}
                variant="ghost"
                color={navColor}
                display={{ base: "inline-flex", md: "none" }}
                onClick={onOpen}
              />
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Drawer placement="right" onClose={onClose} isOpen={isOpen} size="xs">
        <DrawerOverlay />
        <DrawerContent bg={drawerBg} color={navColor}>
          <DrawerCloseButton mt={2} />
          <DrawerHeader borderBottomWidth="1px" borderColor={borderColor}>
            Navigation
          </DrawerHeader>
          <DrawerBody>
            <Stack spacing={4} mt={4}>
              <ColorModeToggle />
              <CLink as={Link} to="/" onClick={onClose} fontWeight="600" color={navColor}>
                Home
              </CLink>
              <CLink as={Link} to="/features" onClick={onClose} fontWeight="600" color={navColor}>
                Why VeeVee
              </CLink>
              <CLink as={Link} to="/testimonials" onClick={onClose} fontWeight="600" color={navColor}>
                Testimonials
              </CLink>
              <CLink as={Link} to="/how-it-works" onClick={onClose} fontWeight="600" color={navColor}>
                How it works
              </CLink>
              <CLink href="https://veevee.io" isExternal onClick={onClose} fontWeight="700" color="accent.soft">
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
  const footerBorder = useColorModeValue("border.default", "border.default");
  const footerBg = useColorModeValue("bg.glass", "bg.glass");
  const primaryText = useColorModeValue("text.primary", "text.primary");
  const mutedText = useColorModeValue("text.muted", "text.muted");

  return (
    <Box
      as="footer"
      borderTop="1px solid"
      borderColor={footerBorder}
      bg={footerBg}
      backdropFilter="saturate(150%) blur(12px)"
    >
      <Container maxW="6xl" py="3">
        <Flex align="center" justify="space-between" fontSize="sm">
          <Text color={mutedText}>Copyright {new Date().getFullYear()} VeeVee Health</Text>
          <HStack spacing="4">
            <CLink as={Link} to="/features" color={primaryText}>
              Why VeeVee
            </CLink>
            <CLink href="https://veevee.io" isExternal color={primaryText}>
              Start at VeeVee.io
            </CLink>
            <CLink href="https://investveevee.com" isExternal color={primaryText}>
              Investor Info
            </CLink>
            <CLink as={Link} to="/terms" color={primaryText}>
              Terms &amp; Disclaimers
            </CLink>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}

function ColorModeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  const label = colorMode === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <Button
      onClick={toggleColorMode}
      size="sm"
      variant="outline"
      aria-label={label}
      title={label}
    >
      {colorMode === "dark" ? "Light mode" : "Dark mode"}
    </Button>
  );
}
