export const OBSCURA_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ANVIL_ADDRESS;

export const OBSCURA_ABI = [
  {
    name: "getLastRoot",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "bytes32",
      },
    ],
  },
  {
    name: "deposit",
    type: "function",
    stateMutability: "payable",
    inputs: [
      {
        name: "commitment",
        type: "bytes32",
      },
      {
        name: "cid",
        type: "string",
      },
    ],
    outputs: [],
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "_pA",
        type: "uint256[2]",
      },
      {
        name: "_pB",
        type: "uint256[2][2]",
      },
      {
        name: "_pC",
        type: "uint256[2]",
      },
      {
        name: "root",
        type: "uint256",
      },
      {
        name: "nullifierHash",
        type: "uint256",
      },
      {
        name: "recipient",
        type: "address",
      },
      {
        name: "relayer",
        type: "address",
      },
      {
        name: "relayerFee",
        type: "uint256",
      },
      {
        name: "signalHash",
        type: "uint256",
      },
    ],
    outputs: [],
  },
];
