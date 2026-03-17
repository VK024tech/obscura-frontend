import { buildPoseidon } from "circomlibjs";

let poseidon: any;
let F: any;

export async function getPoseidon() {
  if (!poseidon) {
    poseidon = await buildPoseidon();
    F = poseidon.F;
  }

  return { poseidon, F };
}

export async function poseidonHash(inputs: bigint[]) {
  const { poseidon, F } = await getPoseidon();
  const res = poseidon(inputs);
  return BigInt(F.toString(res));
}

export function poseidonHashSync(inputs: (bigint | string)[]): string {
  if (!poseidon || !F) {
    throw new Error("Poseidon not initialized. Call getPoseidon() first.");
  }
  const bigintInputs = inputs.map(x => typeof x === 'string' ? BigInt(x) : x);
  const res = poseidon(bigintInputs);
  return F.toString(res);
}
