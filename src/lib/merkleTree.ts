import { MerkleTree } from "fixed-merkle-tree";
import { getPoseidon, poseidonHashSync } from "./poseidon";

const TREE_LEVELS = Number(process.env.TREE_LEVELS!);

export async function buildMerkleTree(commitments: bigint[]) {
  await getPoseidon();
  
  const tree = new MerkleTree(TREE_LEVELS, commitments.map(c => c.toString()), {
    hashFunction: (left: any, right: any) => {
      return poseidonHashSync([BigInt(left), BigInt(right)]);
    },
    zeroElement: "0",
  });

  return tree;
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
