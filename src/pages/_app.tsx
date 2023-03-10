import "@/styles/globals.css";

import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "react-query";

import { TracksContextProvider } from "../TracksContext";

export default function App({ Component, pageProps }: AppProps) {
  // Create a client
  const queryClient = new QueryClient();
  return (
    <SessionProvider session={pageProps.session}>
      <TracksContextProvider>
        <QueryClientProvider client={queryClient}>
          <ChakraProvider>
            <Component {...pageProps} />
          </ChakraProvider>
        </QueryClientProvider>
      </TracksContextProvider>
    </SessionProvider>
  );
}
