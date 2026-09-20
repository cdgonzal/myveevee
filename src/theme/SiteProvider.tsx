import { ChakraProvider, DarkMode } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { theme } from "./index";

// The marketing site has one appearance, including returning visitors with a
// saved light preference. Do not read or depend on browser storage.
const darkModeManager = {
  type: "localStorage" as const,
  get: () => "dark" as const,
  set: () => {},
};

export function SiteProvider({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider theme={theme} colorModeManager={darkModeManager}>
      <DarkMode>{children}</DarkMode>
    </ChakraProvider>
  );
}
