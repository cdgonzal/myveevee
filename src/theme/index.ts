// src/theme/index.ts
import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  colors: {
    brand: {
      50:  "#E1F5F5", // legacy light gradients (still usable)
      100: "#B3E5FC",
      200: "#81D4FA",
      300: "#4FC3F7", // primary blue
      400: "#29B6F6",
      900: "#333333",
    },
    // Neon-ish accent palette for CTAs & highlights
    accent: {
      100: "#B2FFE4",
      200: "#7BFFD0",
      300: "#3CFFB8",
      400: "#00F5A0", // primary CTA
      500: "#00D48C",
    },
    surface: {
      900: "#050816", // page background
      800: "#070B1F", // cards / sections
    },
  },
  fonts: {
    body: `"Inter", system-ui, Avenir, Helvetica, Arial, sans-serif`,
    heading: `"Inter", system-ui, Avenir, Helvetica, Arial, sans-serif`,
  },
  styles: {
    global: {
      "html, body, #root": { height: "100%" },
      body: {
        bg: "surface.900",
        color: "whiteAlpha.900",
      },
      a: {
        fontWeight: 800,
        textDecoration: "none",
        color: "accent.300",
        _hover: { color: "accent.400" },
      },
    },
  },
  components: {
    Button: {
      baseStyle: { borderRadius: "999px", fontWeight: 600 },
      variants: {
        solid: {
          bg: "accent.400",
          color: "black",
          _hover: { bg: "accent.300" },
          _active: { bg: "accent.500" },
          _focusVisible: {
            boxShadow: "0 0 0 3px var(--chakra-colors-accent-200)",
          },
        },
        outline: {
          border: "1px solid",
          borderColor: "accent.400",
          color: "accent.300",
          _hover: { bg: "whiteAlpha.100" },
        },
      },
      defaultProps: { variant: "solid" },
    },
    Card: {
      baseStyle: {
        container: {
          bg: "surface.800",
          borderRadius: "16px",
          p: 6,
          boxShadow: "lg",
          border: "1px solid",
          borderColor: "whiteAlpha.200",
        },
      },
    },
  },
});
