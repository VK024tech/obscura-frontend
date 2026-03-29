import { poseidonHash } from "./poseidon";
import { toHex } from "viem";

export async function generateCommitment(chainId: number) {
  const secret = BigInt(toHex(crypto.getRandomValues(new Uint8Array(31))));

  const nullifier = BigInt(toHex(crypto.getRandomValues(new Uint8Array(31))));

  const note = `obscura:${chainId}:${secret.toString()}:${nullifier.toString()}`;

  const commitment = await poseidonHash([secret, nullifier]);

  return {
    note,
    commitment,
  };
}
