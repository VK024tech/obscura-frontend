"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Deposit from "@/components/deposit";

export default function Home() {
  return (
    <main className="flex flex-col items-center gap-6 mt-20">
      <h1 className="text-3xl font-bold">Obscura</h1>

      <ConnectButton />

      <Deposit />
    </main>
  );
}
