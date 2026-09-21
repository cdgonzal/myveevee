import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SiteProvider } from "../theme/SiteProvider";
import { ProviderInquiryForm } from "./ProviderInquiryForm";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
function fillForm() {
  vi.stubEnv("VITE_PROVIDER_INQUIRY_API_URL", "https://example.com/inquiry");
  render(<SiteProvider><MemoryRouter><ProviderInquiryForm /></MemoryRouter></SiteProvider>);
  fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: "Test Contact" } });
  fireEvent.change(screen.getByLabelText(/^Practice/), { target: { value: "Example Practice" } });
  fireEvent.change(screen.getByLabelText(/^Work email/), { target: { value: "person@example.com" } });
}

describe("Provider inquiry", () => {
  it("submits contact details and replaces the form with confirmation only after success", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, submissionId: "test-id" }) });
    vi.stubGlobal("fetch", fetch);
    fillForm();
    fireEvent.submit(screen.getByRole("form", { name: "Provider inquiry" }));
    expect(await screen.findByText("Thank you. Your inquiry has been sent.")).toBeInTheDocument();
    const payload = JSON.parse(fetch.mock.calls[0][1].body);
    expect(payload).toEqual(expect.objectContaining({ name: "Test Contact", practice: "Example Practice", email: "person@example.com", requestId: expect.any(String) }));
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
  });

  it("preserves fields on failure and reuses the request ID when retrying", async () => {
    const fetch = vi.fn().mockRejectedValueOnce(new TypeError("Network unavailable"))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, submissionId: "test-id" }) });
    vi.stubGlobal("fetch", fetch);
    fillForm();
    fireEvent.submit(screen.getByRole("form"));
    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn’t confirm your submission");
    expect(screen.getByLabelText(/^Work email/)).toHaveValue("person@example.com");
    await waitFor(() => expect(screen.getByRole("button", { name: "Send Inquiry" })).not.toBeDisabled());
    fireEvent.submit(screen.getByRole("form"));
    await screen.findByText("Thank you. Your inquiry has been sent.");
    expect(JSON.parse(fetch.mock.calls[0][1].body).requestId).toBe(JSON.parse(fetch.mock.calls[1][1].body).requestId);
  });

  it("does not show success for an invalid successful HTTP response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
    fillForm();
    fireEvent.submit(screen.getByRole("form"));
    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn’t send your inquiry");
    expect(screen.queryByText("Thank you. Your inquiry has been sent.")).not.toBeInTheDocument();
  });
});
