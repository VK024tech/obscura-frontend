import { encryptNote } from "./encryption";
import { uploadToIpfs } from "./ipfs";
import { generateCommitment } from "./mixer";

export async function prepareDeposit(receiverPublicKey: string) {
  const note = await generateCommitment();

  const encryptedNote = encryptNote(
    {
      secret: note.secret.toString(),
      nullifier: note.nullifier.toString(),
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
