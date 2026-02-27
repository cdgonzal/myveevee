import { ChakraProvider } from "@chakra-ui/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Simulator from "./Simulator";
import { theme } from "../theme";

function renderSimulator() {
  return render(
    <ChakraProvider theme={theme}>
      <MemoryRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Simulator />
      </MemoryRouter>
    </ChakraProvider>
  );
}

describe("Simulator page", () => {
  it("renders the simplified step-1 experience", () => {
    renderSimulator();
    expect(screen.getByText("Wellness Mirror® Scenario Explorer")).toBeInTheDocument();
    expect(screen.getByText("Step 1: Quick Check (4 inputs)")).toBeInTheDocument();
    expect(screen.getByText("Digital Twin Avatar (Placeholder)")).toBeInTheDocument();
  });

  it("runs preview and can expand to the full final report", async () => {
    renderSimulator();

    const severitySelect = screen.getByLabelText("Symptom severity");
    fireEvent.change(severitySelect, { target: { value: "high" } });

    const previewButton = screen.getByRole("button", { name: "Get preview" });
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getByText(/Risk score:/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Step 3: See full final report" }));
    expect(screen.getByText("Under The Hood")).toBeInTheDocument();
  });
});
