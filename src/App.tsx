import { Suspense, lazy, useEffect, useState } from "react";
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
  SimpleGrid,
  Stack,
  Switch,
  Text,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { trackCtaClick } from "./analytics/trackCtaClick";
import { trackEvent } from "./analytics/trackEvent";
import { trackPageView } from "./analytics/trackPageView";
import { usePageEngagement } from "./analytics/usePageEngagement";
import { useScrollDepth } from "./analytics/useScrollDepth";
import { APP_LINKS } from "./config/links";
import { applyRouteSeo } from "./seo/applyRouteSeo";
import { DEFAULT_ROUTE_SEO, NOT_FOUND_ROUTE_SEO, ROUTE_SEO } from "./seo/routeMeta";
import { trackSwcaCampaignEvent } from "./swca/campaignEvents";

const Home = lazy(() => import("./pages/Home"));
const HealthTwinFunnel = lazy(() => import("./pages/HealthTwinFunnel"));
const AvatarPlaybackTest = lazy(() => import("./pages/AvatarPlaybackTest"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const HospitalValue = lazy(() => import("./pages/HospitalValue"));
const Features = lazy(() => import("./pages/Features"));
const Technology = lazy(() => import("./pages/Technology"));
const Simulator = lazy(() => import("./pages/Simulator"));
const Testimonials = lazy(() => import("./pages/Testimonials"));
const Caregivers = lazy(() => import("./pages/Caregivers"));
const MedicareGuidance = lazy(() => import("./pages/MedicareGuidance"));
const HospitalToHome = lazy(() => import("./pages/HospitalToHome"));
const Contact = lazy(() => import("./pages/Contact"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const SwcaBrief = lazy(() => import("./pages/SwcaBrief"));
const SwcaRewardsTeaser = lazy(() => import("./swca/rewardsTeaser/SwcaRewardsTeaser"));
const SpineWellnessIntakeForm = lazy(() => import("./swca/intakeForm/SpineWellnessIntakeForm"));
const SwcaRewardWheel = lazy(() => import("./swca/rewardWheel/SwcaRewardWheel"));
const SwcaRewardCertificate = lazy(() => import("./swca/certificate/SwcaRewardCertificate"));
const SwcaProfileFunnel = lazy(() => import("./swca/profileFunnel/SwcaProfileFunnel"));
const SwcaAdminDashboard = lazy(() => import("./swca/admin/SwcaAdminDashboard"));

type FooterNavLink = {
  label: string;
  ctaName: string;
  to?: string;
  href?: string;
  destinationType?: "internal" | "external";
};

const FOOTER_NAV_GROUPS: Array<{ title: string; links: FooterNavLink[] }> = [
  {
    title: "Explore",
    links: [
      { label: "Health Twin", to: APP_LINKS.internal.healthTwin, ctaName: "footer_health_twin" },
      { label: "How It Works", to: APP_LINKS.internal.howItWorks, ctaName: "footer_how_it_works" },
      { label: "Features", to: APP_LINKS.internal.whyVeeVee, ctaName: "footer_features" },
      { label: "Technology", to: APP_LINKS.internal.technology, ctaName: "footer_technology" },
      { label: "Testimonials", to: APP_LINKS.internal.testimonials, ctaName: "footer_testimonials" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Hospital Value", to: APP_LINKS.internal.hospitalValue, ctaName: "footer_hospital_value" },
      { label: "Caregiver Support", to: APP_LINKS.internal.caregivers, ctaName: "footer_caregivers" },
      { label: "Medicare Guidance", to: APP_LINKS.internal.medicare, ctaName: "footer_medicare" },
      { label: "Hospital to Home", to: APP_LINKS.internal.hospitalToHome, ctaName: "footer_hospital_to_home" },
    ],
  },
  {
    title: "Action",
    links: [
      {
        label: "Investor Info",
        href: APP_LINKS.external.investors,
        ctaName: "footer_investor_info",
        destinationType: "external",
      },
      {
        label: "Log In",
        href: APP_LINKS.external.authenticatedConsole,
        ctaName: "footer_login",
        destinationType: "external",
      },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact & Press", to: APP_LINKS.internal.contact, ctaName: "footer_contact" },
      { label: "Terms & Disclaimers", to: APP_LINKS.internal.terms, ctaName: "footer_terms" },
    ],
  },
];

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
    const routeSeo = ROUTE_SEO[pathname] ?? (pathname === "/" ? DEFAULT_ROUTE_SEO : NOT_FOUND_ROUTE_SEO);
    applyRouteSeo(routeSeo);

    const frameId = window.requestAnimationFrame(() => {
      trackPageView(pathname, search);
      if (pathname.startsWith("/swca/") && pathname !== APP_LINKS.internal.swcaAdmin) {
        trackSwcaCampaignEvent({
          eventName: "swca_page_view",
          pagePath: pathname,
          params: {
            search: search ? "present" : "none",
          },
        });
      }
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
  const isStandalonePage =
    pathname === APP_LINKS.internal.swcaBrief ||
    pathname === APP_LINKS.internal.swcaRewards ||
    pathname === APP_LINKS.internal.swcaTeaserAlias ||
    pathname === APP_LINKS.internal.swcaIntake ||
    pathname === APP_LINKS.internal.swcaWheel ||
    pathname === APP_LINKS.internal.swcaCertificate ||
    pathname === APP_LINKS.internal.swcaFunnel ||
    pathname === APP_LINKS.internal.swcaAdmin;
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
                <Route path={APP_LINKS.internal.swcaRewards} element={<SwcaRewardsTeaser />} />
                <Route path={APP_LINKS.internal.swcaTeaserAlias} element={<Navigate to={APP_LINKS.internal.swcaRewards} replace />} />
                <Route path={APP_LINKS.internal.swcaIntake} element={<SpineWellnessIntakeForm />} />
                <Route path={APP_LINKS.internal.swcaWheel} element={<SwcaRewardWheel />} />
                <Route path={APP_LINKS.internal.swcaCertificate} element={<SwcaRewardCertificate />} />
                <Route path={APP_LINKS.internal.swcaFunnel} element={<SwcaProfileFunnel />} />
                <Route path={APP_LINKS.internal.swcaAdmin} element={<SwcaAdminDashboard />} />
              </Routes>
            </Suspense>
          </>
        ) : (
          <Container maxW="6xl" py={{ base: 8, md: 12 }}>
            <ScrollToTop />
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path={APP_LINKS.internal.home} element={<Home />} />
                <Route path={APP_LINKS.internal.healthTwin} element={<HealthTwinFunnel />} />
                <Route path={APP_LINKS.internal.avatarPlaybackTest} element={<AvatarPlaybackTest />} />
                <Route path={APP_LINKS.internal.howItWorks} element={<HowItWorks />} />
                <Route path={APP_LINKS.internal.hospitalValue} element={<HospitalValue />} />
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
                <Route path={APP_LINKS.internal.swcaRewards} element={<SwcaRewardsTeaser />} />
                <Route path={APP_LINKS.internal.swcaTeaserAlias} element={<Navigate to={APP_LINKS.internal.swcaRewards} replace />} />
                <Route path={APP_LINKS.internal.swcaIntake} element={<SpineWellnessIntakeForm />} />
                <Route path={APP_LINKS.internal.swcaWheel} element={<SwcaRewardWheel />} />
                <Route path={APP_LINKS.internal.swcaCertificate} element={<SwcaRewardCertificate />} />
                <Route path={APP_LINKS.internal.swcaFunnel} element={<SwcaProfileFunnel />} />
                <Route path={APP_LINKS.internal.swcaAdmin} element={<SwcaAdminDashboard />} />
                <Route path="*" element={<NotFoundPage />} />
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
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const headerBg = useColorModeValue("bg.glass", "bg.glass");
  const borderColor = useColorModeValue("border.default", "border.default");
  const navColor = useColorModeValue("text.primary", "text.primary");
  const menuButtonColor = useColorModeValue("text.primary", "white");
  const drawerBg = useColorModeValue("white", "surface.900");
  const drawerPanelBg = useColorModeValue("rgba(17, 119, 186, 0.06)", "rgba(156, 231, 255, 0.08)");
  const drawerLinkColor = useColorModeValue("gray.600", "gray.400");
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
    setIsMoreOpen(false);
    onOpen();
  };

  const handleDrawerClose = () => {
    setIsMoreOpen(false);
    onClose();
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
                color={menuButtonColor}
                display="inline-flex"
                onClick={handleDrawerOpen}
              />
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Drawer placement="right" onClose={handleDrawerClose} isOpen={isOpen} size="xs">
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
                to={APP_LINKS.internal.healthTwin}
                onClick={() => {
                  trackNavClick("drawer_health_twin", "Health Twin", APP_LINKS.internal.healthTwin, "internal", "mobile_drawer");
                  handleDrawerClose();
                }}
                fontWeight="800"
                fontSize="lg"
                color={navColor}
              >
                Health Twin
              </CLink>

              <Button
                variant="ghost"
                justifyContent="space-between"
                px={0}
                fontWeight="800"
                color={navColor}
                onClick={() => {
                  const nextOpen = !isMoreOpen;
                  setIsMoreOpen(nextOpen);
                  trackEvent("nav_menu_more_toggle", { placement: "header_mobile", expanded: nextOpen });
                }}
              >
                <Text as="span">More</Text>
                <Text as="span" fontSize="sm" transform={isMoreOpen ? "rotate(180deg)" : "none"} transition="transform 160ms ease">
                  v
                </Text>
              </Button>

              {isMoreOpen ? (
                <Stack spacing={5} bg={drawerPanelBg} borderRadius="2xl" p={4}>
                  {FOOTER_NAV_GROUPS.map((group) => (
                    <Stack key={group.title} spacing={2.5}>
                      <Text fontSize="xs" fontWeight="900" letterSpacing="0.16em" textTransform="uppercase" color="text.muted">
                        {group.title}
                      </Text>
                      <Stack spacing={2}>
                        {group.links.map((drawerLink) => {
                          const destination = drawerLink.to ?? drawerLink.href ?? APP_LINKS.internal.home;
                          const destinationType = drawerLink.destinationType ?? "internal";

                          return (
                            <CLink
                              key={drawerLink.ctaName}
                              as={drawerLink.to ? Link : undefined}
                              to={drawerLink.to}
                              href={drawerLink.href}
                              isExternal={destinationType === "external"}
                              onClick={() => {
                                trackNavClick(
                                  drawerLink.ctaName.replace("footer_", "drawer_"),
                                  drawerLink.label,
                                  destination,
                                  destinationType,
                                  "mobile_drawer_more"
                                );
                                handleDrawerClose();
                              }}
                              fontSize="sm"
                              fontWeight="600"
                              color={drawerLinkColor}
                              _hover={{ color: "accent.soft", textDecoration: "none" }}
                            >
                              {drawerLink.label}
                            </CLink>
                          );
                        })}
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              ) : null}
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
  const mutedText = useColorModeValue("text.muted", "text.muted");
  const footerLinkColor = useColorModeValue("gray.600", "gray.400");
  const linkBorder = useColorModeValue("rgba(17, 119, 186, 0.18)", "rgba(156, 231, 255, 0.18)");

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
      <Container maxW="6xl" py={{ base: 8, md: 10 }}>
        <Stack spacing={6}>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={{ base: 6, md: 8 }}>
            {FOOTER_NAV_GROUPS.map((group) => (
              <Stack key={group.title} spacing={3} align={{ base: "center", sm: "flex-start" }}>
                <Text fontSize="xs" fontWeight="900" letterSpacing="0.16em" textTransform="uppercase" color={mutedText}>
                  {group.title}
                </Text>
                <Stack spacing={2.5} align={{ base: "center", sm: "flex-start" }}>
                  {group.links.map((footerLink) => {
                    const destination = footerLink.to ?? footerLink.href ?? APP_LINKS.internal.home;
                    const destinationType = footerLink.destinationType ?? "internal";

                    return (
                      <CLink
                        key={footerLink.ctaName}
                        as={footerLink.to ? Link : undefined}
                        to={footerLink.to}
                        href={footerLink.href}
                        isExternal={destinationType === "external"}
                        color={footerLinkColor}
                        fontSize="sm"
                        fontWeight="600"
                        lineHeight="1.2"
                        borderBottom="1px solid"
                        borderColor={linkBorder}
                        pb="1px"
                        _hover={{ color: "accent.soft", borderColor: "accent.soft", textDecoration: "none" }}
                        onClick={() => trackFooterClick(footerLink.ctaName, footerLink.label, destination, destinationType)}
                      >
                        {footerLink.label}
                      </CLink>
                    );
                  })}
                </Stack>
              </Stack>
            ))}
          </SimpleGrid>

          <Flex justify={{ base: "center", md: "space-between" }} align="center" fontSize="sm" color={mutedText}>
            <Text>Copyright {new Date().getFullYear()} VeeVee Health</Text>
          </Flex>
        </Stack>
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
