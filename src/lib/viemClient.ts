import { createPublicClient, http } from "viem";
import { sepolia, mainnet } from "viem/chains";

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});
