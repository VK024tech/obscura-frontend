"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import Deposit from "@/components/deposit";
import Withdraw from "@/components/withdraw";
import GenerateKeys from "@/components/generateKeys";

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    "deposit" | "withdraw" | "generateKeys"
  >("generateKeys");

  return (
    <main className="flex flex-col items-center gap-6 mt-20">
      <h1 className="text-3xl font-bold">Obscura</h1>

      <ConnectButton />

      <div className="flex gap-4 mt-6">
        <button
          onClick={() => setActiveTab("deposit")}
          className={`px-4 py-2 rounded ${
            activeTab === "deposit" ? "bg-black text-white" : "bg-gray-200"
          }`}
        >
          Deposit
        </button>

        <button
          onClick={() => setActiveTab("withdraw")}
          className={`px-4 py-2 rounded ${
            activeTab === "withdraw" ? "bg-black text-white" : "bg-gray-200"
          }`}
        >
          Withdraw
        </button>
        <button
          onClick={() => setActiveTab("generateKeys")}
          className={`px-4 py-2 rounded ${
            activeTab === "withdraw" ? "bg-black text-white" : "bg-gray-200"
          }`}
        >
          Generate Keys
        </button>
      </div>

      <div className="mt-6 w-full max-w-xl">
        {activeTab === "deposit" && <Deposit />}
        {activeTab === "withdraw" && <Withdraw />}
        {activeTab === "generateKeys" && <GenerateKeys />}
      </div>
    </main>
  );
}
