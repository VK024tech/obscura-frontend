import { poseidonHash } from "./poseidon";
import { groth16 } from "snarkjs";
import { publicClient } from "./viemClient";
import { OBSCURA_CONTRACT_ADDRESS, OBSCURA_ABI } from "./contracts.info";

const TREE_DEPTH = 20;

const HARDCODED_ZEROS: { [key: number]: string } = {
  0: "0x2fe54c60d3acabf3343a35b6eba15db4821b340f76e741e2249685ed4899af6c",
  1: "0x256a6135777eee2fd26f54b8b7037a25439d5235caee224154186d2b8a52e31d",
  2: "0x1151949895e82ab19924de92c40a3d6f7bcb60d92b00504b8199613683f0c200",
  3: "0x20121ee811489ff8d61f09fb89e313f14959a0f28bb428a20dba6b0b068b3bdb",
  4: "0x0a89ca6ffa14cc462cfedb842c30ed221a50a3d6bf022a6a57dc82ab24c157c9",
  5: "0x24ca05c2b5cd42e890d6be94c68d0689f4f21c9cec9c0f13fe41d566dfb54959",
  6: "0x1ccb97c932565a92c60156bdba2d08f3bf1377464e025cee765679e604a7315c",
  7: "0x19156fbd7d1a8bf5cba8909367de1b624534ebab4f0f79e003bccdd1b182bdb4",
  8: "0x261af8c1f0912e465744641409f622d466c3920ac6e5ff37e36604cb11dfff80",
  9: "0x0058459724ff6ca5a1652fcbc3e82b93895cf08e975b19beab3f54c217d1c007",
  10: "0x1f04ef20dee48d39984d8eabe768a70eafa6310ad20849d4573c3c40c2ad1e30",
  11: "0x1bea3dec5dab51567ce7e200a30f7ba6d4276aeaa53e2686f962a46c66d511e5",
  12: "0x0ee0f941e2da4b9e31c3ca97a40d8fa9ce68d97c084177071b3cb46cd3372f0f",
  13: "0x1ca9503e8935884501bbaf20be14eb4c46b89772c97b96e3b2ebf3a36a948bbd",
  14: "0x133a80e30697cd55d8f7d4b0965b7be24057ba5dc3da898ee2187232446cb108",
  15: "0x13e6d8fc88839ed76e182c2a779af5b2c0da9dd18c90427a644f7e148a6253b6",
  16: "0x1eb16b057a477f4bc8f572ea6bee39561098f78f15bfb3699dcbb7bd8db61854",
  17: "0x0da2cb16a1ceaabf1c16b838f7a9e3f2a3a3088d9e0a6debaa748114620696ea",
  18: "0x24a3b3d822420b14b5d8cb6c28a574f01e98ea9e940551d2ebd75cee12649f9d",
  19: "0x198622acbd783d1b0d9064105b1fc8e4d8889de95c4c519b3f635809fe6afc05",
  20: "0x29d7ed391256ccc3ea596c86e933b89ff339d25ea8ddced975ae2fe30b5296d4",
};

function getContractZero(i: number): bigint {
  const hex = HARDCODED_ZEROS[i];
  if (!hex) {
    throw new Error(`No pre-computed zero value for level ${i}`);
  }
  return BigInt(hex);
}

export async function getContractRoot(): Promise<bigint> {
  const root = await publicClient.readContract({
    address: OBSCURA_CONTRACT_ADDRESS as `0x${string}`,
    abi: OBSCURA_ABI,
    functionName: "getLastRoot",
  });
  return BigInt(root as string | bigint);
}

function addressToUint160(addr: string): bigint {
  const cleaned = addr.startsWith("0x") ? addr.slice(2) : addr;
  const padded = cleaned.padStart(40, "0");
  return BigInt("0x" + padded);
}

async function treeHash(left: bigint, right: bigint): Promise<bigint> {
  return await poseidonHash([left, right]);
}

