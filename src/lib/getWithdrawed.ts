import { publicClient } from "./viemClient";

export async function getWithdrawalEvents(address: `0x${string}`) {
  const logs = await publicClient.getLogs({
    address,
    event: {
      type: "event",
      name: "Withdrawal",
      inputs: [
        { indexed: false, name: "recipient", type: "address" },
        { indexed: false, name: "nullifierHash", type: "uint256" },
        { indexed: false, name: "relayer", type: "address" },
      ],
    },
    fromBlock: BigInt(0),
    toBlock: "latest",
  });

  return logs.map((log) => log.args);
}
