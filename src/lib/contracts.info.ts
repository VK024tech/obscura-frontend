export const OBSCURA_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SEPOLIA_ADDRESS;

export const OBSCURA_ABI = [
  {
    name: "deposit",
    type: "function",
    stateMutability: "payable",
    inputs: [
      {
        name: "commitment",
        type: "bytes32",
      },
    ],
    outputs: [],
  },
];
