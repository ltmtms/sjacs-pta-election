/** Letters allowed in ballot codes (A–Z excluding I and O). */
export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ";

const CODE_LENGTH = 4;

export function isValidCodeFormat(code: string): boolean {
  if (code.length !== CODE_LENGTH) return false;
  const upper = code.toUpperCase();
  for (const ch of upper) {
    if (!CODE_ALPHABET.includes(ch)) return false;
  }
  return true;
}

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

export function generateBallotCode(random: () => number = Math.random): string {
  let result = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    const idx = Math.floor(random() * CODE_ALPHABET.length);
    result += CODE_ALPHABET[idx];
  }
  return result;
}

export function generateUniqueCodes(
  count: number,
  random: () => number = Math.random,
): string[] {
  const set = new Set<string>();
  while (set.size < count) {
    set.add(generateBallotCode(random));
  }
  return [...set];
}
