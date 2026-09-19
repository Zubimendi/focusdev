import { generateSecret, verify, generateURI } from "otplib";
import bcrypt from "bcryptjs";
import { generateBackupCodes } from "@/lib/crypto-tokens";

export function generateTotpSecret(): string {
  return generateSecret();
}

export function totpKeyuri(email: string, secret: string): string {
  return generateURI({
    issuer: "FocusDev",
    label: email,
    secret,
  });
}

export async function verifyTotp(
  token: string,
  secret: string
): Promise<boolean> {
  try {
    const result = await verify({ token, secret });
    return Boolean(result.valid);
  } catch {
    return false;
  }
}

export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  return Promise.all(
    codes.map((c) =>
      bcrypt.hash(c.replace(/\s/g, "").toUpperCase(), 10)
    )
  );
}

export async function consumeBackupCode(
  code: string,
  hashes: string[]
): Promise<{ ok: boolean; remaining: string[] }> {
  const normalized = code.replace(/\s/g, "").toUpperCase();
  for (let i = 0; i < hashes.length; i++) {
    const match = await bcrypt.compare(normalized, hashes[i]);
    if (match) {
      return { ok: true, remaining: hashes.filter((_, idx) => idx !== i) };
    }
  }
  return { ok: false, remaining: hashes };
}

export { generateBackupCodes };
