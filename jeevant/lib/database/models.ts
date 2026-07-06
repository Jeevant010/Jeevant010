import mongoose, { Schema, models, model } from "mongoose";

// --- 1. PROJECT SCHEMA (Portfolio & Ideas) ---
const ProjectSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  content: { type: String },
  techStack: [{ type: String }],
  repoLink: { type: String },
  liveLink: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  isOngoing: { type: Boolean, default: false },
  visibility: { type: String, enum: ["public", "private", "archived"], default: "private" },
  status: { type: String, enum: ["building", "live", "stopped", "planned"], default: "planned" },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  clientName: { type: String },
  budget: { type: String },
  tags: [{ type: String }],
  featured: { type: Boolean, default: false },
  rating: { type: Number },
  platform: { type: String },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" }
});

// --- 2. TASK SCHEMA (Planner) ---
const TaskSchema = new Schema({
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  dueDate: { type: Date },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  scope: { type: String, enum: ["daily", "weekly", "monthly", "life"], default: "daily" },
  projectId: { type: Schema.Types.ObjectId, ref: "Project" }, // Link task to a project
  order: { type: Number, default: 0 },
  reminderDate: { type: Date },
  sourceUrl: { type: String },
  category: { type: String },
  createdAt: { type: Date, default: Date.now },
  estimatedTime: { type: Number }, // in minutes
  actualTime: { type: Number }, // in minutes
  energyLevel: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  tags: [{ type: String }],
  dependencies: [{ type: String }],
  statusUpdate: { type: String },
  blockers: { type: String },
  reviewNotes: { type: String },
  assignedTo: { type: String },
  cost: { type: String },
});

// --- 3. BRAIN NOTE SCHEMA (Second Brain) ---
const NoteSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, default: "" },
  tags: [{ type: String }],
  visibility: { type: String, enum: ["public", "private"], default: "private" },
  isPinned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  author: { type: String },
  sourceUrl: { type: String },
  rating: { type: Number, min: 1, max: 10 },
  summary: { type: String },
  references: [{ type: String }],
  category: { type: String },
  status: { type: String, enum: ["draft", "review", "published"], default: "draft" },
  coverImage: { type: String },
  isPublished: { type: Boolean, default: false },
  wordCount: { type: Number, default: 0 },
});

// --- 4. LEARNING SCHEMA (Course Tracker) ---
const LearningSchema = new Schema({
  title: { type: String, required: true },
  platform: { type: String }, // YouTube, Udemy, Coursera
  url: { type: String },
  totalModules: { type: Number, default: 0 },
  completedModules: { type: Number, default: 0 },
  visibility: { type: String, enum: ["public", "private"], default: "private" },
  status: { type: String, enum: ["not-started", "in-progress", "completed"], default: "not-started" },
  type: { type: String, enum: ["book", "paper", "course", "guide"], default: "course" },
  order: { type: Number, default: 0 },
  instructor: { type: String },
  rating: { type: Number, min: 1, max: 10 },
  certificateUrl: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  price: { type: String },
  skillsGained: [{ type: String }],
  difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
  review: { type: String },
  notesRef: { type: String },
});

// ... (Keep Project, Task, Note, Learning schemas from before)

// --- 5. EXPERIENCE SCHEMA (Internships & Jobs) ---
const ExperienceSchema = new Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date }, // Null means "Present"
  description: { type: String },
  skillsUsed: [{ type: String }],
  logoUrl: { type: String }, 
  type: { type: String, enum: ["internship", "full-time", "freelance"], default: "internship" },
  order: { type: Number, default: 0 },
  location: { type: String },
  website: { type: String },
  isCurrent: { type: Boolean, default: false },
  manager: { type: String },
  salary: { type: String },
  rating: { type: Number, min: 1, max: 10 },
  tags: [{ type: String }],
  achievements: [{ type: String }],
  reasonForLeaving: { type: String }
});

