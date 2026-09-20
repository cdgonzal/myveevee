import { Box, Container, Grid, Image } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { CAMPAIGN_ART } from "../theme/campaign";

export function OfficeHero({ children }: { children: ReactNode }) {
  return (
    <Box as="section" aria-label="Meet your Health Twin" bg="bg.canvas"
      backgroundImage={`url("${CAMPAIGN_ART.office}")`} backgroundRepeat="no-repeat"
      backgroundSize={{ base: "auto 420px", md: "cover" }} backgroundPosition="center bottom">
      <Container maxW="7xl" px={{ base: 4, md: 8, lg: 12 }}>
        <Grid templateColumns={{ base: "minmax(0, 1fr)", md: "minmax(0, 0.9fr) minmax(0, 1.25fr)" }}
          gap={{ base: 4, md: 5, lg: 10 }} alignItems="center" minH={{ md: "620px", lg: "680px" }}
          py={{ base: 8, md: 12 }}>
          <Box bg="bg.canvas" p={{ base: 4, md: 7, lg: 9 }}>
            {children}
          </Box>
          <Grid templateColumns="repeat(2, minmax(0, 1fr))" alignItems="end" gap={{ base: 0, lg: 2 }}
            h={{ base: "320px", sm: "400px", md: "460px", lg: "530px" }} py={4}>
            <Image src={CAMPAIGN_ART.results} alt="Nia’s digital avatar in the Future Office"
              width={1024} height={1536} w="full" h="full" minH={0} objectFit="contain" objectPosition="center bottom"
              loading="eager" decoding="async" {...{ fetchpriority: "high" }} />
            <Image src={CAMPAIGN_ART.theo} alt="Theo’s digital avatar in the Future Office"
              width={1024} height={1536} w="full" h="full" minH={0} objectFit="contain" objectPosition="center bottom"
              loading="eager" decoding="async" {...{ fetchpriority: "high" }} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
