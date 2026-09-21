import { useRef, useState, type FormEvent } from "react";
import { Alert, AlertIcon, Box, Button, FormControl, FormLabel, Heading, Input, Link, SimpleGrid, Stack, Text, Textarea } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { trackEvent } from "../analytics/trackEvent";
import config from "../config/providerInquiry.json";

const EMPTY_FIELDS = { name: "", practice: "", email: "", phone: "", message: "", website: "" };

export function ProviderInquiryForm() {
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const request = useRef({ serialized: "", id: "" });
  const resultRef = useRef<HTMLDivElement>(null);
  const update = (field: keyof typeof fields, value: string) => setFields((current) => ({ ...current, [field]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true;
    setSending(true);
    setError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    try {
      const endpoint = import.meta.env.VITE_PROVIDER_INQUIRY_API_URL?.trim() || config.endpoint;
      if (!endpoint) throw new Error("The form is temporarily unavailable. Please email info@veevee.io.");
      const serialized = JSON.stringify(fields);
      if (request.current.serialized !== serialized) request.current = { serialized, id: crypto.randomUUID() };
      const response = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
        body: JSON.stringify({ ...fields, requestId: request.current.id }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.ok !== true || typeof payload.submissionId !== "string") {
        throw new Error(response.status === 429
          ? "Too many attempts. Please wait a few minutes before trying again."
          : response.status === 409
            ? "Your inquiry is still being processed. Please wait a minute and try again."
            : "We couldn’t send your inquiry. Please try again, or email info@veevee.io.");
      }
      setSent(true);
      setFields(EMPTY_FIELDS);
      // Contact details and free text never enter analytics.
      trackEvent("provider_inquiry_submitted", { page_path: "/contact", form_id: "provider_inquiry" });
      window.setTimeout(() => resultRef.current?.focus(), 0);
    } catch (failure) {
      setError(failure instanceof Error && failure.name !== "AbortError" && failure.name !== "TypeError"
        ? failure.message : "We couldn’t confirm your submission. Please try again, or email info@veevee.io.");
    } finally {
      window.clearTimeout(timeout);
      pending.current = false;
      setSending(false);
    }
  }

  if (sent) return (
    <Stack ref={resultRef} tabIndex={-1} role="status" spacing={4} p={{ base: 6, md: 8 }} bg="bg.surface" borderRadius="2xl">
      <Heading as="h2" size="lg">Thank you. Your inquiry has been sent.</Heading>
      <Text color="text.muted">Our team will follow up using the email address you provided.</Text>
      <Link as={RouterLink} to="/providers" color="accent.soft" textDecoration="underline">Back to VeeVee for Providers</Link>
    </Stack>
  );

  return (
    <Box as="form" aria-label="Provider inquiry" onSubmit={submit} p={{ base: 5, md: 8 }} bg="bg.surface" borderRadius="2xl">
      <Stack as="fieldset" disabled={sending} border={0} p={0} m={0} minW={0} spacing={5}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
          <FormControl isRequired><FormLabel htmlFor="inquiry-name">Name</FormLabel>
            <Input id="inquiry-name" name="name" autoComplete="name" maxLength={100} value={fields.name} onChange={(e) => update("name", e.target.value)} />
          </FormControl>
          <FormControl isRequired><FormLabel htmlFor="inquiry-practice">Practice or organization</FormLabel>
            <Input id="inquiry-practice" name="organization" autoComplete="organization" maxLength={160} value={fields.practice} onChange={(e) => update("practice", e.target.value)} />
          </FormControl>
          <FormControl isRequired><FormLabel htmlFor="inquiry-email">Work email</FormLabel>
            <Input id="inquiry-email" name="email" type="email" autoComplete="email" maxLength={254} value={fields.email} onChange={(e) => update("email", e.target.value)} />
          </FormControl>
          <FormControl><FormLabel htmlFor="inquiry-phone">Phone (optional)</FormLabel>
            <Input id="inquiry-phone" name="tel" type="tel" autoComplete="tel" maxLength={40} value={fields.phone} onChange={(e) => update("phone", e.target.value)} />
          </FormControl>
        </SimpleGrid>
        <FormControl><FormLabel htmlFor="inquiry-message">How can we help? (optional)</FormLabel>
          <Textarea id="inquiry-message" name="message" rows={4} maxLength={2000} aria-describedby="inquiry-privacy" value={fields.message} onChange={(e) => update("message", e.target.value)} />
        </FormControl>
        <Box position="absolute" left="-10000px" w="1px" h="1px" overflow="hidden" aria-hidden="true">
          <label htmlFor="inquiry-website">Leave this field empty</label>
          <input id="inquiry-website" name="website" tabIndex={-1} autoComplete="off" value={fields.website} onChange={(e) => update("website", e.target.value)} />
        </Box>
        <Text id="inquiry-privacy" color="text.muted" fontSize="sm">Please don’t include patient information. We’ll use your contact details to respond to your inquiry.</Text>
        {error && <Alert status="error" borderRadius="lg" role="alert"><AlertIcon />{error}</Alert>}
        <Button type="submit" size="lg" alignSelf={{ base: "stretch", sm: "flex-start" }} borderRadius="full" px={8} isLoading={sending} loadingText="Sending">
          Send Inquiry
        </Button>
        <Text color="text.muted" fontSize="sm">Prefer email? <Link href="mailto:info@veevee.io" color="accent.soft" textDecoration="underline">info@veevee.io</Link></Text>
      </Stack>
    </Box>
  );
}
