"use client";

import { OBSCURA_CONTRACT_ADDRESS, OBSCURA_ABI } from "@/lib/contracts.info";
import { findReceiverDeposit } from "@/lib/findDeposit";
import { generateWithdrawProof, formatProof } from "@/lib/generateProof";

import { useState } from "react";
import {
  useWriteContract,
  useAccount,
  useChainId,
  useSwitchChain,
} from "wagmi";

export default function WithdrawPage() {
  const [privateKey, setPrivateKey] = useState("");
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [requiredChainId, setRequiredChainId] = useState<number | null>(null);
  const [withdrawingIndex, setWithdrawingIndex] = useState<number | null>(null);
  const [allCommitments, setAllCommitments] = useState<bigint[]>([]);
  const { writeContract } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const { address } = useAccount();
  const chainId = useChainId();

  async function scanDeposits() {
    if (!privateKey) {
      alert("Enter receiver private key");
      return;
    }

    setLoading(true);
    setRequiredChainId(null);
    try {
      const { userDeposits, allCommitments } = await findReceiverDeposit(
        OBSCURA_CONTRACT_ADDRESS as `0x${string}`,
        privateKey,
        chainId,
      );
      setDeposits(userDeposits);
      setAllCommitments(allCommitments);
    } catch (err) {
      console.error(err);

      if (err instanceof Error && err.message.includes("Incorrect Chain")) {
        const match = err.message.match(/chain (\d+)/);
        if (match) {
          setRequiredChainId(Number(match[1]));
        }
        setLoading(false);
        return;
      }
      alert("Scan failed");
    }

    setLoading(false);
  }

  async function handleWithdraw(dep: any, index: number) {
    try {
      setWithdrawingIndex(index);

      const { proof, root, nullifierHash, signalHash } =
        await generateWithdrawProof({
          commitments: allCommitments,
          leafIndex: dep.leafIndex,
          secret: dep.secret,
          nullifier: dep.nullifier,
          recipient: address,
          relayer: address,
          relayerFee: 0,
          chainId,
          contractAddress: OBSCURA_CONTRACT_ADDRESS,
        });

      const { a, b, c } = formatProof(proof);

      writeContract({
        address: OBSCURA_CONTRACT_ADDRESS as `0x${string}`,
        abi: OBSCURA_ABI,
        functionName: "withdraw",
        args: [a, b, c, root, nullifierHash, address, address, 0, signalHash],
      });
    } catch (err) {
      console.error(err);
      alert("Withdraw failed");
    }

    setWithdrawingIndex(null);
  }

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Withdraw</h1>

      {requiredChainId && (
        <div className="bg-red-100 border border-red-400 p-4 rounded mb-4">
          <p className="text-red-800 mb-3">
            ⚠️ This deposit is on chain {requiredChainId}, but you're on chain{" "}
            {chainId}
          </p>
          <button
            onClick={() => switchChain?.({ chainId: requiredChainId })}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Switch to Chain {requiredChainId}
          </button>
        </div>
      )}

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
              <div key={i} className="border p-3 mb-3 rounded">
                <p className="text-sm break-all">
                  Commitment: {dep.commitment}
                </p>
                <p>Leaf Index: {dep.leafIndex}</p>

                <button
                  onClick={() => handleWithdraw(dep, i)}
                  className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
                >
                  {withdrawingIndex === i ? "Withdrawing..." : "Withdraw"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