// --- 6. ACHIEVEMENT SCHEMA (Hackathons, LeetCode) ---
const AchievementSchema = new Schema({
  title: { type: String, required: true },
  platform: { type: String },
  date: { type: Date, default: Date.now },
  proofLink: { type: String },
  description: { type: String },
  icon: { type: String, default: "trophy" },
  visibility: { type: String, enum: ["public", "private"], default: "public" },
  order: { type: Number, default: 0 },
  category: { type: String },
  score: { type: Number },
  issuer: { type: String },
  credentialId: { type: String },
  skills: [{ type: String }],
  importance: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  tags: [{ type: String }],
  expiryDate: { type: Date },
  isFeatured: { type: Boolean, default: false },
  slug: { type: String },
  coverImage: { type: String },
  gallery: [{ type: String }],
  techStack: [{ type: String }],
  githubLink: { type: String },
  liveLink: { type: String },
  architectureDiagram: { type: String },
  impact: { type: String },
  collaborators: [{ type: String }],
  lessonsLearned: { type: String },
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


// --- SCHEDULE SCHEMA (Planner entries / Calendar) ---
const ScheduleSchema = new Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date },
  projectId: { type: Schema.Types.ObjectId, ref: "Project" },
  notes: { type: String },
  visibility: { type: String, enum: ["public", "private"], default: "private" },
  isRecurring: { type: Boolean, default: false },
  recurrence: { type: String, enum: ["none", "daily", "weekly", "monthly"], default: "none" },
  colorCode: { type: String, enum: ["slate", "sky", "emerald", "amber", "rose", "violet"], default: "sky" },
  createdAt: { type: Date, default: Date.now },
  location: { type: String },
  meetingLink: { type: String },
  attendees: [{ type: String }],
  status: { type: String, enum: ["scheduled", "completed", "cancelled", "rescheduled"], default: "scheduled" },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  agenda: { type: String },
  reminderMinutes: { type: Number },
  isAllDay: { type: Boolean, default: false },
  eventType: { type: String },
  tags: [{ type: String }]
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
  order: { type: Number, default: 0 },
  deadline: { type: Date },
  dateApplied: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  recruiterName: { type: String },
  recruiterEmail: { type: String },
  companyUrl: { type: String },
  location: { type: String },
  workModel: { type: String, enum: ["remote", "hybrid", "onsite"], default: "remote" },
  interviews: { type: Number, default: 0 },
  feedback: { type: String },
  offerDetails: { type: String },
  benefits: [{ type: String }],
  referral: { type: String },
});


// --- 9. MESSAGE SCHEMA (Contact Form) ---
const MessageSchema = new Schema({
  senderName: { type: String, required: true },
  senderContact: { type: String, required: true }, // Email or Phone
  content: { type: String, required: true },
  priority: { type: String, enum: ["low", "high", "emergency"], default: "low" },
  isRead: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});



// --- 10. SNIPPET SCHEMA (The Arsenal) ---
const SnippetSchema = new Schema({
  title: { type: String, required: true },
  language: { type: String, required: true }, // e.g., 'tsx', 'python'
  code: { type: String, required: true },
  tags: [{ type: String }],
  folder: { type: String, default: "General" },
  order: { type: Number, default: 0 },
  isCopied: { type: Number, default: 0 },
  description: { type: String },
  useCase: { type: String },
  complexity: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  author: { type: String },
  lastTestedVersion: { type: String },
  dependencies: [{ type: String }],
  relatedSnippets: [{ type: String }],
  performanceNotes: { type: String },
  securityNotes: { type: String },
  isDeprecated: { type: Boolean, default: false },
});


// --- 11. PROFILE SCHEMA (Singleton) ---
const ProfileSchema = new Schema({
  name: { type: String, default: "Jeevant" },
  title: { type: String, default: "Full Stack Engineer" },
  stats: [{
    label: { type: String, required: true },
    value: { type: String, required: true }
  }],
  githubUsername: { type: String, default: "Jeevant010" },
  resumeLink: { type: String, default: "#" },
  avatarUrl: { type: String, default: "https://github.com/Jeevant010.png" },
  status: { type: String, default: "Available for Hire" },
  updatedAt: { type: Date, default: Date.now },
  bio: { type: String },
  location: { type: String },
  email: { type: String },
  phone: { type: String },
  linkedinUrl: { type: String },
  twitterUrl: { type: String },
  website: { type: String },
  currentFocus: { type: String },
  availability: { type: String },
  skillsExperience: [{ 
    skill: { type: String }, 
    years: { type: Number },
    category: { type: String } // e.g., 'AI', 'Web Dev'
  }]
});

// --- 12. RESUME SCHEMA ---
const ResumeSchema = new Schema({
  title: { type: String, required: true },
  domain: { type: String, required: true },
  content: { type: String },
  pdfUrl: { type: String },
  skills: [{ type: String }],
  isPrimary: { type: Boolean, default: false },
  layoutTheme: { type: String, enum: ["tactical", "minimal", "creative"], default: "tactical" },
  createdAt: { type: Date, default: Date.now }
});

export const Profile = models.Profile || model("Profile", ProfileSchema);
export const Snippet = models.Snippet || model("Snippet", SnippetSchema);
export const Message = models.Message || model("Message", MessageSchema);
export const Application = models.Application || model("Application", ApplicationSchema);
export const Experience = models.Experience || model("Experience", ExperienceSchema);
export const Achievement = models.Achievement || model("Achievement", AchievementSchema);
export const Certificate = models.Certificate || model("Certificate", CertificateSchema);
// Use "models.ModelName" || model("ModelName", schema) to prevent overwrite errors in Next.js
export const Project = models.Project || model("Project", ProjectSchema);
export const Task = models.Task || model("Task", TaskSchema);
export const Note = models.Note || model("Note", NoteSchema);
export const Learning = models.Learning || model("Learning", LearningSchema);
export const Schedule = models.Schedule || model("Schedule", ScheduleSchema);
export const Resume = models.Resume || model("Resume", ResumeSchema);