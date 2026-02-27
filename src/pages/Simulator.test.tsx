import { ChakraProvider } from "@chakra-ui/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Simulator from "./Simulator";
import { theme } from "../theme";

function renderSimulator() {
  return render(
    <ChakraProvider theme={theme}>
      <MemoryRouter>
        <Simulator />
      </MemoryRouter>
    </ChakraProvider>
  );
}

describe("Simulator page", () => {
  it("renders core Wellness Mirror sections", () => {
    renderSimulator();
    expect(screen.getByText("Wellness Mirror® Scenario Explorer")).toBeInTheDocument();
    expect(screen.getByText("Scenario input")).toBeInTheDocument();
    expect(screen.getByText("Under The Hood")).toBeInTheDocument();
  });

  it("runs a simulation from edited inputs", async () => {
    renderSimulator();

    const severitySelect = screen.getByLabelText("Symptom severity");
    fireEvent.change(severitySelect, { target: { value: "high" } });

    const runButton = screen.getByRole("button", { name: "Run simulation preview" });
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByText(/Risk score:/)).toBeInTheDocument();
    });
  });
});

