import { generateMerkleProof } from "./merkleTree";
import { poseidonHash } from "./poseidon";
import { groth16 } from "snarkjs";

export async function generateWithdrawProof({
  commitments,
  leafIndex,
  secret,
  nullifier,
  recipient,
  relayer,
  relayerFee,
  chaindId,
  contractAddress,
}: any) {
  const allCommitmentsBigInt = commitments;

  const { root, pathElements, pathIndices } = await generateMerkleProof(
    allCommitmentsBigInt,
    leafIndex,
  );

  const nullifierHash = await poseidonHash([BigInt(nullifier)]);

  const signalHash = await poseidonHash([
    BigInt(recipient),
    BigInt(relayer),
    BigInt(relayerFee),
    BigInt(chaindId),
    BigInt(contractAddress),
  ]);

  const input = {
    root: root.toString(),
    nullifier: BigInt(nullifier).toString(),
    secret: BigInt(secret).toString(),
    pathElements: pathElements.map((x: any) => x.toString()),
    pathIndices,
    recipient: BigInt(recipient).toString(),
    relayer: BigInt(relayer).toString(),
    relayerFee: BigInt(relayerFee).toString(),
    chaindId: BigInt(chaindId).toString(),
    contractAddress: BigInt(contractAddress).toString(),
  };

  const { proof, publicSignals } = await groth16.fullProve(
    input,
    "/circuits/withdraw.wasm",
    "/circuits/withdraw.zkey",
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
  return {
    a: [proof.pi_a[0], proof.pi_a[1]],
    b: [
      [proof.pi_b[0][1], proof.pi_b[0][0]],
      [proof.pi_b[1][1], proof.pi_b[1][0]],
    ],
    c: [proof.pi_c[0], proof.pi_c[1]],
  };
}
