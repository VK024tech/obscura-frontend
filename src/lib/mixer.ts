import { buildPoseidon } from "circomlibjs";
import { toHex } from "viem";

export async function generateCommitment() {
  const poseidon = await buildPoseidon();

  const secret = BigInt(toHex(crypto.getRandomValues(new Uint8Array(31))));

  const nullifier = BigInt(toHex(crypto.getRandomValues(new Uint8Array(31))));

  const commitment = poseidon([secret, nullifier]);

  return {
    secret,
    nullifier,
    commitment: poseidon.F.toString(commitment),
  };
}
