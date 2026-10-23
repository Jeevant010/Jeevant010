import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing from .env.local");
    process.exit(1);
  }
  if (!process.env.ADMIN_SECRET) {
    console.error("ADMIN_SECRET is missing from .env.local");
    process.exit(1);
  }

  const { default: connectDB } = await import("../lib/db");
  const { ChannelAccount } = await import("../lib/database/models");
  const { isSecretEnvelope, openSecrets, sealSecrets } = await import("../lib/crypto/secrets");

  await connectDB();
  const accounts = await ChannelAccount.find({});
  let changed = 0;

  for (const account of accounts) {
    if (isSecretEnvelope(account.secrets)) continue;

    const plain = openSecrets(account.secrets);
    if (!Object.keys(plain).length) continue;

    account.secrets = sealSecrets(plain) as any;
    account.markModified("secrets");
    await account.save();
    changed += 1;
    console.log(`encrypted ${account.channel}/${account.label}`);
  }

  console.log(`done — ${changed} account(s) encrypted`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
