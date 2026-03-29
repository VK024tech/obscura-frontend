import { decryptNote } from "./encryption";
import { getDepositEvents } from "./events";
import { retrieveFromIpfs } from "./ipfs";
import { getWithdrawalEvents } from "./getWithdrawed";
import { poseidonHash } from "./poseidon";
import { publicClient } from "./viemClient";
import { OBSCURA_CONTRACT_ADDRESS, OBSCURA_ABI } from "./contracts.info";

export async function findReceiverDeposit(
  mixerAddress: `0x${string}`,
  receiverPrivateKey: string,
  currentChainId: number,
) {
  const events = await getDepositEvents(mixerAddress);

  const myDeposits: any[] = [];
  const allCommitments: bigint[] = [];

  const sortedEvents = events.sort(
    (a, b) => (a.leafIndex || 0) - (b.leafIndex || 0),
  );

  for (const event of sortedEvents) {
    if (event.commitment) {
      const commitment = BigInt(event.commitment);
      allCommitments.push(commitment);
    }
  }

  let contractRoot: bigint | null = null;
  try {
    const rootHex = await publicClient.readContract({
      address: OBSCURA_CONTRACT_ADDRESS as `0x${string}`,
      abi: OBSCURA_ABI,
      functionName: "getLastRoot",
      args: [],
    });
    contractRoot = BigInt(rootHex as string);
  } catch {
  }

  const withdrawals = await getWithdrawalEvents(mixerAddress);

  const spent = new Set(
    withdrawals
      .map((w) => w.nullifierHash?.toString())
      .filter((x): x is string => x !== undefined),
  );

  for (const event of sortedEvents) {
    if (!event.cid || !event.commitment) {
      continue;
    }

    try {
      const encryptedNote = await retrieveFromIpfs(event.cid);

      const decrypted = decryptNote(encryptedNote, receiverPrivateKey);

      const [, chainId, secret, nullifier] = decrypted.note.split(":");

      const nullifierHash = await poseidonHash([BigInt(nullifier)]);

      if (spent.has(nullifierHash.toString())) {
        continue;
      }

      if (Number(chainId) != currentChainId) {
        throw new Error(`Incorrect Chain, Please switch to chain ${chainId}!`);
      }

      myDeposits.push({
        commitment: event.commitment,
        leafIndex: event.leafIndex,
        cid: event.cid,
        secret: BigInt(secret),
        nullifier: BigInt(nullifier),
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Incorrect Chain")) {
        throw error;
      }
      continue;
    }
  }
  return {
    userDeposits: myDeposits,
    allCommitments,
    contractRoot,
  };
}
