import { Box, Container, Grid, Image } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { CAMPAIGN_ART } from "../theme/campaign";

export function OfficeHero({ children }: { children: ReactNode }) {
  return (
    <Box as="section" aria-label="Meet your Health Twin" bg="bg.canvas"
      backgroundImage={`url("${CAMPAIGN_ART.office}")`} backgroundRepeat="no-repeat"
      backgroundSize={{ base: "auto 420px", lg: "cover" }} backgroundPosition="center bottom">
      <Container maxW="7xl" px={{ base: 4, md: 8, lg: 12 }}>
        <Grid templateColumns={{ base: "repeat(2, minmax(0, 1fr))", lg: "minmax(0, 1fr) minmax(0, 1.5fr) minmax(0, 1fr)" }}
          templateAreas={{ base: '"copy copy" "theo nia"', lg: '"theo copy nia"' }}
          gap={{ base: 4, lg: 6 }} alignItems="center" minH={{ lg: "680px" }}
          py={{ base: 8, md: 12 }}>
          <Box gridArea="copy" bg="bg.canvas" p={{ base: 4, md: 7 }} maxW="lg" mx="auto" w="full">
            {children}
          </Box>
          <Box gridArea="theo" h={{ base: "320px", sm: "400px", lg: "530px" }} py={4} alignSelf="end">
            <Image src={CAMPAIGN_ART.theo} alt="Theo’s digital avatar in the Future Office"
              width={1024} height={1536} w="full" h="full" minH={0} objectFit="contain" objectPosition="center bottom"
              loading="eager" decoding="async" {...{ fetchpriority: "high" }} />
          </Box>
          <Box gridArea="nia" h={{ base: "320px", sm: "400px", lg: "530px" }} py={4} alignSelf="end">
            <Image src={CAMPAIGN_ART.results} alt="Nia’s digital avatar in the Future Office"
              width={1024} height={1536} w="full" h="full" minH={0} objectFit="contain" objectPosition="center bottom"
              loading="eager" decoding="async" {...{ fetchpriority: "high" }} />
          </Box>
        </Grid>
      </Container>
    </Box>
  );
}
