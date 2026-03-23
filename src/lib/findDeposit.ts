import { decryptNote } from "./encryption";
import { getDepositEvents } from "./events";
import { retrieveFromIpfs } from "./ipfs";
import { getWithdrawalEvents } from "./getWithdrawed";
import { poseidonHash } from "./poseidon";

export async function findReceiverDeposit(
  mixerAddress: `0x${string}`,
  receiverPrivateKey: string,
   currentChainId: number
) {
  
  const events = await getDepositEvents(mixerAddress);
  const myDeposits: any[] = [];
  const allCommitments: bigint[] = [];

  const withdrawals = await getWithdrawalEvents(mixerAddress);

  const spent = new Set(
    withdrawals
      .map((w) => w.nullifierHash?.toString())
      .filter((x): x is string => x !== undefined),
  );

  for (const event of events) {
    if (!event.cid || !event.commitment) continue;

    allCommitments.push(BigInt(event.commitment));
    try {
      const encryptedNote = await retrieveFromIpfs(event.cid);
      const decrypted = decryptNote(encryptedNote, receiverPrivateKey);

      const nullifierHash = await poseidonHash([BigInt(decrypted.nullifier)]);

      if (spent.has(nullifierHash.toString())) {
        continue;
      }

      const [_, chainId, secret, nullifier] = decrypted.note.note.split(":");

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
  };
}
