import { Suspense, lazy, useEffect } from "react";
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
  Switch,
} from "@chakra-ui/react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { APP_LINKS } from "./config/links";

const Home = lazy(() => import("./pages/Home"));
const Features = lazy(() => import("./pages/Features"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Simulator = lazy(() => import("./pages/Simulator"));
const Testimonials = lazy(() => import("./pages/Testimonials"));
const Terms = lazy(() => import("./pages/Terms"));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function PageFallback() {
  return (
    <Box py={12} textAlign="center">
      <Text color="text.muted">Loading...</Text>
    </Box>
  );
}

export default function App() {
  const pageGradient = useColorModeValue(
    "linear(to-b, #FFFFFF, #9CE7FF)",
    "linear(to-b, surface.900, surface.800)"
  );

  return (
    <Flex minH="100vh" direction="column" bgGradient={pageGradient}>
      <Header />
      <Box as="main" flex="1">
        <Container maxW="6xl" py={{ base: 8, md: 12 }}>
          <ScrollToTop />
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path={APP_LINKS.internal.home} element={<Home />} />
              <Route path={APP_LINKS.internal.whyVeeVee} element={<Features />} />
              <Route path={APP_LINKS.internal.howItWorks} element={<HowItWorks />} />
              <Route path={APP_LINKS.internal.simulator} element={<Simulator />} />
              <Route path={APP_LINKS.internal.testimonials} element={<Testimonials />} />
              <Route path={APP_LINKS.internal.terms} element={<Terms />} />
            </Routes>
          </Suspense>
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
  const drawerBg = useColorModeValue("white", "surface.900");
  const logoFilter = useColorModeValue("none", "invert(1)");

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
              spacing={2}
              align="center"
              _hover={{ textDecoration: "none" }}
            >
              <Image
                src="/brand/2026/icon.svg"
                alt="VeeVee icon"
                h={{ base: "26px", md: "30px" }}
                w="auto"
                objectFit="contain"
                filter={logoFilter}
              />
              <Image
                src="/brand/2026/wordmark.svg"
                alt="VeeVee"
                h={{ base: "10px", md: "12px" }}
                w="auto"
                objectFit="contain"
                filter={logoFilter}
              />
            </HStack>

            <HStack spacing={{ base: 3, md: 4 }} align="center">
              <HStack
                spacing={{ base: 3, md: 6 }}
                display={{ base: "none", md: "flex" }}
              >
                <CLink as={Link} to={APP_LINKS.internal.howItWorks} color={navColor} fontWeight="600">
                  How It Works
                </CLink>
                <CLink as={Link} to={APP_LINKS.internal.simulator} color={navColor} fontWeight="600">
                  Wellness Mirror®
                </CLink>
                <CLink as={Link} to={APP_LINKS.internal.whyVeeVee} color={navColor} fontWeight="600">
                  Features
                </CLink>
                <CLink as={Link} to={APP_LINKS.internal.testimonials} color={navColor} fontWeight="600">
                  Testimonials
                </CLink>
              </HStack>

              <ColorModeToggle
                display={{ base: "none", md: "inline-flex" }}
                withDivider
              />

              <Button
                as="a"
                href={APP_LINKS.external.authenticatedConsole}
                size="sm"
                borderRadius="full"
                fontWeight="700"
                px={{ base: 4, md: 5 }}
                boxShadow="0 0 20px rgba(17, 119, 186, 0.45)"
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
              <ColorModeToggle display={{ base: "inline-flex", md: "none" }} w="full" />
              <CLink as={Link} to={APP_LINKS.internal.howItWorks} onClick={onClose} fontWeight="600" color={navColor}>
                How It Works
              </CLink>
              <CLink as={Link} to={APP_LINKS.internal.simulator} onClick={onClose} fontWeight="600" color={navColor}>
                Wellness Mirror®
              </CLink>
              <CLink as={Link} to={APP_LINKS.internal.whyVeeVee} onClick={onClose} fontWeight="600" color={navColor}>
                Features
              </CLink>
              <CLink as={Link} to={APP_LINKS.internal.testimonials} onClick={onClose} fontWeight="600" color={navColor}>
                Testimonials
              </CLink>
              <CLink href={APP_LINKS.external.authenticatedConsole} isExternal onClick={onClose} fontWeight="700" color="accent.soft">
                Log in
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
        <Flex
          align={{ base: "center", md: "center" }}
          justify="space-between"
          direction={{ base: "column", md: "row" }}
          gap={{ base: 3, md: 0 }}
          fontSize="sm"
          textAlign={{ base: "center", md: "left" }}
        >
          <Text color={mutedText}>Copyright {new Date().getFullYear()} VeeVee Health</Text>
          <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 2, md: 4 }} align={{ base: "center", md: "flex-start" }}>
            <CLink href={APP_LINKS.external.authenticatedConsole} isExternal color={primaryText}>
              Log In
            </CLink>
            <CLink as={Link} to={APP_LINKS.internal.simulator} color={primaryText}>
              Wellness Mirror®
            </CLink>
            <CLink href={APP_LINKS.external.investors} isExternal color={primaryText}>
              Investor Info
            </CLink>
            <CLink as={Link} to={APP_LINKS.internal.terms} color={primaryText}>
              Terms &amp; Disclaimers
            </CLink>
          </Stack>
        </Flex>
      </Container>
    </Box>
  );
}

function ColorModeToggle({
  display,
  w,
  withDivider = false,
}: {
  display?: any;
  w?: any;
  withDivider?: boolean;
}) {
  const { colorMode, toggleColorMode } = useColorMode();
  const label = colorMode === "dark" ? "Switch to light mode" : "Switch to dark mode";
  const nextMode = colorMode === "dark" ? "light" : "dark";
  const isDark = colorMode === "dark";

  const onToggle = () => {
    toggleColorMode();
    const gtag = (window as any).gtag;
    if (typeof gtag === "function") {
      gtag("event", "theme_toggle", { mode: nextMode });
    }
  };

  return (
    <Flex
      align="center"
      gap={2}
      display={display}
      w={w}
      justify={w ? "space-between" : "flex-start"}
    >
      {withDivider && (
        <Box
          h="28px"
          w="1px"
          bg="border.default"
          opacity={0.9}
          mr={1}
        />
      )}
      <Text fontSize="xs" color="text.subtle" letterSpacing="0.04em">
        Theme
      </Text>
      <Switch
        isChecked={isDark}
        onChange={onToggle}
        colorScheme="blue"
        aria-label={label}
        title={label}
      />
    </Flex>
  );
}