async function buildMerkleTreeAndProof(leaves: bigint[], leafIndex: number) {
  if (leafIndex >= leaves.length) {
    throw new Error(
      `Leaf index ${leafIndex} out of bounds for ${leaves.length} leaves`,
    );
  }

  const zeros: bigint[] = [];
  for (let i = 0; i <= TREE_DEPTH; i++) {
    zeros[i] = getContractZero(i);
  }

  const siblings: string[] = [];
  let currentLevel = [...leaves];
  let index = leafIndex;

  for (let level = 0; level < TREE_DEPTH; level++) {
    const siblingIndex = index ^ 1;
    const siblingValue = currentLevel[siblingIndex] ?? zeros[level];
    siblings.push(siblingValue.toString());

    const nextLevelLength = Math.max(1, Math.ceil(currentLevel.length / 2));
    const nextLevel: bigint[] = new Array(nextLevelLength);

    for (let i = 0; i < nextLevelLength; i++) {
      const left = currentLevel[2 * i] ?? zeros[level];
      const right = currentLevel[2 * i + 1] ?? zeros[level];
      nextLevel[i] = await treeHash(left, right);
    }

    currentLevel = nextLevel;
    index = Math.floor(index / 2);
  }

  const computedRoot = currentLevel[0];

  return { root: computedRoot, siblings };
}

export async function generateWithdrawProof({
  commitments,
  leafIndex,
  secret,
  nullifier,
  recipient,
  relayer,
  relayerFee,
  chainId,
  contractAddress,
  contractRoot,
}: any) {
  if (!commitments || commitments.length === 0) {
    throw new Error("No commitments provided for merkle proof");
  }

  const allCommitmentsBigInt = commitments;

  let root: bigint;
  let siblings: string[];

  if (contractRoot) {
    root = contractRoot;

    const { siblings: computedSiblings } = await buildMerkleTreeAndProof(
      allCommitmentsBigInt,
      leafIndex,
    );
    siblings = computedSiblings;
  } else {
    const result = await buildMerkleTreeAndProof(
      allCommitmentsBigInt,
      leafIndex,
    );
    root = result.root;
    siblings = result.siblings;
  }

  const nullifierHash = await poseidonHash([BigInt(nullifier)]);

  const signalHash = await poseidonHash([
    addressToUint160(recipient),
    addressToUint160(relayer),
    BigInt(relayerFee),
    BigInt(chainId),
    addressToUint160(contractAddress),
  ]);

  if (leafIndex >= allCommitmentsBigInt.length) {
    throw new Error(
      `ERROR: Leaf index ${leafIndex} is out of bounds! Only have ${allCommitmentsBigInt.length} commitments.`,
    );
  }

  const input = {
    root: root.toString(),
    nullifierHash: nullifierHash.toString(),
    signalHash: signalHash.toString(),
    secret: BigInt(secret).toString(),
    nullifier: BigInt(nullifier).toString(),
    recipient: addressToUint160(recipient).toString(),
    relayer: addressToUint160(relayer).toString(),
    relayerFee: BigInt(relayerFee).toString(),
    chainId: BigInt(chainId).toString(),
    contractAddress: addressToUint160(contractAddress).toString(),
    siblings: siblings,
    index: leafIndex,
  };

  const { proof, publicSignals } = await groth16.fullProve(
    input,
    "/circuits/withdraw.wasm",
    "/circuits/withdraw_final.zkey",
  );

  return {
    proof,
    publicSignals,
    root,
    nullifierHash,
    signalHash,
  };
}

export function formatProof(proof: any) {
  const formatted = {
    a: [proof.pi_a[0], proof.pi_a[1]],
    b: [
      [proof.pi_b[0][1], proof.pi_b[0][0]],
      [proof.pi_b[1][1], proof.pi_b[1][0]],
    ],
    c: [proof.pi_c[0], proof.pi_c[1]],
  };
  return formatted;
}
