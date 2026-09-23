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
  it("offers direct Start links on both consumer pages while keeping How It Works available", async () => {
    renderSite();
    // Wait for the lazy page using a cheap text query before scanning roles.
    await screen.findByText("Your health, connected");
    const homeStart = screen.getByRole("link", { name: "Start Now" });
    expect(homeStart).toHaveAttribute("href", "https://veevee.io");
    expect(screen.getByRole("link", { name: "Start" })).toHaveAttribute("href", "https://veevee.io");
    homeStart.addEventListener("click", (event) => event.preventDefault(), { once: true });
    fireEvent.click(homeStart);
    expect(trackCtaClick).toHaveBeenCalledWith(expect.objectContaining({
      placement: "home_hero_start", ctaText: "Start Now", destinationUrl: "https://veevee.io", destinationType: "external", pagePath: "/",
    }));
    const learnMore = await screen.findAllByRole("link", { name: "See How It Works" });
    fireEvent.click(learnMore[0]);
    expect(await screen.findByRole("heading", { level: 1, name: "More of the life you want." })).toBeInTheDocument();
    const steps = within(screen.getByRole("region", { name: "The three steps" }));
    expect(steps.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)).toEqual(["Input", "Simulate", "Results"]);
    expect(screen.getByRole("region", { name: "“I want the freedom to move again.”" })).toBeInTheDocument();
    const howItWorksStarts = screen.getAllByRole("link", { name: "Start free" });
    expect(howItWorksStarts).toHaveLength(2);
    for (const link of howItWorksStarts) expect(link).toHaveAttribute("href", "https://veevee.io");
    howItWorksStarts[0].addEventListener("click", (event) => event.preventDefault(), { once: true });
    fireEvent.click(howItWorksStarts[0]);
    expect(trackCtaClick).toHaveBeenCalledWith(expect.objectContaining({
      placement: "how_it_works_steps_start", destinationUrl: "https://veevee.io", destinationType: "external", pagePath: "/how-it-works",
    }));
    expect(screen.queryByRole("link", { name: "Create a Health Twin" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Log in" })).not.toBeInTheDocument();
    expect(trackCtaClick).toHaveBeenCalledWith(expect.objectContaining({ destinationUrl: "/how-it-works", destinationType: "internal" }));
    expect(document.querySelector('a[href="/health-twin"]')).toBeNull();
    expect(document.querySelector('a[href="/simulator"]')).toBeNull();
  }, 15000);

  it("keeps navigation focused and sends provider interest to Contact", async () => {
    renderSite("/providers");
    const partnershipLinks = await screen.findAllByRole("link", { name: "Connect With Our Team" });
    expect(partnershipLinks).toHaveLength(2);
    for (const link of partnershipLinks) expect(link).toHaveAttribute("href", "/contact?topic=providers");
    expect(screen.getByRole("link", { name: "Start" })).toHaveAttribute("href", "https://veevee.io");
    expect(screen.queryByRole("link", { name: "Log in" })).not.toBeInTheDocument();
    fireEvent.click(partnershipLinks[0]);
    expect(trackCtaClick).toHaveBeenCalledWith(expect.objectContaining({
      placement: "providers_hero_contact", destinationUrl: "/contact?topic=providers", destinationType: "internal", pagePath: "/providers",
    }));
    expect(await screen.findByRole("heading", { level: 1, name: "Let’s talk about your practice." })).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "Provider inquiry" })).toBeInTheDocument();
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
