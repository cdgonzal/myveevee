import { Box, Button, Heading, Stack, Text, Image, Card } from "@chakra-ui/react";
export default function Home() {
  return (
    <Box textAlign="center">
      <Stack spacing={4} align="center" maxW="3xl" mx="auto" py={{ base: 10, md: 16 }}>
        <Heading size={{ base: "xl", md: "2xl" }}>
          See yourself. Understand your health. Live better with VeeVee.
        </Heading>
        <Text fontSize={{ base: "md", md: "lg" }}>
          Your personal wellness companion—AI insights, simple check-ins, and a digital twin that grows with you.
        </Text>
        <Stack direction={{ base: "column", sm: "row" }} spacing={4} pt={2}>
          <Button as="a" href="/how-it-works">How it works</Button>
          <Button as="a" href="https://veevee.io" variant="outline">Member login</Button>
        </Stack>
        <Card>
          <Image src="/hero.png" alt="VeeVee app preview" borderRadius="md" />
        </Card>
      </Stack>
    </Box>
  );
}
