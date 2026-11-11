import mongoose, { Schema, models, model } from "mongoose";

function retentionSeconds(envKey: string, fallbackDays: number): number {
  const days = Number(process.env[envKey]);
  const safe = Number.isFinite(days) && days > 0 ? days : fallbackDays;
  return Math.round(safe * 24 * 60 * 60);
}

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
  reminderPushedAt: { type: Date },
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
  }],
  socialLinks: [{
    platform: { type: String },
    url: { type: String }
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

// --- 13. VOICE CAPTURE SCHEMA (Comm Center / Voice Inbox) ---
// A raw voice note, its transcript, and every AI-generated artifact derived from it.
const VoiceDraftSchema = new Schema(
  {
    kind: { type: String, enum: ["email", "linkedin", "youtube", "whatsapp", "twitter", "generic"], default: "generic" },
    title: { type: String, default: "" },
    body: { type: String, default: "" },
    meta: { type: Schema.Types.Mixed },
  },
  { _id: true }
);

const CalendarBlockSchema = new Schema(
  {
    title: { type: String, default: "" },
    start: { type: Date },
    end: { type: Date },
    notes: { type: String },
  },
  { _id: true }
);

const TaskSuggestionSchema = new Schema(
  {
    title: { type: String, default: "" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  },
  { _id: true }
);

const VoiceCaptureSchema = new Schema({
  transcript: { type: String, default: "" },
  durationSec: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["captured", "transcribing", "drafting", "ready", "failed"],
    default: "captured",
  },
  intent: { type: String, enum: ["email", "content", "schedule", "mixed"], default: "mixed" },
  drafts: [VoiceDraftSchema],
  calendarBlocks: [CalendarBlockSchema],
  taskSuggestions: [TaskSuggestionSchema],
  provider: {
    whisper: { type: String, default: "" },
    llm: { type: String, default: "" },
  },
  simulated: { type: Boolean, default: false },
  error: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// --- 14. CONTENT POST SCHEMA (Studio: write once, distribute everywhere) ---
const DispatchResultSchema = new Schema(
  {
    channel: { type: String, default: "" },
    ok: { type: Boolean, default: false },
    mode: { type: String, default: "" }, // webhook | direct | link | clipboard | manual | queued
    url: { type: String, default: "" },
    detail: { type: String, default: "" },
    at: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ContentPostSchema = new Schema({
  title: { type: String, default: "" },
  body: { type: String, required: true },
  summary: { type: String, default: "" },
  source: { type: String, enum: ["manual", "voice", "ai"], default: "manual" },
  voiceCaptureId: { type: Schema.Types.ObjectId, ref: "VoiceCapture" },
  channels: [{ type: String }],
  status: { type: String, enum: ["draft", "queued", "published", "failed"], default: "draft" },
  scheduledAt: { type: Date },
  publishedAt: { type: Date },
  dispatch: [DispatchResultSchema],
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// --- 15. SETTING SCHEMA (Non-secret runtime config editable from the Integrations page) ---
const SettingSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed },
  updatedAt: { type: Date, default: Date.now },
});

// --- 16. MEMORY SCHEMA (long-term assistant memory) ---
const MemorySchema = new Schema({
  text: { type: String, required: true },
  tags: [{ type: String }],
  source: { type: String, enum: ["agent", "voice", "manual"], default: "agent" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// --- 17. JOB SCHEMA (background worker queue) ---
const JobSchema = new Schema({
  type: { type: String, required: true },
  payload: { type: Schema.Types.Mixed },
  status: { type: String, enum: ["queued", "running", "done", "failed"], default: "queued" },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 3 },
  runAt: { type: Date, default: Date.now },
  lastError: { type: String },
  result: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// --- 18. APPROVAL SCHEMA (human-in-the-loop guardrail) ---
const ApprovalSchema = new Schema({
  kind: { type: String, enum: ["email", "post", "calendar", "whatsapp", "sms", "call", "http", "mcp", "delete", "generic"], default: "generic" },
  title: { type: String, required: true },
  detail: { type: String },
  payload: { type: Schema.Types.Mixed },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "executed", "needs_action", "failed"],
    default: "pending",
  },
  result: { type: String },
  createdAt: { type: Date, default: Date.now },
  decidedAt: { type: Date },
});

// --- 19. WORKFLOW SCHEMA (in-app n8n alternative) ---
const WorkflowStepSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["agent", "task", "note", "post", "email", "calendar", "http"],
      required: true,
    },
    config: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: true }
);

const WorkflowSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  enabled: { type: Boolean, default: true },
  trigger: { type: String, enum: ["manual", "schedule", "webhook"], default: "manual" },
  intervalMinutes: { type: Number, default: 0 },
  webhookKey: { type: String, unique: true, sparse: true },
  steps: [WorkflowStepSchema],
  lastRunAt: { type: Date },
  lastResult: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// --- 21. WORKFLOW RUN SCHEMA (per-step history and retries) ---
const WorkflowRunStepSchema = new Schema(
  {
    type: { type: String },
    ok: { type: Boolean, default: false },
    result: { type: String, default: "" },
    attempts: { type: Number, default: 1 },
  },
  { _id: false }
);

const WorkflowRunSchema = new Schema({
  workflowId: { type: Schema.Types.ObjectId, ref: "Workflow", required: true },
  workflowName: { type: String, default: "" },
  status: { type: String, enum: ["success", "failed"], default: "success" },
  steps: [WorkflowRunStepSchema],
  startedAt: { type: Date, default: Date.now },
  finishedAt: { type: Date },
});

// --- 23. CHANNEL ACCOUNT SCHEMA (multi-account credentials) ---
const ChannelAccountSchema = new Schema({
  channel: {
    type: String,
    enum: ["whatsapp", "sms", "call", "telegram", "email", "discord", "slack", "mastodon", "twitter", "linkedin", "reddit"],
    required: true,
  },
  label: { type: String, required: true },
  config: { type: Schema.Types.Mixed, default: {} }, // phoneNumberId, fromNumber, chatId, sender
  secrets: { type: Schema.Types.Mixed, default: {} }, // tokens — server-only, never sent to the browser
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// --- 21b. CONNECTOR SCHEMA (MCP / OpenAPI dynamic tools) ---
// Tools and credentials live server-side. The browser only ever sees the
// public metadata (name, kind, tool list, status); secrets are sealed.
const ConnectorToolSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    inputSchema: { type: Schema.Types.Mixed },
    risk: { type: String, enum: ["read", "write", "external", "destructive"], default: "external" },
    method: { type: String },
    path: { type: String },
    queryParams: [{ type: String }],
    bodyMode: { type: String, enum: ["none", "object", "value"], default: "none" },
  },
  { _id: false }
);

const ConnectorSchema = new Schema({
  name: { type: String, required: true, unique: true, lowercase: true, trim: true },
  kind: { type: String, enum: ["mcp", "openapi"], default: "mcp" },
  url: { type: String, required: true },
  baseUrl: { type: String, default: "" },
  authType: { type: String, enum: ["none", "bearer", "header"], default: "none" },
  authHeader: { type: String, default: "" },
  secrets: { type: Schema.Types.Mixed, default: {} }, // AES-GCM envelope, never returned
  enabled: { type: Boolean, default: true },
  risk: { type: String, enum: ["read", "write", "external", "destructive"], default: "external" },
  tools: { type: [ConnectorToolSchema], default: [] },
  lastSyncedAt: { type: Date },
  lastError: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// --- 22. OUTBOUND MESSAGE SCHEMA (WhatsApp / SMS / calls log) ---
const OutboundMessageSchema = new Schema({
  channel: { type: String, enum: ["whatsapp", "sms", "call"], required: true },
  to: { type: String, required: true },
  body: { type: String, default: "" },
  status: { type: String, enum: ["queued", "sent", "link", "manual", "failed"], default: "queued" },
  mode: { type: String, default: "" },
  provider: { type: String, default: "" },
  detail: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});
OutboundMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: retentionSeconds("RETENTION_OUTBOUND_DAYS", 180) });

// --- 20. CHAT MESSAGE SCHEMA (short-term conversation memory) ---
const ChatMessageSchema = new Schema({
  thread: { type: String, default: "main" },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  provider: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});
ChatMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: retentionSeconds("RETENTION_CHAT_DAYS", 90) });

// --- 24. AUDIT LOG SCHEMA (every external-action decision) ---
const AuditLogSchema = new Schema({
  action: { type: String, required: true },
  target: { type: String, default: "" },
  decision: { type: String, enum: ["approval", "blocked", "executed", "failed"], default: "approval" },
  reason: { type: String, default: "" },
  meta: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: retentionSeconds("RETENTION_AUDIT_DAYS", 180) });

// --- 25. CONTACT SCHEMA (name -> number/address resolution) ---
const ContactSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, default: "" },
  whatsapp: { type: String, default: "" },
  email: { type: String, default: "" },
  instagram: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

// --- 26. STYLE PROFILE (how the owner writes) ---
const StyleProfileSchema = new Schema({
  samples: [{ type: String }],
  guide: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now },
});

