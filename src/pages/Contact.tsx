import { Box, Heading, Text, Link as CLink, Card, Stack } from "@chakra-ui/react";
import { APP_LINKS } from "../config/links";
export default function Contact() {
  return (
    <Box>
      <Heading mb={6}>Contact & Press</Heading>
      <Card>
        <Stack spacing={2}>
          <Text>For media inquiries, partnerships, or support:</Text>
          <Text><b>Email:</b> <CLink href="mailto:press@veevee.io">press@veevee.io</CLink></Text>
          <Text><b>Investors:</b> <CLink href={APP_LINKS.external.investors} isExternal>investveevee.com</CLink></Text>
        </Stack>
      </Card>
    </Box>
  );
}
