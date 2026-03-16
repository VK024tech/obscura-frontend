import { parseAbiItem } from "viem";
import { publicClient } from "./viemClient";

export async function getDepositEvents(mixerAddress: `0x${string}`) {
  const logs = await publicClient.getLogs({
    address: mixerAddress,
    event: parseAbiItem(
      "event Deposit(bytes32 commitment, uint32 leafIndex, string cid)",
    ),
    fromBlock: BigInt(0),
    toBlock: "latest",
  });

  return logs.map((log) => ({
    commitment: log.args.commitment,
    leafIndex: Number(log.args.leafIndex),
    cid: log.args.cid,
  }));
}
