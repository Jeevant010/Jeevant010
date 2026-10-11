import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { PUBLIC_WORK } from "../lib/catalog/public-work";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const KEEP_ACHIEVEMENT = /ssip|udbhav|hackodisha|adobe|algouniversity|leetcode|codeforces|open source|dso|ctf|innovision|kaggle|ibm ai/i;
const KEEP_CERTIFICATE = /1m1b|edunet|smartbridge|ibm ai fundamentals|career management|innovision|ssip/i;
const DROP_EMPTY_REPO_TITLES = [
  "Decentralized Land Registry (Land Trust)",
  "AI Engine for Unreal Engine 5",
  "Local AI Stack & Generative Transformer",
  "WasteSortAI (EcoSort AI)",
];
const DROP_EXPERIENCE_ROLES = [
  "Technical Coordinator — Spring Fiesta 2026",
  "4th Convocation Coordinator",
  "Node.js & Express Instructor (ICT-II)",
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing");
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) throw new Error("no db");

  const achievements = db.collection("achievements");
  const certificates = db.collection("certificates");
  const projects = db.collection("projects");
  const experiences = db.collection("experiences");

  const droppedAchievements = await achievements.deleteMany({ title: { $not: KEEP_ACHIEVEMENT } });
  const droppedCertificates = await certificates.deleteMany({ name: { $not: KEEP_CERTIFICATE } });
  const droppedExperiences = await experiences.deleteMany({ role: { $in: DROP_EXPERIENCE_ROLES } });
  const droppedProjects = await projects.deleteMany({
    title: { $in: DROP_EMPTY_REPO_TITLES },
    $or: [{ repoLink: "" }, { repoLink: { $exists: false } }, { repoLink: null }],
  });

  const catalogRepos = new Set(PUBLIC_WORK.map((item) => item.repo));
  const catalogSlugs = new Set(PUBLIC_WORK.map((item) => item.slug));
  const dupes = await projects.find({ repoLink: { $in: [...catalogRepos] } }).toArray();
  let droppedDupes = 0;
  for (const doc of dupes) {
    if (!catalogSlugs.has(doc.slug)) {
      await projects.deleteOne({ _id: doc._id });
      droppedDupes += 1;
    }
  }

  console.log({
    achievements: droppedAchievements.deletedCount,
    certificates: droppedCertificates.deletedCount,
    experiences: droppedExperiences.deletedCount,
    seedProjects: droppedProjects.deletedCount,
    duplicateRepos: droppedDupes,
  });
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
