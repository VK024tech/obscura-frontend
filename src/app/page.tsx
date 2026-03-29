"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance, useChainId } from "wagmi";

import Deposit from "@/components/deposit";
import Withdraw from "@/components/withdraw";
import GenerateKeys from "@/components/generateKeys";

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    "deposit" | "withdraw" | "generateKeys"
  >("generateKeys");
  const chainId = useChainId();
  const { address } = useAccount();
  const { data: balance } = useBalance({
    address: address as `0x${string}`,
  });

  const chainStatus =
    chainId === 11155111
      ? "SEPOLIA STATUS"
      : chainId === 31337
        ? "ANVIL STATUS"
        : `CHAIN ${chainId}`;

  return (
    <div className="min-h-screen bg-[#05080d] text-[#e4fff5]">
      <header className="sticky top-0 z-40 border-b border-emerald-400/20 bg-[#05080d]/95 backdrop-blur">
        <div className="mx-auto flex h-20 w-full max-w-9xl items-center justify-between px-2 sm:px-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-wide text-[#7af7ce] sm:text-2xl">
              OBSCURA PROTOCOL
            </h1>
            <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-white/5 px-3 py-1 text-xs text-[#8f9ea8] sm:flex">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              {chainStatus}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {address && balance && (
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-right">
                <p className="text-[10px] font-semibold tracking-[0.14em] text-[#8f9ea8] uppercase">
                  Wallet Balance
                </p>
                <p className="text-sm leading-tight font-bold text-[#7af7ce]">
                  {Number(balance.formatted).toFixed()} {balance.symbol}
                </p>
              </div>
            )}
            <ConnectButton chainStatus="none" showBalance={false} />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-12 pt-8 sm:px-6">
        <div className="w-full max-w-xl rounded-xl border border-white/5 bg-[#0b1017] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setActiveTab("generateKeys")}
            className={`rounded-md px-4 py-3 text-sm font-semibold tracking-[0.12em] uppercase transition ${
              activeTab === "generateKeys"
                ? "bg-[#a7ffd8] text-[#0f2a22] shadow-[0_0_22px_rgba(137,255,208,0.6)]"
                : "bg-transparent text-[#8c939f] hover:text-[#bcc3cd]"
            }`}
          >
            Generate Keys
          </button>
          <button
            onClick={() => setActiveTab("deposit")}
            className={`rounded-md px-4 py-3 text-sm font-semibold tracking-[0.12em] uppercase transition ${
              activeTab === "deposit"
                ? "bg-[#a7ffd8] text-[#0f2a22] shadow-[0_0_22px_rgba(137,255,208,0.6)]"
                : "bg-transparent text-[#8c939f] hover:text-[#bcc3cd]"
            }`}
          >
            Deposit
          </button>

          <button
            onClick={() => setActiveTab("withdraw")}
            className={`rounded-md px-4 py-3 text-sm font-semibold tracking-[0.12em] uppercase transition ${
              activeTab === "withdraw"
                ? "bg-[#a7ffd8] text-[#0f2a22] shadow-[0_0_22px_rgba(137,255,208,0.6)]"
                : "bg-transparent text-[#8c939f] hover:text-[#bcc3cd]"
            }`}
          >
            Withdraw
          </button>
          </div>
        </div>

        <div className="mt-6 w-full max-w-xl">
          {activeTab === "generateKeys" && <GenerateKeys />}
          {activeTab === "deposit" && <Deposit />}
          {activeTab === "withdraw" && <Withdraw />}
        </div>
      </main>
    </div>
  );
}
