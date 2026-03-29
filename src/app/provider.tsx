"use client";

import React from "react";
import { WagmiProvider } from "wagmi";
import { darkTheme, getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia, anvil } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const projectId = process.env.NEXT_PUBLIC_PROJECTID;

if (!projectId) {
  throw new Error("pojectId is required");
}

const config = getDefaultConfig({
  appName: "Obscura",
  projectId,
  chains: [anvil, sepolia, mainnet],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()} modalSize="wide">{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
