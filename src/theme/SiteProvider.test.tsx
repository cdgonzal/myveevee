import { Button, useColorMode } from "@chakra-ui/react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SiteProvider } from "./SiteProvider";

function ModeProbe() {
  const { colorMode, setColorMode, toggleColorMode } = useColorMode();
  return <>
    <output aria-label="Current appearance">{colorMode}</output>
    <Button onClick={() => setColorMode("light")}>Request light</Button>
    <Button onClick={toggleColorMode}>Toggle appearance</Button>
  </>;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe("Always-dark site appearance", () => {
  it.each(["light", "dark", "system"])("ignores a saved %s preference and mode changes", (preference) => {
    window.localStorage.setItem("chakra-ui-color-mode", preference);
    render(<SiteProvider><ModeProbe /></SiteProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Request light" }));
    fireEvent.click(screen.getByRole("button", { name: "Toggle appearance" }));
    expect(screen.getByLabelText("Current appearance")).toHaveTextContent("dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.body).toHaveClass("chakra-ui-dark");
  });

  it("works with a light OS preference and unavailable browser storage", () => {
    vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
      matches: query.includes("prefers-color-scheme: light"), media: query,
      onchange: null, addListener: vi.fn(), removeListener: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
    })));
    const read = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Storage unavailable"); });
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Storage unavailable"); });
    render(<SiteProvider><ModeProbe /></SiteProvider>);
    expect(screen.getByLabelText("Current appearance")).toHaveTextContent("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(read).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });
});
