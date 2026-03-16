"use client";

import { OBSCURA_CONTRACT_ADDRESS } from "@/lib/contracts.info";
import { findReceiverDeposit } from "@/lib/findDeposit";
import { useState } from "react";

export default function WithdrawPage() {
  const [privateKey, setPrivateKey] = useState("");
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function scanDeposits() {
    if (!privateKey) {
      alert("Enter receiver private key");
      return;
    }

    setLoading(true);

    try {
      const results = await findReceiverDeposit(
        OBSCURA_CONTRACT_ADDRESS as `0x${string}`,
        privateKey,
      );
      setDeposits(results);
    } catch (err) {
      console.error(err);
      alert("Scan failed");
    }
    setLoading(false);
  }

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Withdraw</h1>

      <input
        type="text"
        placeholder="Receiver Private Key"
        className="border p-2 w-full mb-4"
        value={privateKey}
        onChange={(e) => setPrivateKey(e.target.value)}
      />

      <button
        onClick={scanDeposits}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {loading ? "Scanning..." : "Scan Deposits"}
      </button>

      <div className="mt-6">
        {deposits.length > 0 && (
          <div>
            <h2 className="font-semibold mb-3">Your Deposits</h2>

            {deposits.map((dep, i) => (
              <div key={i} className="border p-3 mb-2">
                <p>Commitment: {dep.commitment}</p>
                <p>Leaf Index: {dep.leafIndex}</p>
                <p>Secret: {dep.secret}</p>
                <p>Nullifier: {dep.nullifier}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
