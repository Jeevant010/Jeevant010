import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const VERSION = 1;
const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;

export type SecretEnvelope = {
  v: 1;
  alg: "aes-256-gcm";
  salt: string;
  iv: string;
  tag: string;
  data: string;
};

function passphrase(): string {
  const secret = process.env.ADMIN_SECRET;
  if (secret) {
    if (process.env.NODE_ENV === "production" && secret.length < 16) {
      throw new Error("ADMIN_SECRET must be at least 16 characters to encrypt stored secrets.");
    }
    return secret;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SECRET is required to encrypt stored secrets.");
  }
  return "dev_only_insecure_secret";
}

export function isSecretEnvelope(value: unknown): value is SecretEnvelope {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return (
    candidate.v === VERSION &&
    candidate.alg === ALGORITHM &&
    typeof candidate.salt === "string" &&
    typeof candidate.iv === "string" &&
    typeof candidate.tag === "string" &&
    typeof candidate.data === "string"
  );
}

export function sealSecrets(secrets: Record<string, string>): SecretEnvelope | Record<string, string> {
  const entries = Object.entries(secrets).filter(
    ([key, value]) => key.trim().length > 0 && typeof value === "string" && value.length > 0
  );
  if (!entries.length) return {};

  const salt = randomBytes(16);
  const key = scryptSync(passphrase(), salt, KEY_LENGTH);
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const plaintext = Buffer.from(JSON.stringify(Object.fromEntries(entries)), "utf-8");
  const data = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    v: 1,
    alg: ALGORITHM,
    salt: salt.toString("hex"),
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
    data: data.toString("base64"),
  };
}

export function openSecrets(value: unknown): Record<string, string> {
  if (!value) return {};

  if (!isSecretEnvelope(value)) {
    if (typeof value !== "object" || Array.isArray(value)) return {};
    const legacy: Record<string, string> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      if (typeof entry === "string") legacy[key] = entry;
    }
    return legacy;
  }

  try {
    const key = scryptSync(passphrase(), Buffer.from(value.salt, "hex"), KEY_LENGTH);
    const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(value.iv, "hex"));
    decipher.setAuthTag(Buffer.from(value.tag, "hex"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(value.data, "base64")),
      decipher.final(),
    ]).toString("utf-8");

    const parsed: unknown = JSON.parse(plaintext);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    const secrets: Record<string, string> = {};
    for (const [key, entry] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof entry === "string") secrets[key] = entry;
    }
    return secrets;
  } catch {
    return {};
  }
}

export function secretsAreEncrypted(value: unknown): boolean {
  return isSecretEnvelope(value);
}