// --- 27. TEMPLATE (copy-paste replies and posts) ---
const TemplateSchema = new Schema({
  name: { type: String, required: true },
  kind: { type: String, enum: ["email", "linkedin", "whatsapp", "post", "reply", "meeting", "other"], default: "other" },
  body: { type: String, required: true },
  tags: [{ type: String }],
  usageCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// --- 28. ACTIVITY (time tracking) ---
const ActivitySchema = new Schema({
  kind: {
    type: String,
    enum: ["deep_work", "meeting", "eating", "sleep", "exercise", "waste", "break", "other"],
    default: "other",
  },
  label: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date },
  intended: { type: Boolean, default: true },
  notes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

// --- 29. FOCUS SESSION (anti-waste check-ins) ---
const FocusSessionSchema = new Schema({
  intent: { type: String, required: true },
  status: { type: String, enum: ["active", "done", "abandoned"], default: "active" },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  checkIns: [
    {
      at: { type: Date, default: Date.now },
      answer: { type: String, default: "" },
      wasted: { type: Boolean, default: false },
      _id: false,
    },
  ],
  distractions: [{ label: String, at: Date, _id: false }],
});

// --- 30. CODING JOB (phone → sandbox → diff → approval → PR) ---
const CodingJobSchema = new Schema({
  repoKey: { type: String, required: true },
  repoSlug: { type: String, default: "" },
  prompt: { type: String, required: true },
  files: [{ type: String }],
  status: {
    type: String,
    enum: ["queued", "running", "needs_review", "approved", "rejected", "failed"],
    default: "queued",
  },
  branch: { type: String, default: "" },
  summary: { type: String, default: "" },
  diff: { type: String, default: "" },
  changedFiles: [{ type: String }],
  commitMode: { type: String, enum: ["per-file", "bulk"], default: "per-file" },
  commits: [{ type: String }],
  testCommand: { type: String, default: "" },
  testOk: { type: Boolean },
  testOutput: { type: String, default: "" },
  logs: { type: String, default: "" },
  error: { type: String, default: "" },
  prUrl: { type: String, default: "" },
  workDir: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// --- 31. ACTION TOKEN (signed single-use or reusable bridge links) ---
const ActionTokenSchema = new Schema({
  tokenHash: { type: String, required: true, unique: true, index: true },
  hint: { type: String, default: "" },
  action: { type: String, required: true },
  args: { type: Schema.Types.Mixed, default: {} },
  label: { type: String, default: "" },
  status: { type: String, enum: ["active", "exhausted", "revoked"], default: "active" },
  maxUses: { type: Number, default: 1, min: 0 },
  uses: { type: Number, default: 0, min: 0 },
  expiresAt: { type: Date, required: true },
  lastUsedAt: { type: Date },
  result: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});
ActionTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// --- 31. PUSH SUBSCRIPTION (Web Push / VAPID) ---
const PushSubscriptionSchema = new Schema({
  endpoint: { type: String, required: true, unique: true },
  p256dh: { type: String, required: true },
  auth: { type: String, required: true },
  userAgent: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  lastUsedAt: { type: Date },
});

// --- 32. RATE LIMIT BUCKET (distributed limiter) ---
const RateLimitBucketSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  resetAt: { type: Date, required: true },
});
RateLimitBucketSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

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
export const VoiceCapture = models.VoiceCapture || model("VoiceCapture", VoiceCaptureSchema);
export const ContentPost = models.ContentPost || model("ContentPost", ContentPostSchema);
export const Setting = models.Setting || model("Setting", SettingSchema);
export const Memory = models.Memory || model("Memory", MemorySchema);
export const Job = models.Job || model("Job", JobSchema);
export const Approval = models.Approval || model("Approval", ApprovalSchema);
export const Workflow = models.Workflow || model("Workflow", WorkflowSchema);
export const WorkflowRun = models.WorkflowRun || model("WorkflowRun", WorkflowRunSchema);
export const ChatMessage = models.ChatMessage || model("ChatMessage", ChatMessageSchema);
export const OutboundMessage = models.OutboundMessage || model("OutboundMessage", OutboundMessageSchema);
export const ChannelAccount = models.ChannelAccount || model("ChannelAccount", ChannelAccountSchema);
export const Connector = models.Connector || model("Connector", ConnectorSchema);
export const AuditLog = models.AuditLog || model("AuditLog", AuditLogSchema);
export const Contact = models.Contact || model("Contact", ContactSchema);
export const StyleProfile = models.StyleProfile || model("StyleProfile", StyleProfileSchema);
export const Template = models.Template || model("Template", TemplateSchema);
export const Activity = models.Activity || model("Activity", ActivitySchema);
export const FocusSession = models.FocusSession || model("FocusSession", FocusSessionSchema);
export const CodingJob = models.CodingJob || model("CodingJob", CodingJobSchema);
export const ActionToken = models.ActionToken || model("ActionToken", ActionTokenSchema);
export const PushSubscription = models.PushSubscription || model("PushSubscription", PushSubscriptionSchema);
export const RateLimitBucket = models.RateLimitBucket || model("RateLimitBucket", RateLimitBucketSchema);