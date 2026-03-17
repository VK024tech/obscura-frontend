import { decryptNote } from "./encryption";
import { getDepositEvents } from "./events";
import { retrieveFromIpfs } from "./ipfs";

export async function findReceiverDeposit(
  mixerAddress: `0x${string}`,
  receiverPublicKey: string,
) {
  const events = await getDepositEvents(mixerAddress);
  const myDeposits: any[] = [];
  const allCommitments: bigint[] = [];
  for (const event of events) {
    if (!event.cid || !event.commitment) continue;

    allCommitments.push(BigInt(event.commitment));
    try {
      const encryptedNote = await retrieveFromIpfs(event.cid);
      const decrypted = decryptNote(encryptedNote, receiverPublicKey);

      myDeposits.push({
        commitment: event.commitment,
        leafIndex: event.leafIndex,
        cid: event.cid,
        secret: decrypted.secret,
        nullifier: decrypted.nullifier,
      });
    } catch (error) {
      continue;
    }
  }

  return {
    userDeposits: myDeposits,
    allCommitments,
  };
}
