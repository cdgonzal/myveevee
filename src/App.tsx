import { Suspense, lazy, useEffect, useLayoutEffect, useRef, type ComponentType } from "react";
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
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { trackCtaClick } from "./analytics/trackCtaClick";
import { trackEvent } from "./analytics/trackEvent";
import { trackPageView } from "./analytics/trackPageView";
import { usePageEngagement } from "./analytics/usePageEngagement";
import { useScrollDepth } from "./analytics/useScrollDepth";
import { APP_LINKS } from "./config/links";
import marketingRedirects from "./config/marketingRedirects.json";
import { applyRouteSeo } from "./seo/applyRouteSeo";
import { DEFAULT_ROUTE_SEO, NOT_FOUND_ROUTE_SEO, ROUTE_SEO } from "./seo/routeMeta";
import { trackSwcaCampaignEvent } from "./swca/campaignEvents";
import { CAMPAIGN_ART } from "./theme/campaign";

const LAZY_RELOAD_STORAGE_KEY = "myveevee:lazy-import-reload";

function lazyWithRetry<T extends ComponentType<any>>(importer: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      const module = await importer();
      window.sessionStorage.removeItem(LAZY_RELOAD_STORAGE_KEY);
      return module;
    } catch (error) {
      if (shouldReloadForLazyImport(error) && !window.sessionStorage.getItem(LAZY_RELOAD_STORAGE_KEY)) {
        window.sessionStorage.setItem(LAZY_RELOAD_STORAGE_KEY, "true");
        window.location.reload();
        return new Promise<never>(() => undefined);
      }

      throw error;
    }
  });
}

function shouldReloadForLazyImport(error: unknown) {
  if (typeof window === "undefined") return false;
  const message = error instanceof Error ? error.message : String(error);
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(message);
}

const Home = lazyWithRetry(() => import("./pages/Home"));
const HealthTwinFunnel = lazyWithRetry(() => import("./pages/HealthTwinFunnel"));
const AvatarPlaybackTest = lazyWithRetry(() => import("./pages/AvatarPlaybackTest"));
const Providers = lazyWithRetry(() => import("./pages/Providers"));
const HowItWorks = lazyWithRetry(() => import("./pages/HowItWorks"));
const Simulator = lazyWithRetry(() => import("./pages/Simulator"));
const Caregivers = lazyWithRetry(() => import("./pages/Caregivers"));
const MedicareGuidance = lazyWithRetry(() => import("./pages/MedicareGuidance"));
const HospitalToHome = lazyWithRetry(() => import("./pages/HospitalToHome"));
const Tools = lazyWithRetry(() => import("./pages/Tools"));
const Contact = lazyWithRetry(() => import("./pages/Contact"));
const Terms = lazyWithRetry(() => import("./pages/Terms"));
const NotFoundPage = lazyWithRetry(() => import("./pages/NotFoundPage"));
const SwcaBrief = lazyWithRetry(() => import("./pages/SwcaBrief"));
const SwcaProviderHub = lazyWithRetry(() => import("./swca/providerHub/SwcaProviderHub"));
const SwcaRewardsTeaser = lazyWithRetry(() => import("./swca/rewardsTeaser/SwcaRewardsTeaser"));
const SpineWellnessIntakeForm = lazyWithRetry(() => import("./swca/intakeForm/SpineWellnessIntakeForm"));
const SwcaRewardWheel = lazyWithRetry(() => import("./swca/rewardWheel/SwcaRewardWheel"));
const SwcaRewardCertificate = lazyWithRetry(() => import("./swca/certificate/SwcaRewardCertificate"));
const SwcaProfileFunnel = lazyWithRetry(() => import("./swca/profileFunnel/SwcaProfileFunnel"));
const SwcaProfileFunnelVisual = lazyWithRetry(() => import("./swca/profileFunnel/SwcaProfileFunnelVisual"));
const SwcaAdminDashboard = lazyWithRetry(() => import("./swca/admin/SwcaAdminDashboard"));
const TwinCardPage = lazyWithRetry(() => import("./pages/TwinCardPage"));
const TwinCardResultPage = lazyWithRetry(() => import("./pages/TwinCardResultPage"));
const TwinCardPersonalizePage = lazyWithRetry(() => import("./pages/TwinCardPersonalizePage"));
const TwinCardAdminPage = lazyWithRetry(() => import("./pages/TwinCardAdminPage"));
const TwinDashboardPage = lazyWithRetry(() => import("./pages/TwinDashboardPage"));

