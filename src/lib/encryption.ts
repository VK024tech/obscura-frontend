import nacl from "tweetnacl";

import * as util from "tweetnacl-util";

export function generateEncryptionKeypair() {
  const keyPair = nacl.box.keyPair();

  return {
    publicKey: util.encodeBase64(keyPair.publicKey),
    privateKey: util.encodeBase64(keyPair.secretKey),
  };
}

export function encryptNote(note: any, receiverPublicKey: string) {
  const receiverKey = util.decodeBase64(receiverPublicKey);

  const temporaryKey = nacl.box.keyPair();
  const nonce = nacl.randomBytes(24);

  const message = util.decodeUTF8(JSON.stringify(note));

  const encrypted = nacl.box(
    message,
    nonce,
    receiverKey,
    temporaryKey.secretKey,
  );

  return {
    version: "obscura-v1",
    nonce: util.encodeBase64(nonce),
    tempPublicKey: util.encodeBase64(temporaryKey.publicKey),
    encryptedNote: util.encodeBase64(encrypted),
  };
}

export function decryptNote(encryptedData: any, receiverPrivateKey: string) {
  const nonce = util.decodeBase64(encryptedData.nonce);
  console.log(nonce);
  const tempPublicKey = util.decodeBase64(encryptedData.tempPublicKey);
  console.log(tempPublicKey);
  const note = util.decodeBase64(encryptedData.encryptedNote);
  console.log(note);

  const receiverKey = util.decodeBase64(receiverPrivateKey);

  const decrypted = nacl.box.open(note, nonce, tempPublicKey, receiverKey);

  if (!decrypted) {
    throw new Error("Decryption failed!");
  }

  return JSON.parse(util.encodeUTF8(decrypted));
}
