import mongoose, { Schema, models, model } from "mongoose";

// --- 1. PROJECT SCHEMA (Portfolio & Ideas) ---
const ProjectSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // for url like /projects/ecosort
  description: { type: String, required: true },
  content: { type: String }, // Markdown content
  techStack: [{ type: String }],
  repoLink: { type: String },
  liveLink: { type: String },
  visibility: { 
    type: String, 
    enum: ["public", "private", "archived"], 
    default: "private" 
  },
  status: { 
    type: String, 
    enum: ["building", "live", "stopped", "planned"], 
    default: "planned" 
  },
  createdAt: { type: Date, default: Date.now },
});

// --- 2. TASK SCHEMA (Planner) ---
const TaskSchema = new Schema({
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  dueDate: { type: Date },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  scope: { type: String, enum: ["daily", "weekly", "monthly", "life"], default: "daily" },
  projectId: { type: Schema.Types.ObjectId, ref: "Project" }, // Link task to a project
  createdAt: { type: Date, default: Date.now },
});

// --- 3. BRAIN NOTE SCHEMA (Second Brain) ---
const NoteSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, default: "" },
  tags: [{ type: String }],
  isPinned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// --- 4. LEARNING SCHEMA (Course Tracker) ---
const LearningSchema = new Schema({
  title: { type: String, required: true },
  platform: { type: String }, // YouTube, Udemy, Coursera
  url: { type: String },
  totalModules: { type: Number, default: 0 },
  completedModules: { type: Number, default: 0 },
  status: { type: String, enum: ["not-started", "in-progress", "completed"], default: "not-started" },
});

// ... (Keep Project, Task, Note, Learning schemas from before)

// --- 5. EXPERIENCE SCHEMA (Internships & Jobs) ---
const ExperienceSchema = new Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date }, // Null means "Present"
  description: { type: String }, // Bullet points
  skillsUsed: [{ type: String }],
  logoUrl: { type: String }, 
  type: { type: String, enum: ["internship", "full-time", "freelance"], default: "internship" }
});

// --- 6. ACHIEVEMENT SCHEMA (Hackathons, LeetCode) ---
const AchievementSchema = new Schema({
  title: { type: String, required: true }, // e.g., "LeetCode Knight"
  platform: { type: String }, // e.g., "LeetCode", "Hackathon"
  date: { type: Date, default: Date.now },
  proofLink: { type: String }, // Certificate URL
  description: { type: String },
  icon: { type: String, default: "trophy" } // icon name
});

// --- 7. CERTIFICATE SCHEMA ---
const CertificateSchema = new Schema({
  name: { type: String, required: true },
  issuer: { type: String, required: true }, // e.g., "AWS", "Google"
  issueDate: { type: Date },
  expiryDate: { type: Date },
  credentialId: { type: String },
  url: { type: String }
});


const ApplicationSchema = new Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["applied", "interview", "offer", "rejected", "ghosted"], 
    default: "applied" 
  },
  salary: { type: String }, // e.g. "50k" or "15LPA"
  notes: { type: String },
  dateApplied: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
});

export const Application = models.Application || model("Application", ApplicationSchema);
export const Experience = models.Experience || model("Experience", ExperienceSchema);
export const Achievement = models.Achievement || model("Achievement", AchievementSchema);
export const Certificate = models.Certificate || model("Certificate", CertificateSchema);
// Use "models.ModelName" || model("ModelName", schema) to prevent overwrite errors in Next.js
export const Project = models.Project || model("Project", ProjectSchema);
export const Task = models.Task || model("Task", TaskSchema);
export const Note = models.Note || model("Note", NoteSchema);
export const Learning = models.Learning || model("Learning", LearningSchema);