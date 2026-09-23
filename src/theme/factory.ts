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
        50: "#9CE7FF",
        100: "#A4FFFF",
        200: "#00BFFF",
        300: "#0881B8",
        400: "#006FA2",
        500: "#1177BA",
        600: "#4865D9",
        700: "#192586",
        900: "#06254C",
      },
      accent: {
        100: "#9CE7FF",
        200: "#A4FFFF",
        300: "#1800FF",
        400: "#EA00FF",
        500: "#E26FFF",
      },
      surface: {
        900: "#030725",
        800: "#011E48",
        700: "#001A52",
      },
      status: {
        success: "#00FFE4",
        warning: "#E26FFF",
        error: "#B915CF",
      },
    },
    semanticTokens: {
      colors: {
        "bg.canvas": { default: "#FFFFFF", _dark: "surface.900" },
        "bg.surface": { default: "#FFFFFF", _dark: "brand.700" },
        "bg.elevated": { default: "#FFFFFF", _dark: "brand.700" },
        "bg.glass": { default: "#FFFFFF", _dark: "surface.900" },
        "text.primary": { default: "#000000", _dark: "#FFFFFF" },
        "text.muted": { default: "brand.900", _dark: "brand.50" },
        "text.subtle": { default: "brand.400", _dark: "brand.50" },
        "border.default": { default: "brand.50", _dark: "brand.700" },
        "accent.primary": { default: "brand.700", _dark: "brand.50" },
        "accent.soft": { default: "brand.400", _dark: "accent.100" },
        "accent.on": { default: "#FFFFFF", _dark: "surface.900" },
        "action.primary": { default: "brand.600", _dark: "brand.600" },
        "action.hover": { default: "brand.600", _dark: "brand.600" },
        "action.on": { default: "#FFFFFF", _dark: "#FFFFFF" },
        "state.success": { default: "status.success", _dark: "status.success" },
        "state.warning": { default: "status.warning", _dark: "status.warning" },
        "state.error": { default: "status.error", _dark: "status.error" },
      },
    },
    layerStyles: {
      headerFooter: {
        bg: "bg.glass",
        bgImage: "radial-gradient(ellipse at 10% 0%, rgba(66, 109, 226, 0.48), transparent 75%), radial-gradient(ellipse at 90% 100%, rgba(222, 151, 204, 0.34), transparent 75%)",
      },
    },
    fonts: {
      body: `"Inter", system-ui, Avenir, Helvetica, Arial, sans-serif`,
      heading: `"Inter", system-ui, Avenir, Helvetica, Arial, sans-serif`,
    },
    styles: {
      global: {
        "@font-face": {
          fontFamily: "Inter",
          src: 'url("/fonts/InterVariable.ttf") format("truetype")',
          fontStyle: "normal",
          fontWeight: "100 900",
          fontDisplay: "swap",
        },
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
            bg: "action.primary",
            color: "action.on",
            _hover: { bg: "action.hover", boxShadow: "inset 0 0 0 2px currentColor" },
            _active: { bg: "action.primary" },
            _focusVisible: {
              boxShadow: "0 0 0 3px var(--chakra-colors-brand-100)",
            },
          },
          outline: {
            border: "1px solid",
            borderColor: "accent.primary",
            color: "accent.soft",
            _hover: { bg: "brand.50", _dark: { bg: "brand.700" } },
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
