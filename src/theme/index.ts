import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  colors: {
    brand: {
      50:  "#E1F5F5", // gradient top
      100: "#B3E5FC",
      200: "#81D4FA",
      300: "#4FC3F7", // primary
      400: "#29B6F6", // hover/deep
      900: "#333333", // text
    },
  },
  fonts: {
    body: `"Inter", system-ui, Avenir, Helvetica, Arial, sans-serif`,
    heading: `"Inter", system-ui, Avenir, Helvetica, Arial, sans-serif`,
  },
  styles: {
    global: {
      "html, body, #root": { height: "100%" },
      body: { color: "brand.900" },
      a: {
        fontWeight: 800,
        textDecoration: "none",
        color: "brand.400",
        _hover: { color: "brand.300" },
      },
    },
  },
  components: {
    Button: {
      baseStyle: { borderRadius: "8px", fontWeight: 600 },
      variants: {
        solid: {
          bg: "brand.300",
          color: "white",
          _hover: { bg: "brand.400" },
          _focusVisible: { boxShadow: "0 0 0 3px var(--chakra-colors-brand-200)" },
        },
        outline: {
          border: "1px solid",
          borderColor: "brand.300",
          color: "brand.400",
          _hover: { bg: "brand.100" },
        },
      },
      defaultProps: { variant: "solid" },
    },
    Card: {
      baseStyle: {
        container: {
          bg: "white",
          borderRadius: "10px",
          p: 6,
          boxShadow: "sm",
          border: "1px solid",
          borderColor: "brand.200",
        },
      },
    },
  },
});
