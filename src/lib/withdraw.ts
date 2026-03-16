import { getDepositEvents } from "./events";

export async function prepareWithdrawal(MixerAddress: `0x${string}`) {
  const depositEvents = await getDepositEvents(MixerAddress);

  
}
