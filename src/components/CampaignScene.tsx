import { Box, Image, type BoxProps } from "@chakra-ui/react";
import { CAMPAIGN_ART } from "../theme/campaign";

type CampaignSceneProps = BoxProps & {
  subject: "input" | "simulation" | "results";
  treatment?: "luminous" | "shadow";
  priority?: boolean;
};

const descriptions = {
  input: "Theo leans forward with his hands on his knees in discomfort while his concerned digital Health Twin reaches out to help",
  simulation: "Nia’s digital Health Twin considering the possibilities",
  results: "Nia’s digital Health Twin gesturing toward the next step",
};

/** Artwork stays separate from copy; contain and padding preserve each complete pose. */
export function CampaignScene({ subject, treatment = "luminous", priority = false, ...props }: CampaignSceneProps) {
  return (
    <Box bg="surface.900" backgroundImage={`url("${CAMPAIGN_ART[treatment]}")`}
      backgroundSize="cover" backgroundPosition="center" backgroundRepeat="no-repeat"
      display="flex" alignItems="center" justifyContent="center" p="6%" {...props}>
      <Image ignoreFallback src={CAMPAIGN_ART[subject]} alt={descriptions[subject]}
        srcSet={subject === "input" ? "/brand/2026/futuristic/theo-input-384.webp 384w, /brand/2026/futuristic/theo-input-768.webp 768w, /brand/2026/futuristic/theo-input.webp 1536w" : undefined}
        sizes={subject === "input" ? "(min-width: 1280px) 290px, (min-width: 768px) 28vw, 88vw" : undefined}
        width={subject === "input" ? 1536 : 1024} height={subject === "input" ? 1024 : 1536}
        w="100%" h="100%" minH={0} objectFit="contain"
        loading={priority ? "eager" : "lazy"} {...{ fetchpriority: priority ? "high" : "auto" }} decoding="async" />
    </Box>
  );
}
