import { Box, SimpleGrid, Heading, Text, Card } from "@chakra-ui/react";
export default function HowItWorks() {
  return (
    <Box>
      <Heading mb={8}>How it works</Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Card><Heading size="md" mb={2}>AI Feed</Heading><Text>Your daily wellness feed surfaces tips, reminders, and insights based on your goals and activity.</Text></Card>
        <Card><Heading size="md" mb={2}>Check-Ins</Heading><Text>Simple questions create a focused “case” (sleep, stress, pain) that guides relevant content.</Text></Card>
        <Card><Heading size="md" mb={2}>Digital Twin</Heading><Text>A living picture of your health that grows over time, helping you notice patterns and make better choices.</Text></Card>
        <Card><Heading size="md" mb={2}>Security</Heading><Text>The app runs at <b>veevee.io</b> behind secure login. This site is only for public information.</Text></Card>
      </SimpleGrid>
    </Box>
  );
}
