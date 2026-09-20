import { SiteProvider } from "./theme/SiteProvider";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { trackCtaClick } from "./analytics/trackCtaClick";

vi.mock("./analytics/trackCtaClick", () => ({ trackCtaClick: vi.fn() }));

function LocationProbe() {
  const { pathname, search, hash } = useLocation();
  return <output data-testid="location">{pathname}{search}{hash}</output>;
}

function renderSite(path = "/") {
  return render(
    <SiteProvider>
      <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
        <LocationProbe />
      </MemoryRouter>
    </SiteProvider>
  );
}

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  vi.mocked(trackCtaClick).mockClear();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Simplified marketing funnel", () => {
  it("takes a visitor from Home to the three-step promise and mobility example", async () => {
    renderSite();
    // Wait for the lazy page using a cheap text query before scanning roles.
    await screen.findByText("Your health, connected");
    const learnMore = await screen.findAllByRole("link", { name: "See How It Works" });
    fireEvent.click(learnMore[0]);
    expect(await screen.findByRole("heading", { level: 1, name: "More of the life you want." })).toBeInTheDocument();
    const steps = within(screen.getByRole("region", { name: "The three steps" }));
    expect(steps.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)).toEqual(["Input", "Simulate", "Results"]);
    expect(screen.getByRole("region", { name: "“I want the freedom to move again.”" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Create a Health Twin" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "https://veevee.io");
    expect(trackCtaClick).toHaveBeenCalledWith(expect.objectContaining({ destinationUrl: "/how-it-works", destinationType: "internal" }));
    expect(document.querySelector('a[href="/health-twin"]')).toBeNull();
    expect(document.querySelector('a[href="/simulator"]')).toBeNull();
  }, 15000);

  it("keeps navigation focused and sends provider interest to Contact", async () => {
    renderSite("/providers");
    await screen.findByText("Discuss a Partnership");
    fireEvent.click(await screen.findByRole("link", { name: "Discuss a Partnership" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Contact VeeVee for press, partnerships, and support." })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    const navigation = within(await screen.findByRole("navigation", { name: "Mobile navigation" }));
    expect(navigation.getAllByRole("link").map((link) => link.textContent)).toEqual(["Home", "How It Works", "For Providers"]);
    expect(screen.queryByRole("checkbox", { name: /Switch to .* mode/ })).not.toBeInTheDocument();
  }, 15000);

  it.each([
    ["/features", "/how-it-works"],
    ["/technology/", "/providers"],
    ["/testimonials", "/"],
    ["/hospital-value", "/providers"],
  ])("redirects %s while preserving campaign attribution", async (source, target) => {
    renderSite(`${source}?utm_source=campaign#details`);
    await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent(`${target}?utm_source=campaign#details`));
    await screen.findByRole("heading", { level: 1 });
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute("href", `https://myveevee.com${target}`);
  });
});
