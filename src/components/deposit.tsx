"use client";

import { useWriteContract } from "wagmi";
import { OBSCURA_CONTRACT_ADDRESS, OBSCURA_ABI } from "@/lib/contracts.info";
import { parseEther } from "viem";
import { generateCommitment } from "@/lib/mixer";
import { useState } from "react";
import { prepareDeposit } from "@/lib/deposit";

export default function Deposit() {
  const [receiverKey, setReceiverKey] = useState("");
  const { writeContract } = useWriteContract();

  const handleDeposit = async () => {
    const { commitment, cid } = await prepareDeposit(receiverKey);

    writeContract({
      address: OBSCURA_CONTRACT_ADDRESS as `0x${string}`,
      abi: OBSCURA_ABI,
      functionName: "deposit",
      args: [commitment, cid],
      value: BigInt(1e16),
    });
  };

  return (
    <div>
      <input
        placeholder="Receiver Public Key"
        value={receiverKey}
        onChange={(e) => setReceiverKey(e.target.value)}
      />

      <button onClick={handleDeposit}>Deposit</button>
    </div>
  );
}