const PRIMARY_NAV_LINKS = [
  { label: "Home", to: APP_LINKS.internal.home, name: "home" },
  { label: "How It Works", to: APP_LINKS.internal.howItWorks, name: "how_it_works" },
  { label: "For Providers", to: APP_LINKS.internal.providers, name: "providers" },
];
const FOOTER_LINKS = [
  ...PRIMARY_NAV_LINKS,
  { label: "Contact", to: APP_LINKS.internal.contact, name: "contact" },
  { label: "Terms & Disclaimers", to: APP_LINKS.internal.terms, name: "terms" },
];

function MarketingRedirect({ to }: { to: string }) {
  const { search, hash } = useLocation();
  return <Navigate to={{ pathname: to, search, hash }} replace />;
}

function ScrollToTop() {
  const { hash, pathname, search } = useLocation();
  const previousLocation = useRef({ pathname, search });

  useLayoutEffect(() => {
    const pathChanged = previousLocation.current.pathname !== pathname || previousLocation.current.search !== search;
    previousLocation.current = { pathname, search };

    if (!pathChanged || hash) {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [hash, pathname, search]);

  return null;
}

function AnalyticsLifecycle() {
  const { pathname, search } = useLocation();

  useScrollDepth(pathname);
  usePageEngagement(pathname);

  useEffect(() => {
    const routeSeo = pathname.startsWith("/twin-card/result/")
      ? {
          title: "Your VeeVee Twin Card",
          description: "View your VeeVee Twin Card and continue to VeeVee beta access.",
          canonicalPath: pathname,
          robots: "noindex, nofollow, noarchive, nosnippet",
          ogType: "website" as const,
          ogImage: "https://myveevee.com/og/home.svg",
          twitterImage: "https://myveevee.com/og/home.svg",
        }
      : ROUTE_SEO[pathname] ?? (pathname === "/" ? DEFAULT_ROUTE_SEO : NOT_FOUND_ROUTE_SEO);
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
  const isFullWidthHome = useColorModeValue(false, pathname === APP_LINKS.internal.home);
  const isStandalonePage =
    pathname === APP_LINKS.internal.create ||
    pathname === APP_LINKS.internal.healthTwin ||
    pathname === APP_LINKS.internal.healthTwinCreate ||
    pathname === APP_LINKS.internal.swcaBrief ||
    pathname === APP_LINKS.internal.swcaHub ||
    pathname === APP_LINKS.internal.swcaRewards ||
    pathname === APP_LINKS.internal.swcaTeaserAlias ||
    pathname === APP_LINKS.internal.swcaIntake ||
    pathname === APP_LINKS.internal.swcaWheel ||
    pathname === APP_LINKS.internal.swcaCertificate ||
    pathname === APP_LINKS.internal.swcaFunnel ||
    pathname === APP_LINKS.internal.swcaFunnelVisual ||
    pathname === APP_LINKS.internal.swcaAdmin ||
    pathname === APP_LINKS.internal.twinCard ||
    pathname.startsWith("/twin-card/result/") ||
    pathname.startsWith("/twin-card/personalize/") ||
    pathname === APP_LINKS.internal.twinCardAdmin ||
    pathname === APP_LINKS.internal.twinDashboard;
  const pageGradient = useColorModeValue(
    "linear(to-b, #FFFFFF, #9CE7FF)",
    "none"
  );

  return (
    <Flex minH="100vh" direction="column" bg="bg.canvas" bgGradient={pageGradient}>
      <ScrollToTop />
      {!isStandalonePage && <Header />}
      <Box as="main" flex="1">
        <AnalyticsLifecycle />
        {isStandalonePage ? (
          <>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path={APP_LINKS.internal.swcaBrief} element={<SwcaBrief />} />
                <Route path={APP_LINKS.internal.create} element={<HealthTwinFunnel conversionOnly />} />
                <Route path={APP_LINKS.internal.healthTwin} element={<HealthTwinFunnel />} />
                <Route path={APP_LINKS.internal.healthTwinCreate} element={<HealthTwinFunnel conversionOnly />} />
                <Route path={APP_LINKS.internal.swcaHub} element={<SwcaProviderHub />} />
                <Route path={APP_LINKS.internal.swcaRewards} element={<SwcaRewardsTeaser />} />
                <Route path={APP_LINKS.internal.swcaTeaserAlias} element={<Navigate to={APP_LINKS.internal.swcaRewards} replace />} />
                <Route path={APP_LINKS.internal.swcaIntake} element={<SpineWellnessIntakeForm />} />
                <Route path={APP_LINKS.internal.swcaWheel} element={<SwcaRewardWheel />} />
                <Route path={APP_LINKS.internal.swcaCertificate} element={<SwcaRewardCertificate />} />
                <Route path={APP_LINKS.internal.swcaFunnel} element={<SwcaProfileFunnel />} />
                <Route path={APP_LINKS.internal.swcaFunnelVisual} element={<SwcaProfileFunnelVisual />} />
                <Route path={APP_LINKS.internal.swcaAdmin} element={<SwcaAdminDashboard />} />
                <Route path={APP_LINKS.internal.twinCard} element={<TwinCardPage />} />
                <Route path={APP_LINKS.internal.twinCardResult} element={<TwinCardResultPage />} />
                <Route path={APP_LINKS.internal.twinCardPersonalize} element={<TwinCardPersonalizePage />} />
                <Route path={APP_LINKS.internal.twinCardAdmin} element={<TwinCardAdminPage />} />
                <Route path={APP_LINKS.internal.twinDashboard} element={<TwinDashboardPage />} />
              </Routes>
            </Suspense>
          </>
        ) : (
          <Container maxW={isFullWidthHome ? "none" : "6xl"} px={isFullWidthHome ? 0 : undefined}
            py={isFullWidthHome ? 0 : { base: 8, md: 12 }}>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path={APP_LINKS.internal.home} element={<Home />} />
                <Route path={APP_LINKS.internal.create} element={<HealthTwinFunnel conversionOnly />} />
                <Route path={APP_LINKS.internal.healthTwin} element={<HealthTwinFunnel />} />
                <Route path={APP_LINKS.internal.healthTwinCreate} element={<HealthTwinFunnel conversionOnly />} />
                <Route path={APP_LINKS.internal.avatarPlaybackTest} element={<AvatarPlaybackTest />} />
                <Route path={APP_LINKS.internal.providers} element={<Providers />} />
                {marketingRedirects.map((redirect) => (
                  <Route key={redirect.source} path={redirect.source} element={<MarketingRedirect to={redirect.target} />} />
                ))}
                <Route path={APP_LINKS.internal.howItWorks} element={<HowItWorks />} />
                <Route path={APP_LINKS.internal.simulator} element={<Simulator />} />
                <Route path={APP_LINKS.internal.caregivers} element={<Caregivers />} />
                <Route path={APP_LINKS.internal.medicare} element={<MedicareGuidance />} />
                <Route path={APP_LINKS.internal.hospitalToHome} element={<HospitalToHome />} />
                <Route path={APP_LINKS.internal.tools} element={<Tools />} />
                <Route path={APP_LINKS.internal.contact} element={<Contact />} />
                <Route path={APP_LINKS.internal.terms} element={<Terms />} />
                <Route path={APP_LINKS.internal.swcaBrief} element={<SwcaBrief />} />
                <Route path={APP_LINKS.internal.swcaHub} element={<SwcaProviderHub />} />
                <Route path={APP_LINKS.internal.swcaRewards} element={<SwcaRewardsTeaser />} />
                <Route path={APP_LINKS.internal.swcaTeaserAlias} element={<Navigate to={APP_LINKS.internal.swcaRewards} replace />} />
                <Route path={APP_LINKS.internal.swcaIntake} element={<SpineWellnessIntakeForm />} />
                <Route path={APP_LINKS.internal.swcaWheel} element={<SwcaRewardWheel />} />
                <Route path={APP_LINKS.internal.swcaCertificate} element={<SwcaRewardCertificate />} />
                <Route path={APP_LINKS.internal.swcaFunnel} element={<SwcaProfileFunnel />} />
                <Route path={APP_LINKS.internal.swcaFunnelVisual} element={<SwcaProfileFunnelVisual />} />
                <Route path={APP_LINKS.internal.swcaAdmin} element={<SwcaAdminDashboard />} />
                <Route path={APP_LINKS.internal.twinCard} element={<TwinCardPage />} />
                <Route path={APP_LINKS.internal.twinCardResult} element={<TwinCardResultPage />} />
                <Route path={APP_LINKS.internal.twinCardPersonalize} element={<TwinCardPersonalizePage />} />
                <Route path={APP_LINKS.internal.twinCardAdmin} element={<TwinCardAdminPage />} />
                <Route path={APP_LINKS.internal.twinDashboard} element={<TwinDashboardPage />} />
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
  const { pathname } = useLocation();
  const headerBg = useColorModeValue("bg.glass", "bg.glass");
  const borderColor = useColorModeValue("border.default", "border.default");
  const navColor = useColorModeValue("text.primary", "text.primary");
  const menuButtonColor = useColorModeValue("text.primary", "white");
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

  const handleDrawerClose = () => {
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
              <HStack as="nav" aria-label="Main navigation" spacing={5} display={{ base: "none", md: "flex" }}>
                {PRIMARY_NAV_LINKS.map((item) => (
                  <CLink key={item.name} as={Link} to={item.to} fontSize="sm" fontWeight="700"
                    aria-current={pathname === item.to ? "page" : undefined}
                    color={pathname === item.to ? "accent.primary" : navColor}
                    onClick={() => trackNavClick(`header_${item.name}`, item.label, item.to, "internal", "header_nav")}>
                    {item.label}
                  </CLink>
                ))}
              </HStack>
              <ColorModeToggle display={{ base: "none", md: "inline-flex" }} withDivider />

              <Button
                as="a"
                href={APP_LINKS.external.authenticatedConsole}
                size="sm"
                borderRadius="full"
                fontWeight="700"
                px={{ base: 4, md: 5 }}
                variant="outline"
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
                display={{ base: "inline-flex", md: "none" }}
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
            <Stack as="nav" aria-label="Mobile navigation" spacing={5} mt={4}>
              {PRIMARY_NAV_LINKS.map((item) => (
                <CLink key={item.name} as={Link} to={item.to} fontWeight="700" fontSize="lg"
                  aria-current={pathname === item.to ? "page" : undefined}
                  onClick={() => {
                    trackNavClick(`drawer_${item.name}`, item.label, item.to, "internal", "mobile_drawer");
                    handleDrawerClose();
                  }}>{item.label}</CLink>
              ))}
              <ColorModeToggle display="inline-flex" w="full" />
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function Footer() {
  const footerBg = useColorModeValue("bg.glass", "bg.glass");
  const showCampaignLogo = useColorModeValue(false, true);
  return (
    <Box as="footer" borderTop="1px solid" borderColor="border.default" bg={footerBg}>
      <Container maxW="6xl" py={8}>
        <Stack spacing={5} align="center">
          {showCampaignLogo && <Image src={CAMPAIGN_ART.logo} alt="VeeVee" w="160px" h="160px" objectFit="contain" loading="lazy" />}
          <Flex as="nav" aria-label="Footer navigation" gap={{ base: 4, md: 6 }} wrap="wrap" justify="center">
            {FOOTER_LINKS.map((item) => (
              <CLink key={item.name} as={Link} to={item.to} fontSize="sm" color="text.muted"
                onClick={() => trackCtaClick({ ctaName: `footer_${item.name}`, ctaText: item.label,
                  placement: "footer", destinationType: "internal", destinationUrl: item.to })}>
                {item.label}
              </CLink>
            ))}
          </Flex>
          <Text fontSize="sm" color="text.muted">Copyright {new Date().getFullYear()} VeeVee Health</Text>
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
