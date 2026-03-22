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
  it("renders the simplified simulator experience", () => {
    renderSimulator();
    expect(screen.getByText("Try a simple what-if health scenario.")).toBeInTheDocument();
    expect(screen.getByText("Pick a scenario")).toBeInTheDocument();
    expect(screen.getByText("Teaser for the app")).toBeInTheDocument();
  });

  it("runs a preview and shows simple next steps", async () => {
    renderSimulator();

    const severitySelect = screen.getByLabelText("How does it feel?");
    fireEvent.change(severitySelect, { target: { value: "high" } });

    const previewButton = await screen.findByRole("button", { name: "Update my outcome" });
    await waitFor(() => {
      expect(previewButton).toBeEnabled();
    });
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getByText("Predictions, actions, and next steps")).toBeInTheDocument();
    });
  });
});
