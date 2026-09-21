import { Box, Image, type BoxProps } from "@chakra-ui/react";
import { CAMPAIGN_ART } from "../theme/campaign";

type CampaignSceneProps = BoxProps & {
  subject: "input" | "simulation" | "results";
  treatment?: "luminous" | "shadow" | "home" | "park" | "parkInput";
  priority?: boolean;
};

const descriptions = {
  input: "Theo braces his knees in discomfort in a futuristic city park while his concerned digital Health Twin reaches out to help",
  simulation: "Nia’s digital Health Twin seated in a futuristic living room, imagining a Vitruvian simulation of herself inside a thought cloud connected to her head by small dots",
  results: "Rosa’s digital Health Twin walking through a futuristic city park with her water-bottle bag, presenting a small three-milestone roadmap ending in a checkmark beside her open hand",
};

const dimensions = { input: [1536, 1024], simulation: [1254, 1254], results: [1024, 1536] } as const;

/** Artwork stays separate from copy; contain and padding preserve each complete pose. */
export function CampaignScene({ subject, treatment = "luminous", priority = false, ...props }: CampaignSceneProps) {
  const src = subject === "results" ? CAMPAIGN_ART.rosa : CAMPAIGN_ART[subject];
  const [width, height] = dimensions[subject];
  const srcSet = [384, 768].map((size) => `${src.replace(/\.webp$/, `-${size}.webp`)} ${size}w`)
    .concat(`${src} ${width}w`).join(", ");
  return (
    <Box bg="surface.900" backgroundImage={`url("${CAMPAIGN_ART[treatment]}")`}
      backgroundSize="cover" backgroundPosition={treatment === "home" ? "center 70%" : treatment === "park" || treatment === "parkInput" ? "center bottom" : "center"} backgroundRepeat="no-repeat"
      position="relative" display="flex" alignItems="center" justifyContent="center" p="6%" {...props}>
      {subject === "simulation" && (
        <Box position="absolute" left="3%" top={{ base: "5%", md: "22%", lg: "5%" }} w="41%" aspectRatio={1} pointerEvents="none" aria-hidden="true" color="accent.soft">
          <Box as="svg" viewBox="0 0 160 180" preserveAspectRatio="none" position="absolute" inset={0} w="100%" h="100%" overflow="visible">
            <path d="M 28 28 C 18 8 52 0 65 14 C 80 -1 110 2 117 20 C 140 15 157 34 148 53 C 165 70 160 93 148 101 C 164 120 152 147 133 148 C 129 170 103 179 86 167 C 67 183 43 173 38 159 C 12 168 -1 143 11 125 C -5 111 1 87 13 80 C -2 59 7 36 28 28 Z"
              fill="var(--chakra-colors-bg-canvas)" stroke="currentColor" strokeWidth="2" />
          </Box>
          <Box position="absolute" left="101%" top="28%" boxSize="10px" borderRadius="full" bg="bg.canvas" border="2px solid" borderColor="accent.soft" />
          <Box position="absolute" left="112%" top="20%" boxSize="6px" borderRadius="full" bg="accent.soft" />
          <Image ignoreFallback src={CAMPAIGN_ART.hologram} alt=""
            srcSet={`${CAMPAIGN_ART.hologram.replace(/\.webp$/, "-384.webp")} 384w, ${CAMPAIGN_ART.hologram.replace(/\.webp$/, "-768.webp")} 768w`}
            sizes="(min-width: 1280px) 120px, (min-width: 768px) 11vw, 32vw"
            width={1254} height={1254} w="80%" h="80%" objectFit="contain"
            position="absolute" left="10%" top="10%" loading={priority ? "eager" : "lazy"} decoding="async" />
        </Box>
      )}
      {subject === "results" && (
        <Box as="svg" viewBox="0 0 88 54" position="absolute" right="5%" top="8%" w="25%" maxW="84px"
          color="accent.soft" pointerEvents="none" aria-hidden="true" focusable="false">
          <path d="M 12 42 C 24 42 23 28 39 28 S 53 14 72 14" fill="none"
            stroke="var(--chakra-colors-bg-canvas)" strokeWidth="6" strokeLinecap="round" />
          <path d="M 12 42 C 24 42 23 28 39 28 S 53 14 72 14" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <g fill="var(--chakra-colors-bg-canvas)" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="42" r="4" />
            <circle cx="39" cy="28" r="4" />
            <circle cx="72" cy="14" r="10" />
          </g>
          <path d="m 67 14 3 3 6 -6" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
        </Box>
      )}
      <Image ignoreFallback src={src} alt={descriptions[subject]}
        srcSet={srcSet} sizes="(min-width: 1280px) 290px, (min-width: 768px) 28vw, 88vw"
        width={width} height={height}
        w={subject === "simulation" ? "80%" : "100%"} ml={subject === "simulation" ? "auto" : undefined}
        h="100%" minH={0} objectFit="contain" objectPosition={treatment === "home" ? "right bottom" : "center"}
        loading={priority ? "eager" : "lazy"} {...{ fetchpriority: priority ? "high" : "auto" }} decoding="async" />
    </Box>
  );
}
