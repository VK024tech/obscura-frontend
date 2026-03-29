"use client";

import { OBSCURA_CONTRACT_ADDRESS, OBSCURA_ABI } from "@/lib/contracts.info";
import { findReceiverDeposit } from "@/lib/findDeposit";
import { generateWithdrawProof, formatProof } from "@/lib/generateProof";
import { publicClient } from "@/lib/viemClient";

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
  const [error, setError] = useState("");
  const [requiredChainId, setRequiredChainId] = useState<number | null>(null);
  const [withdrawingIndex, setWithdrawingIndex] = useState<number | null>(null);
  const [allCommitments, setAllCommitments] = useState<bigint[]>([]);
  const [successTxHash, setSuccessTxHash] = useState<`0x${string}` | null>(
    null,
  );
  const [txCopied, setTxCopied] = useState(false);
  const { writeContractAsync } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const { address } = useAccount();
  const chainId = useChainId();

  const copyTxHash = () => {
    if (!successTxHash) return;
    navigator.clipboard.writeText(successTxHash);
    setTxCopied(true);
    setTimeout(() => setTxCopied(false), 2000);
  };

  async function scanDeposits() {
    if (!privateKey) {
      setError("Enter receiver private key");
      return;
    }

    setLoading(true);
    setError("");
    setRequiredChainId(null);
    try {
      const { userDeposits, allCommitments } =
        await findReceiverDeposit(
          OBSCURA_CONTRACT_ADDRESS as `0x${string}`,
          privateKey,
          chainId,
        );

      setDeposits(userDeposits);
      setAllCommitments(allCommitments);

      if (userDeposits.length === 0) {
        setError("No deposits found for this private key");
      }
    } catch (err: any) {
      const errorMsg = err?.message || "Scan failed";
      setError(errorMsg);

      if (err instanceof Error && err.message.includes("Incorrect Chain")) {
        const match = err.message.match(/chain (\d+)/);
        if (match) {
          setRequiredChainId(Number(match[1]));
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleWithdraw(dep: any, index: number) {
    if (!address) {
      alert("Connect wallet first");
      return;
    }

    try {
      setWithdrawingIndex(index);
      setError("");
      setSuccessTxHash(null);
      setTxCopied(false);

      const { getContractRoot } = await import("@/lib/generateProof");
      const currentRoot = await getContractRoot();

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
          contractRoot: currentRoot,
        });

      const { a, b, c } = formatProof(proof);

      const txHash = await writeContractAsync({
        address: OBSCURA_CONTRACT_ADDRESS as `0x${string}`,
        abi: OBSCURA_ABI,
        functionName: "withdraw",
        args: [a, b, c, root, nullifierHash, address, address, 0, signalHash],
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash as `0x${string}`,
        timeout: 60_000, // 60 seconds
      });

      if (receipt.status === "success") {
        setDeposits((prev) => prev.filter((_, i) => i !== index));
        setSuccessTxHash(txHash as `0x${string}`);
      } else {
        setError(
          "❌ Withdrawal transaction failed. This could mean: 1) Proof verification failed, 2) Root not recognized, 3) Nullifier already used. Check contract state.",
        );
      }
    } catch (err: any) {
      const errorMsg = err?.message || err?.toString() || "Withdraw failed";

      if (errorMsg.includes("InvalidProof")) {
        setError(
          "❌ ZK proof verification failed. Merkle tree or signal hash mismatch.",
        );
      } else if (errorMsg.includes("Invalid_Root")) {
        setError(
          "❌ Root not recognized by contract. Try depositing again or refreshing.",
        );
      } else if (errorMsg.includes("NullifierHash_Already_Used")) {
        setError("❌ This deposit was already withdrawn.");
      } else {
        setError(`❌ Withdraw failed: ${errorMsg}`);
      }
    }

    setWithdrawingIndex(null);
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0c1118]/95 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
      <h1 className="text-3xl font-semibold tracking-tight text-white">
        Withdraw From Vault
      </h1>
      <p className="mt-2 max-w-xl text-base leading-relaxed text-[#7f8996]">
        Scan receiver notes with your private key and submit a private
        withdrawal proof.
      </p>

      {requiredChainId && (
        <div className="mt-4 rounded-xl border border-red-500/35 bg-[#2b0f16]/80 p-4">
          <p className="mb-3 text-xs text-[#ff9aac]">
            ⚠️ This deposit is on chain {requiredChainId}, but you're on chain{" "}
            {chainId}
          </p>
          <button
            onClick={() => switchChain?.({ chainId: requiredChainId })}
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/60"
          >
            Switch to Chain {requiredChainId}
          </button>
        </div>
      )}

      <div className="mt-7 space-y-5">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.11em] text-[#727d8c] uppercase">
            Receiver Private Key
          </p>
          <input
            type="text"
            placeholder="xx_xx..."
            className="w-full rounded-xl border border-white/5 bg-white/8 px-4 py-3 font-mono text-xs text-[#b3bcc7] outline-none placeholder:text-[#5f6874] focus-visible:border-emerald-300/50 focus-visible:ring-2 focus-visible:ring-emerald-300/20"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
          />
        </div>

        <button
          onClick={scanDeposits}
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-[#9bfad3] to-[#14f4ba] px-6 py-4 text-sm font-bold tracking-[0.18em] text-[#063126] uppercase shadow-[0_0_30px_rgba(20,244,186,0.35)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Scanning..." : "Scan Deposits"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/35 bg-[#2b0f16]/80 p-4 text-xs text-[#ff9aac]">
          {error}
        </div>
      )}

      <div className="mt-6">
        {deposits.length > 0 && (
          <div className="space-y-3">
            <h2 className="mb-3 text-xs font-semibold tracking-[0.11em] text-[#727d8c] uppercase">
              Your Deposits
            </h2>

            {deposits.map((dep, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/5 bg-gradient-to-br from-white/10 to-white/5 p-4"
              >
                <p className="break-all font-mono text-xs text-[#b3bcc7]">
                  Commitment: {dep.commitment}
                </p>
                <p className="mt-1 text-xs text-[#8f99a6]">
                  Leaf Index: {dep.leafIndex}
                </p>

                <button
                  onClick={() => handleWithdraw(dep, i)}
                  disabled={withdrawingIndex === i}
                  className="mt-3 rounded-lg bg-gradient-to-r from-[#9bfad3] to-[#14f4ba] px-4 py-2 text-xs font-bold text-[#063126] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {withdrawingIndex === i ? "Withdrawing..." : "Withdraw"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {successTxHash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
          <div className="w-full max-w-md rounded-2xl border border-emerald-400/25 bg-[#0f131b] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.55)]">
            <h3 className="text-lg font-semibold text-[#8af0cd]">
              Transaction Successful
            </h3>

            <p className="mt-4 text-xs font-semibold tracking-[0.11em] text-[#727d8c] uppercase">
              Transaction Hash
            </p>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/5 bg-white/8 px-3 py-2">
              <p className="min-w-0 flex-1 truncate font-mono text-xs text-[#b3bcc7]">
                {successTxHash}
              </p>
              <button
                onClick={copyTxHash}
                className="rounded-md p-2 text-[#9ca5af] transition hover:bg-white/10 hover:text-white"
                aria-label="Copy transaction hash"
              >
                {txCopied ? "Copied" : "⧉"}
              </button>
            </div>

            <button
              onClick={() => setSuccessTxHash(null)}
              className="mt-4 w-full rounded-lg bg-gradient-to-r from-[#9bfad3] to-[#14f4ba] px-4 py-2 text-xs font-bold tracking-[0.12em] text-[#063126] uppercase transition hover:brightness-105"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
