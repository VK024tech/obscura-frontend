"use client";

import {
  useChainId,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { OBSCURA_CONTRACT_ADDRESS, OBSCURA_ABI } from "@/lib/contracts.info";
import { useEffect, useState } from "react";
import { prepareDeposit } from "@/lib/deposit";

export default function Deposit() {
  const [receiverKey, setReceiverKey] = useState("");
  const [preparing, setPreparing] = useState(false);
  const [localError, setLocalError] = useState("");
  const [dismissedHash, setDismissedHash] = useState<`0x${string}` | null>(
    null,
  );
  const [txCopied, setTxCopied] = useState(false);

  const {
    writeContract,
    data: hash,
    isPending,
    isError,
    error: writeError,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: Boolean(hash),
    },
  });

  const chainId = useChainId();

  const errorMessage =
    localError || (isError && writeError ? writeError.message : "");
  const showSuccessPopup = Boolean(hash && isSuccess && dismissedHash !== hash);

  useEffect(() => {
    if (isSuccess && hash) {
      const timer = setTimeout(() => {
        setReceiverKey("");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, hash]);

  const copyTxHash = () => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setTxCopied(true);
    setTimeout(() => setTxCopied(false), 2000);
  };

  const handleDeposit = async () => {
    try {
      setLocalError("");
      setPreparing(true);
      setDismissedHash(null);
      setTxCopied(false);

      if (!receiverKey.trim()) {
        setLocalError("Receiver public key is required");
        setPreparing(false);
        return;
      }

      const { commitment, cid } = await prepareDeposit(receiverKey, chainId);
      setPreparing(false);

      writeContract({
        address: OBSCURA_CONTRACT_ADDRESS as `0x${string}`,
        abi: OBSCURA_ABI,
        functionName: "deposit",
        args: [commitment, cid],
        value: BigInt(1e18),
      });
    } catch (err: unknown) {
      setLocalError(
        err instanceof Error ? err.message : "Failed to prepare deposit",
      );
      setPreparing(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0c1118]/95 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
      <h1 className="text-3xl font-semibold tracking-tight text-white">
        Deposit To Vault
      </h1>
      <p className="mt-2 max-w-xl text-base leading-relaxed text-[#7f8996]">
        Encrypt a private note for the receiver and submit a fixed-size deposit
        to the vault.
      </p>

      <div className="mt-7 space-y-5">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.11em] text-[#727d8c] uppercase">
            Receiver Public Key
          </p>
          <input
            className="w-full rounded-xl border border-white/5 bg-white/8 px-4 py-3 font-mono text-xs text-[#b3bcc7] outline-none placeholder:text-[#5f6874] focus:border-emerald-300/50"
            placeholder="xx_xx..."
            value={receiverKey}
            onChange={(e) => setReceiverKey(e.target.value)}
            disabled={preparing || isPending || isConfirming}
          />
        </div>

        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/6 p-4">
          <p className="text-sm font-bold uppercase text-[#7af7ce]">
            Deposit Amount
          </p>
          <p className="mt-1 text-xs text-[#8ad6bf]">
            This action submits exactly <span className="font-semibold">1 ETH</span>.
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-red-500/35 bg-[#2b0f16]/80 p-4 text-xs text-[#ff9aac]">
            {errorMessage}
          </div>
        )}

        <button
          onClick={handleDeposit}
          disabled={preparing || isPending || isConfirming}
          className="w-full rounded-xl bg-gradient-to-r from-[#9bfad3] to-[#14f4ba] px-6 py-4 text-sm font-bold tracking-[0.18em] text-[#063126] uppercase shadow-[0_0_30px_rgba(20,244,186,0.35)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {preparing && "Preparing..."}
          {isPending && !preparing && "Waiting For Wallet..."}
          {isConfirming &&
            !preparing &&
            !isPending &&
            "Confirming Transaction..."}
          {!preparing && !isPending && !isConfirming && "Deposit 1 ETH"}
        </button>
      </div>

      {showSuccessPopup && hash && (
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
                {hash}
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
              onClick={() => setDismissedHash(hash)}
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
