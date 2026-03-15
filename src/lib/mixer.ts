import { buildPoseidon } from "circomlibjs";
import { toHex } from "viem";

export async function generateCommitment(chainId: number) {
  const poseidon = await buildPoseidon();

  const secret = BigInt(toHex(crypto.getRandomValues(new Uint8Array(31))));

  const nullifier = BigInt(toHex(crypto.getRandomValues(new Uint8Array(31))));

  const note = `obscura:${chainId}:${secret.toString()}:${nullifier.toString()}`;

  const commitment = poseidon([secret, nullifier]);

  return {
    note,
    commitment: poseidon.F.toString(commitment),
  };
}
