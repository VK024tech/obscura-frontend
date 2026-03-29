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
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const handleGenerateKeys = () => {
    const keys = generateEncryptionKeypair();
    setKeyPair(keys);
    setShowPrivateKey(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0c1118]/95 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
      <h1 className="text-2xl font-semibold tracking-tight text-white">
        Generate Encryption Keys
      </h1>
      <p className="mt-2 max-w-xl  text-sm leading-relaxed text-[#7f8996]">
        Initialize your cryptographic identity. These keys are required to sign
        private transactions and decrypt your vault data locally.
      </p>

      <div className="mt-7 space-y-5">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.11em] text-[#727d8c] uppercase">
            Public Key (Safe To Share)
          </p>
          <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/8 px-4 py-3">
            <p className="min-w-0 flex-1 truncate font-mono text-sm text-[#b3bcc7]">
              {keyPair?.publicKey || "pk_0x8f2d...9e4c2b1a0f8d7e6c5b4a3f2e1d0c"}
            </p>
            <button
              onClick={() =>
                keyPair && copyToClipboard(keyPair.publicKey, "public")
              }
              disabled={!keyPair}
              className="rounded-md p-2 text-[#9ca5af] transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Copy public key"
            >
              {copied === "public" ? "Copied" : "⧉"}
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.11em] text-[#727d8c] uppercase">
            Private Key (Highly Sensitive)
          </p>
          <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/8 px-4 py-3">
            <p className="min-w-0 flex-1 truncate font-mono text-sm text-[#27e8b0]">
              {keyPair
                ? showPrivateKey
                  ? keyPair.privateKey
                  : "•".repeat(Math.min(keyPair.privateKey.length, 48))
                : "••••••••••••••••••••••••••••••••••••••••••••"}
            </p>
            <button
              onClick={() => setShowPrivateKey((prev) => !prev)}
              disabled={!keyPair}
              className="rounded-md p-2 text-[#9ca5af] transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={showPrivateKey ? "Hide private key" : "Show private key"}
            >
              {showPrivateKey ? "Hide" : "Show"}
            </button>
            <button
              onClick={() =>
                keyPair && copyToClipboard(keyPair.privateKey, "private")
              }
              disabled={!keyPair}
              className="rounded-md p-2 text-[#9ca5af] transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Copy private key"
            >
              {copied === "private" ? "Copied" : "⧉"}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-red-500/35 bg-[#2b0f16]/80 p-4">
          <p className="text-sm font-bold text-[#ff5a6f] uppercase">
            Security Protocol Violation Risk
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-[#c8a6ae]">
            Never share your private key with anyone.
          </p>
        </div>
      </div>

      <button
        onClick={handleGenerateKeys}
        className="mt-8 w-full rounded-xl bg-gradient-to-r from-[#9bfad3] to-[#14f4ba] px-6 py-4 text-sm font-bold tracking-[0.18em] text-[#063126] uppercase shadow-[0_0_30px_rgba(20,244,186,0.35)] transition hover:brightness-105"
      >
        Generate New Keys
      </button>
    </div>
  );
}
