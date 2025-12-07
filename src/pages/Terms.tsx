// File: src/pages/Terms.tsx
// Version: 1.0 (2025-12-07)
// Purpose:
//   Plain-English Terms & Disclaimers page for VeeVee, using the exact legal
//   language provided by counsel (no rewording, no reordering).
//   This page is referenced from marketing surfaces as the place where users
//   can read the full plain-English overview.
// Future iterations (not yet implemented):
//   - Link to full formal Terms of Use and Privacy Policy documents.
//   - Add anchors / in-page navigation if the text grows.
//   - Surface last-updated date and versioning for legal tracking.

import { Box, Heading, Stack, Text } from "@chakra-ui/react";

export default function Terms() {
  return (
    <Box
      as="main"
      minH="100vh"
      bgGradient="linear(to-b, #050816, #070B1F)"
      color="whiteAlpha.900"
      py={{ base: 10, md: 20 }}
      px={{ base: 6, md: 10 }}
    >
      <Box maxW="4xl" mx="auto">
        <Heading
          as="h1"
          size={{ base: "lg", md: "xl" }}
          fontWeight="800"
          mb={6}
        >
          Terms &amp; Disclaimers (Plain English)
        </Heading>

        <Stack spacing={4} fontSize={{ base: "sm", md: "md" }} color="whiteAlpha.900">
          <Text>
            Welcome to VeeVee. Before you dive in, here’s what you need to know in plain English:
          </Text>

          <Text>
            Not a doctor. VeeVee gives you lifestyle tips, wellness prompts, and benefit reminders.
            We don’t provide medical advice, diagnoses, or treatment, and using VeeVee doesn’t make
            us your doctor. Always talk to a licensed healthcare professional for medical decisions.
          </Text>

          <Text>
            Wellness, not medicine. Everything in VeeVee is designed for general wellness and
            educational purposes. Think of us like a coach or guide, not a medical provider or device.
          </Text>

          <Text>
            Covered benefits aren’t guaranteed. If you see insurance perks, plan coverage, or
            discounts, those come from your insurer, employer, or a third-party vendor. VeeVee just
            helps surface them, we don’t control or promise eligibility.
          </Text>

          <Text>
            AI isn’t perfect. Some suggestions come from artificial intelligence. That means
            they’re probabilistic, not guaranteed accurate. Don’t rely on them for health, financial,
            or legal decisions.
          </Text>

          <Text>
            Third parties run their own show. If you use a perk, product, or service from another
            company, you’re dealing with them directly. VeeVee isn’t responsible for their actions,
            policies, or products.
          </Text>

          <Text>
            Your data. We take privacy seriously and follow our Privacy Policy, but no system is
            100% secure. We’re not a HIPAA “covered entity” unless we’ve explicitly contracted with
            someone as such.
          </Text>

          <Text>
            Your choice, your risk. By using VeeVee, you accept that you’re responsible for how you
            use the information and features we provide.
          </Text>

          <Text>
            Limits on our liability. If something goes wrong, our legal responsibility is limited,
            generally to $10.00 (ten USD dollars) or what you’ve paid us in the past year, whichever
            is greater.
          </Text>

          <Text>
            VeeVee is governed by Florida law. If you ever have a legal dispute with us, it will be
            resolved only in the courts located in Broward County, Florida, USA.
          </Text>
        </Stack>
      </Box>
    </Box>
  );
}
