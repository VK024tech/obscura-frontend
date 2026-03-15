export const NETWORKS = {
  sepolia: {
    chainId: process.env.NEXT_PUBLIC_SEPOLIA_CHAINID,
    rpc: process.env.NEXT_PUBLIC_SEPOLIA_RPC,
    address: process.env.NEXT_PUBLIC_SEPOLIA_ADDRESS,
  },
  mainnet: {
    chainId: process.env.NEXT_PUBLIC_MAINNET_CHAINID,
    rpc: process.env.NEXT_PUBLIC_MAINNET_RPC,
    address: process.env.NEXT_PUBLIC_MAINNET_ADDRESS,
  },
};
