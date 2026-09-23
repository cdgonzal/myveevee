import { Box, Container, Grid, Image } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { CAMPAIGN_ART } from "../theme/campaign";

const HERO_GLOW = {
  base: [
    "radial-gradient(ellipse at 60% 65%, rgba(212, 121, 211, 0.28), transparent 60%)",
    "radial-gradient(ellipse at 32% 40%, rgba(103, 76, 224, 0.34), transparent 60%)",
    "radial-gradient(ellipse at 58% 25%, rgba(41, 88, 227, 0.38), transparent 65%)",
  ].join(", "),
  lg: [
    "radial-gradient(ellipse at 58% 65%, rgba(212, 121, 211, 0.48), transparent 44%)",
    "radial-gradient(ellipse at 34% 38%, rgba(103, 76, 224, 0.65), transparent 50%)",
    "radial-gradient(ellipse at 57% 27%, rgba(41, 88, 227, 0.72), transparent 52%)",
    "radial-gradient(ellipse closest-side, #111638 50%, rgba(17, 22, 56, 0.94) 66%, rgba(17, 22, 56, 0.50) 84%, transparent 100%)",
  ].join(", "),
};

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
            textShadow="-0.5px -0.5px 0 #000, 0.5px -0.5px 0 #000, -0.5px 0.5px 0 #000, 0.5px 0.5px 0 #000"
            _before={{
              content: '""', position: "absolute", zIndex: -1, pointerEvents: "none",
              insetX: { base: "-16px", lg: "-144px" },
              insetY: { base: "-24px", lg: "-128px" },
              background: HERO_GLOW,
              maskImage: "radial-gradient(ellipse closest-side, black 70%, transparent 100%)",
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
