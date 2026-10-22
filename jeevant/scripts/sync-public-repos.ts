import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { PUBLIC_WORK } from "../lib/catalog/public-work";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const ProjectSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true },
  description: String,
  content: String,
  techStack: [String],
  repoLink: String,
  liveLink: String,
  visibility: String,
  status: String,
  isOngoing: Boolean,
  createdAt: { type: Date, default: Date.now },
});

const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI missing");
  }
  await mongoose.connect(uri);
  for (const item of PUBLIC_WORK) {
    const payload = {
      title: item.title,
      slug: item.slug,
      description: item.description,
      content: item.detail,
      techStack: item.stack,
      repoLink: item.repo,
      visibility: "public",
      status: item.featured ? "live" : "building",
    };
    const existing = await Project.findOne({
      $or: [{ slug: item.slug }, { repoLink: item.repo }],
    });
    if (existing) {
      Object.assign(existing, payload);
      await existing.save();
      console.log(`updated ${item.slug}`);
    } else {
      await Project.create(payload);
      console.log(`created ${item.slug}`);
    }
  }
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
