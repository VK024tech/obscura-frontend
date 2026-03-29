import { encryptNote } from "./encryption";
import { uploadToIpfs } from "./ipfs";
import { generateCommitment } from "./mixer";

export async function prepareDeposit(
  receiverPublicKey: string,
  chainId: number,
) {
  const noteObj = await generateCommitment(chainId);

  const encryptedNote = encryptNote(
    {
      note: noteObj.note, // Only pass the string, not the object with BigInt
      commitment: noteObj.commitment.toString(),
    },
    receiverPublicKey,
  );

  const cid = await uploadToIpfs(encryptedNote);

  const commitmentHex = `0x${noteObj.commitment.toString(16).padStart(64, "0")}`;

  return {
    commitment: commitmentHex,
    cid,
    note: noteObj.note,
  };
}
