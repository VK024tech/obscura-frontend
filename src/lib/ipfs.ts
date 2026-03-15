import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT!,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY!,
});

export async function uploadToIpfs(data: any) {
  const result = await pinata.upload.public.json(data);

  return result;
}

export async function retrieveFromIpfs(cid: string) {
  const data = await pinata.gateways.public.get(cid);
  return data;
}
