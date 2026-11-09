import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const ISSUER = "jeevant";
const AUDIENCE = "jeevant-admin";
const INSECURE_DEFAULTS = new Set(["change-me", "default_secret_key"]);

function getKey(): Uint8Array {
  const secret = process.env.ADMIN_SECRET;
  const weak = !secret || INSECURE_DEFAULTS.has(secret) || secret.length < 16;

  if (weak) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ADMIN_SECRET is missing or too weak. Set a unique value of 16+ characters in production.");
    }
    return new TextEncoder().encode(secret || "dev_only_insecure_secret");
  }

  return new TextEncoder().encode(secret);
}

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("1 week")
    .sign(getKey());
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, getKey(), {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}