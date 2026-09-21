import { Button, type ButtonProps } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import { trackCtaClick } from "../analytics/trackCtaClick";
import { APP_LINKS } from "../config/links";

type StartButtonProps = Omit<ButtonProps, "onClick"> & { placement: string };

export function StartButton({ placement, children = "Start free", ...props }: StartButtonProps) {
  const { pathname } = useLocation();
  return (
    <Button as="a" href={APP_LINKS.cta.getStarted} size="lg" minH="44px" borderRadius="full" {...props}
      onClick={() => trackCtaClick({
        ctaName: placement, ctaText: typeof children === "string" ? children : "Start free", placement,
        destinationType: "external", destinationUrl: APP_LINKS.cta.getStarted, pagePath: pathname,
      })}>
      {children}
    </Button>
  );
}
