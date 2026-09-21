import { Box, Image, type BoxProps } from "@chakra-ui/react";
import { CAMPAIGN_ART } from "../theme/campaign";

type CampaignSceneProps = BoxProps & {
  subject: "input" | "simulation" | "results";
  treatment?: "luminous" | "shadow" | "home" | "park" | "parkInput";
  priority?: boolean;
};

const descriptions = {
  input: "Theo braces his knees in discomfort in a futuristic city park while his concerned digital Health Twin reaches out to help",
  simulation: "Nia’s digital Health Twin seated on a faceted stool in a futuristic living room, studying a miniature anatomical hologram to her left",
  results: "Rosa’s digital Health Twin walking through a futuristic city park with her water-bottle bag, extending an open hand toward the next step",
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
        <Box position="absolute" left="5%" bottom="12%" w="36%" h="50%" pointerEvents="none" aria-hidden="true">
          <Box position="absolute" left="15%" bottom="0" w="70%" h="12%" borderRadius="full"
            bg="accent.soft" opacity={0.3} filter="blur(10px)" />
          <Image ignoreFallback src={CAMPAIGN_ART.hologram} alt=""
            srcSet={`${CAMPAIGN_ART.hologram.replace(/\.webp$/, "-384.webp")} 384w, ${CAMPAIGN_ART.hologram.replace(/\.webp$/, "-768.webp")} 768w`}
            sizes="(min-width: 1280px) 120px, (min-width: 768px) 11vw, 32vw"
            width={1122} height={1402} w="100%" h="100%" objectFit="contain" objectPosition="center bottom"
            position="relative" loading={priority ? "eager" : "lazy"} decoding="async" />
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
