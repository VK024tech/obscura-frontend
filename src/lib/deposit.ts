import { encryptNote } from "./encryption";
import { uploadToIpfs } from "./ipfs";
import { generateCommitment } from "./mixer";

export async function prepareDeposit(receiverPublicKey: string, chainId:number) {
  const note = await generateCommitment(chainId);

  const encryptedNote = encryptNote(
    {
      note: note,
      commitment: note.commitment.toString(),
    },
    receiverPublicKey,
  );

  const cid = await uploadToIpfs(encryptedNote);

  return {
    commitment: note.commitment,
    cid,
    note,
  };
}
