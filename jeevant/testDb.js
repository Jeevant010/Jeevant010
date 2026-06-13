const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

const ProjectSchema = new mongoose.Schema({}, { strict: false });
const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);

async function run() {
  await mongoose.connect(MONGODB_URI);
  const projects = await Project.find({}).lean();
  console.log("Total Projects:", projects.length);
  for (let p of projects) {
    const slug = p.slug;
    const _id = p._id.toString();
    const href = `/projects/${slug || _id}`;
    console.log(`Title: ${p.title} | Slug: ${slug} | _id: ${_id} | HREF: ${href}`);
  }
  process.exit(0);
}
run();
