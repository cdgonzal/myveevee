import { useEffect, useState } from "react";
import { Box, Button, Heading, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { trackCtaClick } from "../analytics/trackCtaClick";
import { trackEvent } from "../analytics/trackEvent";
import { APP_LINKS } from "../config/links";

export default function NotFoundPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [secondsRemaining, setSecondsRemaining] = useState(18);

  useEffect(() => {
    trackEvent("not_found_view", {
      missing_path: location.pathname,
      has_search: Boolean(location.search),
      referrer: document.referrer ? "present" : "none",
    });
  }, [location.pathname, location.search]);

  useEffect(() => {
    setSecondsRemaining(18);

    const countdownId = window.setInterval(() => {
      setSecondsRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    const redirectId = window.setTimeout(() => {
      trackEvent("not_found_auto_redirect", {
        missing_path: location.pathname,
        destination_url: APP_LINKS.internal.howItWorks,
      });
      navigate(APP_LINKS.internal.howItWorks, { replace: true });
    }, 18000);

    return () => {
      window.clearInterval(countdownId);
      window.clearTimeout(redirectId);
    };
  }, [location.pathname, navigate]);

  return (
    <Box minH={{ base: "58vh", md: "64vh" }} display="flex" alignItems="center">
      <Stack spacing={6} maxW="720px">
        <Stack spacing={3}>
          <Text fontSize="sm" fontWeight="900" letterSpacing="0.14em" textTransform="uppercase" color="brand.600">
            Page not found
          </Text>
          <Heading as="h1" fontSize={{ base: "4xl", md: "6xl" }} lineHeight="1" letterSpacing="0">
            Let&apos;s get you back to the clearest path.
          </Heading>
          <Text fontSize={{ base: "lg", md: "xl" }} color="text.muted" lineHeight="1.55">
            The page you requested is not available. The best next step is the short walkthrough of how VeeVee works and
            where to go from there.
          </Text>
          <Text color="text.muted" fontWeight="700">
            {secondsRemaining <= 10
              ? `Redirecting you in ${secondsRemaining}...`
              : "Redirecting you in 18 seconds."}
          </Text>
        </Stack>

        <Button
          as={RouterLink}
          to={APP_LINKS.internal.howItWorks}
          alignSelf="flex-start"
          size="lg"
          bg="brand.500"
          color="white"
          _hover={{ bg: "brand.600", textDecoration: "none" }}
          onClick={() =>
            trackCtaClick({
              ctaName: "not_found_to_how_it_works",
              ctaText: "See how VeeVee works",
              placement: "not_found_page",
              destinationType: "internal",
              destinationUrl: APP_LINKS.internal.howItWorks,
              extraParams: {
                missing_path: location.pathname,
              },
            })
          }
        >
          See how VeeVee works
        </Button>
      </Stack>
    </Box>
  );
}
