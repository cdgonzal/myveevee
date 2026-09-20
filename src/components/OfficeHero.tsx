import { Box, Container, Grid, Image } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { CAMPAIGN_ART } from "../theme/campaign";

export function OfficeHero({ children }: { children: ReactNode }) {
  return (
    <Box as="section" aria-label="Meet your Health Twin" bg="bg.canvas" position="relative" isolation="isolate">
      <Box as="picture" position="absolute" insetX={0} bottom={0} zIndex={-1}
        h={{ base: "324px", sm: "424px", md: "456px", lg: "100%" }}
        sx={{ maskImage: { base: "linear-gradient(to bottom, transparent, black 96px)", lg: "none" } }}>
        <source media="(max-width: 479px)" srcSet="/brand/2026/futuristic/future-office-mobile.webp" />
        <Image ignoreFallback src={CAMPAIGN_ART.office} alt="" w="full" h="full" objectFit="cover" objectPosition="center bottom" />
      </Box>
      <Container maxW="7xl" px={{ base: 4, md: 8, lg: 12 }}>
        <Grid templateColumns={{ base: "repeat(2, minmax(0, 1fr))", lg: "minmax(0, 1fr) minmax(0, 1.5fr) minmax(0, 1fr)" }}
          templateAreas={{ base: '"copy copy" "theo nia"', lg: '"theo copy nia"' }}
          gap={{ base: 4, lg: 6 }} alignItems="center" minH={{ lg: "680px" }}
          py={{ base: 6, md: 12 }}>
          <Box gridArea="copy" position="relative" isolation="isolate"
            p={{ base: 0, md: 7, lg: 8 }} maxW="lg" mx="auto" w="full"
            _before={{
              content: '""', position: "absolute", zIndex: -1, pointerEvents: "none",
              display: { base: "none", lg: "block" },
              insetX: "-144px", insetY: "-128px",
              background: "radial-gradient(ellipse closest-side, #030725 55%, rgba(3, 7, 37, 0.96) 68%, rgba(3, 7, 37, 0.72) 80%, rgba(3, 7, 37, 0.32) 90%, transparent 100%)",
            }}>
            {children}
          </Box>
          <Box gridArea="theo" position="relative" zIndex={1} h={{ base: "260px", sm: "360px", lg: "530px" }} py={4} alignSelf="end">
            <Image ignoreFallback src={CAMPAIGN_ART.theo} alt="Theo’s digital avatar in the Future Office"
              srcSet={avatarSrcSet("theo-results")} sizes="(min-width: 1280px) 325px, (min-width: 992px) 25vw, 45vw"
              width={1024} height={1536} w="full" h="full" minH={0} objectFit="contain" objectPosition="center bottom"
              loading="eager" decoding="async" {...{ fetchpriority: "high" }} />
          </Box>
          <Box gridArea="nia" position="relative" zIndex={1} h={{ base: "260px", sm: "360px", lg: "530px" }} py={4} alignSelf="end">
            <Image ignoreFallback src={CAMPAIGN_ART.results} alt="Nia’s digital avatar in the Future Office"
              srcSet={avatarSrcSet("nia-results")} sizes="(min-width: 1280px) 325px, (min-width: 992px) 25vw, 45vw"
              width={1024} height={1536} w="full" h="full" minH={0} objectFit="contain" objectPosition="center bottom"
              loading="eager" decoding="async" {...{ fetchpriority: "high" }} />
          </Box>
        </Grid>
      </Container>
    </Box>
  );
}

function avatarSrcSet(name: string) {
  const root = "/brand/2026/futuristic/";
  return `${root}${name}-384.webp 384w, ${root}${name}-768.webp 768w, ${root}${name}.webp 1024w`;
}
