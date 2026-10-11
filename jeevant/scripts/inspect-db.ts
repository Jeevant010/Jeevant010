import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing");
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) throw new Error("no db");
  const names = await db.listCollections().toArray();
  for (const entry of names) {
    const collection = db.collection(entry.name);
    const count = await collection.countDocuments();
    console.log(`\n== ${entry.name} ${count}`);
    const docs = await collection
      .find({}, { projection: { title: 1, name: 1, company: 1, role: 1, visibility: 1 } })
      .limit(12)
      .toArray();
    for (const doc of docs) {
      const label = doc.title || doc.name || [doc.role, doc.company].filter(Boolean).join(" @ ") || String(doc._id);
      console.log(` - ${label}${doc.visibility ? ` [${doc.visibility}]` : ""}`);
    }
  }
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
