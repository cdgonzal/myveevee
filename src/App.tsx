import { Box, Container, Flex, HStack, Link as CLink, Text } from "@chakra-ui/react";
import { Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";

export default function App() {
  return (
    <Flex minH="100vh" direction="column" bgGradient="linear(180deg, brand.50, white)">
      <Header />
      <Box as="main" flex="1">
        <Container maxW="6xl" py={{ base: 8, md: 12 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Container>
      </Box>
      <Footer />
    </Flex>
  );
}

function Header() {
  return (
    <Box as="header" borderBottom="1px solid" borderColor="brand.200" bg="whiteAlpha.70" backdropFilter="saturate(120%) blur(6px)">
      <Container maxW="6xl" py="3">
        <Flex align="center" justify="space-between">
          <Text fontWeight="800">VeeVee</Text>
          <HStack spacing="6">
            <CLink as={Link} to="/">Home</CLink>
            <CLink as={Link} to="/how-it-works">How it works</CLink>
            <CLink as={Link} to="/contact">Contact</CLink>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}

function Footer() {
  return (
    <Box as="footer" borderTop="1px solid" borderColor="brand.200" bg="whiteAlpha.70" backdropFilter="saturate(120%) blur(6px)">
      <Container maxW="6xl" py="3">
        <Flex align="center" justify="space-between" fontSize="sm">
          <Text>© 2025 VeeVee Health</Text>
          <HStack spacing="4">
            <CLink href="https://veevee.io" isExternal>Log in</CLink>
            <CLink href="https://investveevee.com" isExternal>For investors</CLink>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
