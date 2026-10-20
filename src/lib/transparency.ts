import { createHmac } from "node:crypto";

/**
 * Option A transparency: per-code HMAC commitments rolled into a single root.
 * Leaf = HMAC(secret, normalizedCode)
 * Root = HMAC(secret, sorted leaves joined by newline)
 */
export function codeCommitment(secret: string, code: string): string {
  return createHmac("sha256", secret).update(code.trim().toUpperCase()).digest("hex");
}

export function commitmentRoot(secret: string, codes: string[]): string {
  const leaves = codes.map((c) => codeCommitment(secret, c)).sort();
  const payload = leaves.join("\n");
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export type TransparencyOpen = {
  mode: "open";
  turnout: number;
  commitmentRoot: string;
  electionOpen: boolean;
};

export type TransparencyClosed = {
  mode: "closed";
  turnout: number;
  commitmentRoot: string;
  codes: string[];
  electionOpen: boolean;
};

export type TransparencyPayload = TransparencyOpen | TransparencyClosed;

export function buildTransparencyPayload(
  secret: string,
  codes: string[],
  turnout: number,
  electionOpen: boolean,
): TransparencyPayload {
  const root = commitmentRoot(secret, codes);
  if (electionOpen) {
    return { mode: "open", turnout, commitmentRoot: root, electionOpen };
  }
  return {
    mode: "closed",
    turnout,
    commitmentRoot: root,
    codes: codes.map((c) => c.trim().toUpperCase()).sort(),
    electionOpen,
  };
}
