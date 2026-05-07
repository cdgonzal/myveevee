import { Suspense, lazy, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  IconButton,
  Image,
  Link as CLink,
  Stack,
  Switch,
  Text,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { trackCtaClick } from "./analytics/trackCtaClick";
import { trackEvent } from "./analytics/trackEvent";
import { trackPageView } from "./analytics/trackPageView";
import { usePageEngagement } from "./analytics/usePageEngagement";
import { useScrollDepth } from "./analytics/useScrollDepth";
import { APP_LINKS } from "./config/links";
import { applyRouteSeo } from "./seo/applyRouteSeo";
import { DEFAULT_ROUTE_SEO, ROUTE_SEO } from "./seo/routeMeta";

const Home = lazy(() => import("./pages/Home"));
const Features = lazy(() => import("./pages/Features"));
const Technology = lazy(() => import("./pages/Technology"));
const Simulator = lazy(() => import("./pages/Simulator"));
const Testimonials = lazy(() => import("./pages/Testimonials"));
const Caregivers = lazy(() => import("./pages/Caregivers"));
const MedicareGuidance = lazy(() => import("./pages/MedicareGuidance"));
const HospitalToHome = lazy(() => import("./pages/HospitalToHome"));
const Contact = lazy(() => import("./pages/Contact"));
const Terms = lazy(() => import("./pages/Terms"));
const SwcaBrief = lazy(() => import("./pages/SwcaBrief"));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AnalyticsLifecycle() {
  const { pathname, search } = useLocation();

  useScrollDepth(pathname);
  usePageEngagement(pathname);

  useEffect(() => {
    applyRouteSeo(ROUTE_SEO[pathname] ?? DEFAULT_ROUTE_SEO);

    const frameId = window.requestAnimationFrame(() => {
      trackPageView(pathname, search);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [pathname, search]);

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
  const { pathname } = useLocation();
  const isStandalonePage = pathname === APP_LINKS.internal.swcaBrief;
  const pageGradient = useColorModeValue(
    "linear(to-b, #FFFFFF, #9CE7FF)",
    "linear(to-b, surface.900, surface.800)"
  );

  return (
    <Flex minH="100vh" direction="column" bgGradient={pageGradient}>
      {!isStandalonePage && <Header />}
      <Box as="main" flex="1">
        <AnalyticsLifecycle />
        {isStandalonePage ? (
          <>
            <ScrollToTop />
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path={APP_LINKS.internal.swcaBrief} element={<SwcaBrief />} />
              </Routes>
            </Suspense>
          </>
        ) : (
          <Container maxW="6xl" py={{ base: 8, md: 12 }}>
            <ScrollToTop />
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path={APP_LINKS.internal.home} element={<Home />} />
                <Route path={APP_LINKS.internal.whyVeeVee} element={<Features />} />
                <Route path={APP_LINKS.internal.technology} element={<Technology />} />
                <Route path={APP_LINKS.internal.simulator} element={<Simulator />} />
                <Route path={APP_LINKS.internal.testimonials} element={<Testimonials />} />
                <Route path={APP_LINKS.internal.caregivers} element={<Caregivers />} />
                <Route path={APP_LINKS.internal.medicare} element={<MedicareGuidance />} />
                <Route path={APP_LINKS.internal.hospitalToHome} element={<HospitalToHome />} />
                <Route path={APP_LINKS.internal.contact} element={<Contact />} />
                <Route path={APP_LINKS.internal.terms} element={<Terms />} />
                <Route path={APP_LINKS.internal.swcaBrief} element={<SwcaBrief />} />
              </Routes>
            </Suspense>
          </Container>
        )}
      </Box>
      {!isStandalonePage && <Footer />}
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

  const trackNavClick = (
    ctaName: string,
    ctaText: string,
    destinationUrl: string,
    destinationType: "internal" | "external",
    placement: string
  ) => {
    trackCtaClick({
      ctaName,
      ctaText,
      placement,
      destinationType,
      destinationUrl,
    });
  };

  const handleDrawerOpen = () => {
    trackEvent("nav_menu_open", { placement: "header_mobile" });
    onOpen();
  };

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
              onClick={() =>
                trackNavClick("header_logo", "VeeVee", APP_LINKS.internal.home, "internal", "header_brand")
              }
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
              <HStack spacing={{ base: 3, md: 6 }} display={{ base: "none", md: "flex" }}>
                <CLink
                  as={Link}
                  to={APP_LINKS.internal.whyVeeVee}
                  color={navColor}
                  fontWeight="600"
                  onClick={() =>
                    trackNavClick("header_features", "Features", APP_LINKS.internal.whyVeeVee, "internal", "header_nav")
                  }
                >
                  Features
                </CLink>
                <CLink
                  as={Link}
                  to={APP_LINKS.internal.simulator}
                  color={navColor}
                  fontWeight="600"
                  onClick={() =>
                    trackNavClick("header_simulator", "VeeVee Simulator", APP_LINKS.internal.simulator, "internal", "header_nav")
                  }
                >
                  VeeVee Simulator®
                </CLink>
                <CLink
                  as={Link}
                  to={APP_LINKS.internal.testimonials}
                  color={navColor}
                  fontWeight="600"
                  onClick={() =>
                    trackNavClick("header_testimonials", "Testimonials", APP_LINKS.internal.testimonials, "internal", "header_nav")
                  }
                >
                  Testimonials
                </CLink>
                <CLink
                  as={Link}
                  to={APP_LINKS.internal.technology}
                  color={navColor}
                  fontWeight="600"
                  onClick={() =>
                    trackNavClick("header_technology", "Tech", APP_LINKS.internal.technology, "internal", "header_nav")
                  }
                >
                  Tech
                </CLink>
              </HStack>

              <ColorModeToggle display={{ base: "none", md: "inline-flex" }} withDivider />

              <Button
                as="a"
                href={APP_LINKS.external.authenticatedConsole}
                size="sm"
                borderRadius="full"
                fontWeight="700"
                px={{ base: 4, md: 5 }}
                boxShadow="0 0 20px rgba(17, 119, 186, 0.45)"
                onClick={() =>
                  trackNavClick("header_login", "Log in", APP_LINKS.external.authenticatedConsole, "external", "header_nav")
                }
              >
                Log in
              </Button>

              <IconButton
                aria-label="Open navigation menu"
                icon={<Box as="span" fontSize="12px" lineHeight="1">Menu</Box>}
                variant="ghost"
                color={navColor}
                display={{ base: "inline-flex", md: "none" }}
                onClick={handleDrawerOpen}
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
              <CLink
                as={Link}
                to={APP_LINKS.internal.whyVeeVee}
                onClick={() => {
                  trackNavClick("drawer_features", "Features", APP_LINKS.internal.whyVeeVee, "internal", "mobile_drawer");
                  onClose();
                }}
                fontWeight="600"
                color={navColor}
              >
                Features
              </CLink>
              <CLink
                as={Link}
                to={APP_LINKS.internal.simulator}
                onClick={() => {
                  trackNavClick("drawer_simulator", "VeeVee Simulator", APP_LINKS.internal.simulator, "internal", "mobile_drawer");
                  onClose();
                }}
                fontWeight="600"
                color={navColor}
              >
                VeeVee Simulator®
              </CLink>
              <CLink
                as={Link}
                to={APP_LINKS.internal.testimonials}
                onClick={() => {
                  trackNavClick("drawer_testimonials", "Testimonials", APP_LINKS.internal.testimonials, "internal", "mobile_drawer");
                  onClose();
                }}
                fontWeight="600"
                color={navColor}
              >
                Testimonials
              </CLink>
              <CLink
                as={Link}
                to={APP_LINKS.internal.technology}
                onClick={() => {
                  trackNavClick("drawer_technology", "Tech", APP_LINKS.internal.technology, "internal", "mobile_drawer");
                  onClose();
                }}
                fontWeight="600"
                color={navColor}
              >
                Tech
              </CLink>
              <CLink
                href={APP_LINKS.external.authenticatedConsole}
                isExternal
                onClick={() => {
                  trackNavClick("drawer_login", "Log in", APP_LINKS.external.authenticatedConsole, "external", "mobile_drawer");
                  onClose();
                }}
                fontWeight="700"
                color="accent.soft"
              >
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

  const trackFooterClick = (
    ctaName: string,
    ctaText: string,
    destinationUrl: string,
    destinationType: "internal" | "external"
  ) => {
    trackCtaClick({
      ctaName,
      ctaText,
      placement: "footer",
      destinationType,
      destinationUrl,
    });
  };

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
            <CLink
              href={APP_LINKS.external.authenticatedConsole}
              isExternal
              color={primaryText}
              onClick={() =>
                trackFooterClick("footer_login", "Log In", APP_LINKS.external.authenticatedConsole, "external")
              }
            >
              Log In
            </CLink>
            <CLink
              as={Link}
              to={APP_LINKS.internal.technology}
              color={primaryText}
              onClick={() => trackFooterClick("footer_technology", "Technology", APP_LINKS.internal.technology, "internal")}
            >
              Technology
            </CLink>
            <CLink
              as={Link}
              to={APP_LINKS.internal.simulator}
              color={primaryText}
              onClick={() => trackFooterClick("footer_simulator", "VeeVee Simulator", APP_LINKS.internal.simulator, "internal")}
            >
              VeeVee Simulator®
            </CLink>
            <CLink
              href={APP_LINKS.external.investors}
              isExternal
              color={primaryText}
              onClick={() => trackFooterClick("footer_investor_info", "Investor Info", APP_LINKS.external.investors, "external")}
            >
              Investor Info
            </CLink>
            <CLink
              as={Link}
              to={APP_LINKS.internal.contact}
              color={primaryText}
              onClick={() => trackFooterClick("footer_contact", "Contact & Press", APP_LINKS.internal.contact, "internal")}
            >
              Contact &amp; Press
            </CLink>
            <CLink
              as={Link}
              to={APP_LINKS.internal.terms}
              color={primaryText}
              onClick={() => trackFooterClick("footer_terms", "Terms & Disclaimers", APP_LINKS.internal.terms, "internal")}
            >
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
    trackEvent("theme_toggle", { mode: nextMode });
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
