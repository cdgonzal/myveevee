import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

export function createTheme() {
  return extendTheme({
    config,
    colors: {
      brand: {
        50: "#E1F5F5",
        100: "#B3E5FC",
        200: "#81D4FA",
        300: "#4FC3F7",
        400: "#29B6F6",
        900: "#333333",
      },
      accent: {
        100: "#B2FFE4",
        200: "#7BFFD0",
        300: "#3CFFB8",
        400: "#00F5A0",
        500: "#00D48C",
      },
      surface: {
        900: "#050816",
        800: "#070B1F",
      },
      status: {
        success: "#16A34A",
        warning: "#D97706",
        error: "#DC2626",
      },
    },
    semanticTokens: {
      colors: {
        "bg.canvas": { default: "gray.50", _dark: "surface.900" },
        "bg.surface": { default: "white", _dark: "surface.800" },
        "bg.elevated": { default: "white", _dark: "rgba(10, 14, 32, 0.95)" },
        "bg.glass": { default: "rgba(255, 255, 255, 0.78)", _dark: "rgba(5, 8, 22, 0.7)" },
        "text.primary": { default: "gray.900", _dark: "whiteAlpha.900" },
        "text.muted": { default: "gray.600", _dark: "whiteAlpha.700" },
        "text.subtle": { default: "gray.500", _dark: "whiteAlpha.600" },
        "border.default": { default: "blackAlpha.200", _dark: "whiteAlpha.200" },
        "accent.primary": { default: "accent.500", _dark: "accent.400" },
        "accent.soft": { default: "accent.400", _dark: "accent.300" },
        "accent.on": { default: "white", _dark: "black" },
        "state.success": { default: "status.success", _dark: "status.success" },
        "state.warning": { default: "status.warning", _dark: "status.warning" },
        "state.error": { default: "status.error", _dark: "status.error" },
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
          bg: "bg.canvas",
          color: "text.primary",
        },
        a: {
          fontWeight: 800,
          textDecoration: "none",
          color: "accent.soft",
          _hover: { color: "accent.primary" },
        },
      },
    },
    components: {
      Button: {
        baseStyle: { borderRadius: "999px", fontWeight: 600 },
        variants: {
          solid: {
            bg: "accent.primary",
            color: "accent.on",
            _hover: { bg: "accent.soft" },
            _active: { bg: "accent.primary" },
            _focusVisible: {
              boxShadow: "0 0 0 3px var(--chakra-colors-accent-200)",
            },
          },
          outline: {
            border: "1px solid",
            borderColor: "accent.primary",
            color: "accent.soft",
            _hover: { bg: "blackAlpha.50", _dark: { bg: "whiteAlpha.100" } },
          },
        },
        defaultProps: { variant: "solid" },
      },
      Card: {
        baseStyle: {
          container: {
            bg: "bg.surface",
            borderRadius: "16px",
            p: 6,
            boxShadow: "lg",
            border: "1px solid",
            borderColor: "border.default",
          },
        },
      },
    },
  });
}
