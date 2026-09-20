import { Box, Image, type BoxProps } from "@chakra-ui/react";
import { CAMPAIGN_ART } from "../theme/campaign";

type CampaignSceneProps = BoxProps & {
  subject: "input" | "simulation" | "results";
  treatment?: "luminous" | "shadow" | "home";
  priority?: boolean;
};

const descriptions = {
  input: "Theo leans forward with his hands on his knees in discomfort while his concerned digital Health Twin reaches out to help",
  simulation: "Nia’s digital Health Twin seated on a faceted stool in a futuristic living room, resting her chin on her hand in thought",
  results: "Nia’s digital Health Twin gesturing toward the next step",
};

const dimensions = { input: [1536, 1024], simulation: [1254, 1254], results: [1024, 1536] } as const;

/** Artwork stays separate from copy; contain and padding preserve each complete pose. */
export function CampaignScene({ subject, treatment = "luminous", priority = false, ...props }: CampaignSceneProps) {
  const src = CAMPAIGN_ART[subject];
  const [width, height] = dimensions[subject];
  const srcSet = [384, 768].map((size) => `${src.replace(/\.webp$/, `-${size}.webp`)} ${size}w`)
    .concat(`${src} ${width}w`).join(", ");
  return (
    <Box bg="surface.900" backgroundImage={`url("${CAMPAIGN_ART[treatment]}")`}
      backgroundSize="cover" backgroundPosition={treatment === "home" ? "center bottom" : "center"} backgroundRepeat="no-repeat"
      display="flex" alignItems="center" justifyContent="center" p="6%" {...props}>
      <Image ignoreFallback src={src} alt={descriptions[subject]}
        srcSet={srcSet} sizes="(min-width: 1280px) 290px, (min-width: 768px) 28vw, 88vw"
        width={width} height={height}
        w="100%" h="100%" minH={0} objectFit="contain" objectPosition={treatment === "home" ? "right bottom" : "center"}
        loading={priority ? "eager" : "lazy"} {...{ fetchpriority: priority ? "high" : "auto" }} decoding="async" />
    </Box>
  );
}
