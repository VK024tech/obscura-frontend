"use client";

import { useState } from "react";
import { generateEncryptionKeypair } from "@/lib/encryption";

interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export default function GenerateKeys() {
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerateKeys = () => {
    const keys = generateEncryptionKeypair();
    setKeyPair(keys);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-10 max-w-2xl mx-auto bg-gray-50 rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Generate Encryption Keys</h1>

      <div className="mb-6 ">
        <p className="text-gray-600 mb-4">
          Generate a new encryption keypair for secure deposits and withdrawals.
        </p>

        <button
          onClick={handleGenerateKeys}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2  rounded font-medium "
        >
          Generate New Keys
        </button>
      </div>

      {keyPair && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <div>Public Key (Share this for depositor)</div>
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value={keyPair.publicKey}
                className="flex-1 p-3 bg-gray-100 border border-gray-300 rounded outline-0 font-mono text-sm resize-none"
                type="password"
              />
              <button
                onClick={() => copyToClipboard(keyPair.publicKey, "public")}
                className={`px-4 py-2 rounded font-medium transition ${
                  copied === "public"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {copied === "public" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded border border-red-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Private Key (Keep this secret!)
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value={keyPair.privateKey}
                className="flex-1 p-3 bg-gray-100 border outline-0 border-gray-300 rounded font-mono text-sm resize-none"
                type="password"
              />
              <button
                onClick={() => copyToClipboard(keyPair.privateKey, "private")}
                className={`px-4 py-2 rounded font-medium transition ${
                  copied === "private"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {copied === "private" ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-sm text-red-600 mt-2 font-semibold">
              ⚠️ Never share your private key with anyone!
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Save your keys securely:</strong> Store your private key
              in a secure location. You'll need it to withdraw your deposits
              later.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
