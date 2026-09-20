import { Box, Image, type BoxProps } from "@chakra-ui/react";
import { CAMPAIGN_ART } from "../theme/campaign";

type CampaignSceneProps = BoxProps & {
  subject: "input" | "simulation" | "results";
  treatment?: "luminous" | "shadow";
  priority?: boolean;
};

const descriptions = {
  input: "Nia alongside her luminous digital Health Twin",
  simulation: "Nia’s digital Health Twin considering the possibilities",
  results: "Nia’s digital Health Twin gesturing toward the next step",
};

/** Artwork stays separate from copy; contain and padding preserve each complete pose. */
export function CampaignScene({ subject, treatment = "luminous", priority = false, ...props }: CampaignSceneProps) {
  return (
    <Box bg="surface.900" backgroundImage={`url("${CAMPAIGN_ART[treatment]}")`}
      backgroundSize="cover" backgroundPosition="center" backgroundRepeat="no-repeat"
      display="flex" alignItems="center" justifyContent="center" p="6%" {...props}>
      <Image src={CAMPAIGN_ART[subject]} alt={descriptions[subject]}
        width={subject === "input" ? 1536 : 1024} height={subject === "input" ? 1024 : 1536}
        w="100%" h="100%" minH={0} objectFit="contain"
        loading={priority ? "eager" : "lazy"} {...{ fetchpriority: priority ? "high" : "auto" }} decoding="async" />
    </Box>
  );
}
