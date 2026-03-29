import { MerkleTree } from "fixed-merkle-tree";
import { getPoseidon, poseidonHashSync } from "./poseidon";

const TREE_LEVELS = Number(process.env.TREE_LEVELS || 20);

export async function buildMerkleTree(commitments: bigint[]) {
  if (!commitments || !Array.isArray(commitments)) {
    throw new Error("Commitments must be an array");
  }

  await getPoseidon();

  const leaves = commitments.map((c) => c.toString());

  return new MerkleTree(TREE_LEVELS, leaves, {
    hashFunction: (left: string | number, right: string | number) =>
      poseidonHashSync([BigInt(left), BigInt(right)]),
    zeroElement: "0",
  });
}

export async function generateMerkleProof(
  commitments: bigint[],
  leafIndex: number,
) {
  const tree = await buildMerkleTree(commitments);

  const { pathElements, pathIndices } = tree.path(leafIndex);

  return {
    root: tree.root,
    pathElements,
    pathIndices,
  };
}
