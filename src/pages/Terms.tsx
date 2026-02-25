import { Box, Heading, Stack, Text, useColorModeValue } from "@chakra-ui/react";

export default function Terms() {
  const pageGradient = useColorModeValue(
    "linear(to-b, #FFFFFF, #9CE7FF)",
    "linear(to-b, surface.900, surface.800)"
  );

  return (
    <Box
      as="main"
      minH="100vh"
      bgGradient={pageGradient}
      color="text.primary"
      py={{ base: 10, md: 20 }}
      px={{ base: 6, md: 10 }}
    >
      <Box maxW="4xl" mx="auto">
        <Heading as="h1" size={{ base: "lg", md: "xl" }} fontWeight="800" mb={6}>
          Terms &amp; Disclaimers
        </Heading>

        <Stack spacing={4} fontSize={{ base: "sm", md: "md" }} color="text.primary">
          <Text>
            Welcome to VeeVee. Before you dive in, here is what you need to know in plain English:
          </Text>

          <Text>
            Not a doctor. VeeVee gives you lifestyle tips, wellness prompts, and benefit reminders.
            We do not provide medical advice, diagnoses, or treatment, and using VeeVee does not make
            us your doctor. Always talk to a licensed healthcare professional for medical decisions.
          </Text>

          <Text>
            Wellness, not medicine. Everything in VeeVee is designed for general wellness and
            educational purposes. Think of us like a coach or guide, not a medical provider or device.
          </Text>

          <Text>
            Covered benefits are not guaranteed. If you see insurance perks, plan coverage, or
            discounts, those come from your insurer, employer, or a third-party vendor. VeeVee just
            helps surface them. We do not control or promise eligibility.
          </Text>

          <Text>
            AI is not perfect. Some suggestions come from artificial intelligence. That means
            they are probabilistic, not guaranteed accurate. Do not rely on them for health, financial,
            or legal decisions.
          </Text>

          <Text>
            Third parties run their own services. If you use a perk, product, or service from another
            company, you are dealing with them directly. VeeVee is not responsible for their actions,
            policies, or products.
          </Text>

          <Text>
            Your data. We take privacy seriously and follow our Privacy Policy, but no system is
            100% secure. We are not a HIPAA covered entity unless we have explicitly contracted with
            someone as such.
          </Text>

          <Text>
            Your choice, your risk. By using VeeVee, you accept that you are responsible for how you
            use the information and features we provide.
          </Text>

          <Text>
            Limits on our liability. If something goes wrong, our legal responsibility is limited,
            generally to $10.00 (ten USD dollars) or what you have paid us in the past year, whichever
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


