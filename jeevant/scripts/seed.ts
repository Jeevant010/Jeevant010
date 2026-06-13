import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

// ─── Schemas (inline to avoid Next.js module issues) ───

const ProjectSchema = new mongoose.Schema({
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
  createdAt: { type: Date, default: Date.now },
});

const ExperienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  description: { type: String },
  skillsUsed: [{ type: String }],
  logoUrl: { type: String },
  type: { type: String, enum: ["internship", "full-time", "freelance"], default: "internship" },
});

const AchievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  platform: { type: String },
  date: { type: Date, default: Date.now },
  proofLink: { type: String },
  description: { type: String },
  icon: { type: String, default: "trophy" },
  visibility: { type: String, enum: ["public", "private"], default: "public" },
});

const CertificateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuer: { type: String, required: true },
  issueDate: { type: Date },
  expiryDate: { type: Date },
  credentialId: { type: String },
  url: { type: String },
});

const LearningSchema = new mongoose.Schema({
  title: { type: String, required: true },
  platform: { type: String },
  url: { type: String },
  totalModules: { type: Number, default: 0 },
  completedModules: { type: Number, default: 0 },
  visibility: { type: String, enum: ["public", "private"], default: "private" },
  status: { type: String, enum: ["not-started", "in-progress", "completed"], default: "not-started" },
  type: { type: String, enum: ["book", "paper", "course", "guide"], default: "course" },
});

const NoteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: "" },
  tags: [{ type: String }],
  visibility: { type: String, enum: ["public", "private"], default: "private" },
  isPinned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ProfileSchema = new mongoose.Schema({
  name: { type: String, default: "Jeevant" },
  title: { type: String, default: "Full Stack Engineer" },
  level: { type: Number, default: 1 },
  leetcodeRating: { type: Number, default: 0 },
  githubUsername: { type: String, default: "Jeevant010" },
  resumeLink: { type: String, default: "#" },
  avatarUrl: { type: String, default: "https://github.com/Jeevant010.png" },
  status: { type: String, default: "Available for Hire" },
  updatedAt: { type: Date, default: Date.now },
});

const ScheduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date },
  notes: { type: String },
  visibility: { type: String, enum: ["public", "private"], default: "private" },
  colorCode: { type: String, enum: ["slate", "sky", "emerald", "amber", "rose", "violet"], default: "sky" },
  createdAt: { type: Date, default: Date.now },
});

// ─── Models ───
const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
const Experience = mongoose.models.Experience || mongoose.model("Experience", ExperienceSchema);
const Achievement = mongoose.models.Achievement || mongoose.model("Achievement", AchievementSchema);
const Certificate = mongoose.models.Certificate || mongoose.model("Certificate", CertificateSchema);
const Learning = mongoose.models.Learning || mongoose.model("Learning", LearningSchema);
const Note = mongoose.models.Note || mongoose.model("Note", NoteSchema);
const Profile = mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
const Schedule = mongoose.models.Schedule || mongoose.model("Schedule", ScheduleSchema);

// ═══════════════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════════════

function slug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const PROJECTS = [
  // ─── PUBLIC ───
  { title: "AdaptiveGrade", description: "AI-powered adaptive grading platform with 50+ beta users and 100% server uptime. SSIP 2.0 grant funded.", techStack: ["Next.js", "AI/ML", "MongoDB", "Python"], repoLink: "", liveLink: "", startDate: new Date("2025-10-01"), isOngoing: true, visibility: "public", status: "live" },
  { title: "Decentralized Land Registry (Land Trust)", description: "Blockchain-based land registration using ERC-721 & ERC-1155 tokens. UDBHAV Inter-IIIT Hackathon finalist project.", techStack: ["Ethereum", "Hardhat", "Next.js", "Solidity", "ERC-721", "ERC-1155"], repoLink: "", liveLink: "", startDate: new Date("2026-01-01"), endDate: new Date("2026-02-28"), visibility: "public", status: "live" },
  { title: "AI Engine for Unreal Engine 5", description: "MCP-powered AI engine integrating with Unreal Engine 5 for intelligent game behaviors.", techStack: ["Unreal Engine 5", "MCP", "Python"], repoLink: "", liveLink: "", startDate: new Date("2026-03-01"), isOngoing: true, visibility: "public", status: "live" },
  { title: "RAG FastAPI Microservice", description: "Retrieval-Augmented Generation pipeline using LangChain + FAISS for semantic search and grounded QA over documents.", techStack: ["FastAPI", "Python", "LangChain", "FAISS", "RAG"], repoLink: "", liveLink: "", startDate: new Date("2026-02-01"), endDate: new Date("2026-04-30"), visibility: "public", status: "live" },
  { title: "Local AI Stack & Generative Transformer", description: "Local inference setup with Ollama, DeepSeek, Groq. Includes from-scratch transformer experiments.", techStack: ["Ollama", "DeepSeek", "Groq", "Python", "PyTorch"], repoLink: "", liveLink: "", startDate: new Date("2026-01-01"), isOngoing: true, visibility: "public", status: "live" },
  { title: "Resume Parser", description: "End-to-end NLP pipeline for automated extraction of candidate details from PDF/DOCX with 92%+ accuracy.", techStack: ["Python", "SpaCy", "Scikit-Learn", "NLP"], repoLink: "https://github.com/Jeevant010/Resume_Parser", liveLink: "", startDate: new Date("2025-06-01"), endDate: new Date("2025-08-31"), visibility: "public", status: "live" },
  { title: "WasteSortAI (EcoSort AI)", description: "MERN-based web app for waste sorting/segregation workflows with ML classification and secure backend.", techStack: ["Python", "ML", "MERN", "Computer Vision"], repoLink: "", liveLink: "", startDate: new Date("2025-11-01"), endDate: new Date("2026-01-31"), visibility: "public", status: "live" },

  // ─── PRIVATE ───
  { title: "AI Summarizer", description: "Abstractive/extractive document summarizer using T5/BART transformers. Deployed on HuggingFace Spaces.", techStack: ["Transformers", "T5", "BART", "HuggingFace", "Streamlit"], repoLink: "https://github.com/Jeevant010/AI_Summarizer", liveLink: "", startDate: new Date("2024-06-01"), endDate: new Date("2025-08-31"), visibility: "private", status: "live" },
  { title: "Tournament Management Platform (CoC) v2", description: "Second version — separated from Spring Fiesta website. Clash of Clans tournament management system.", techStack: ["Next.js", "MongoDB", "Tailwind"], repoLink: "", liveLink: "", startDate: new Date("2025-11-01"), endDate: new Date("2025-12-31"), visibility: "private", status: "live" },
  { title: "Spring Fiesta 2026 Website", description: "Official event website for IIIT Surat's Spring Fiesta 2026 with database-driven content and admin panel.", techStack: ["Next.js", "React", "MongoDB"], repoLink: "", liveLink: "", startDate: new Date("2026-01-01"), endDate: new Date("2026-02-28"), visibility: "private", status: "live" },
  { title: "Home Security System", description: "Arduino-based home security system with sensors and alerts.", techStack: ["Arduino Uno", "C"], repoLink: "", liveLink: "", startDate: new Date("2023-08-01"), endDate: new Date("2023-09-30"), visibility: "private", status: "stopped" },
  { title: "Tours & Travels", description: "MERN stack travel booking platform for trains, flights, hotels. SE subject project.", techStack: ["MERN Stack"], repoLink: "", liveLink: "", startDate: new Date("2025-01-01"), endDate: new Date("2025-05-31"), visibility: "private", status: "stopped" },
  { title: "Acoustic Gunshot Detection", description: "ML-based acoustic gunshot detection system using signal processing techniques.", techStack: ["Python", "ML", "Signal Processing"], repoLink: "", liveLink: "", startDate: new Date("2026-04-01"), isOngoing: true, visibility: "private", status: "building" },
  { title: "Portfolio Website (Jeevant)", description: "Personal portfolio with cyberpunk terminal design, MongoDB CMS, RPG character sheet, and admin panel.", techStack: ["Next.js", "React", "MongoDB", "Tailwind"], repoLink: "", liveLink: "https://jeevant010.vercel.app", startDate: new Date("2026-06-01"), isOngoing: true, visibility: "private", status: "live" },
  { title: "M-Mart (E-commerce)", description: "Multi-vendor marketplace with secure checkout, RBAC, payment gateway, admin panel for inventory and lending.", techStack: ["MERN", "Secure Payments", "RBAC"], repoLink: "https://github.com/RakeshParkash/M_Mart", liveLink: "https://m-mart-eight.vercel.app", startDate: new Date("2025-06-01"), endDate: new Date("2025-07-31"), visibility: "private", status: "live" },
  { title: "GGSports", description: "Sports analytics hub with ML-based predictions, live score dashboards, and GitLab CI/CD pipeline.", techStack: ["MERN", "AI/ML", "GitLab CI/CD"], repoLink: "https://github.com/Jeevant010/GGStats", liveLink: "", startDate: new Date("2025-06-01"), isOngoing: true, visibility: "private", status: "live" },
  { title: "Spotify Clone", description: "Full-stack music streaming platform with playlists, authentication, and playback features.", techStack: ["MERN Stack"], repoLink: "", liveLink: "", startDate: new Date("2025-05-01"), endDate: new Date("2025-06-30"), visibility: "private", status: "stopped" },
  { title: "Wedding Website", description: "RSVP-enabled wedding portal with dynamic guest management. Deployed on Vercel.", techStack: ["MERN Stack"], repoLink: "", liveLink: "https://wedding-web-gold.vercel.app", startDate: new Date("2025-06-01"), endDate: new Date("2025-07-31"), visibility: "private", status: "stopped" },
  { title: "CrowdStats dApp", description: "Fintech dApp for crowd statistics with blockchain integration and real-time analytics. Built at Surreal Hackathon.", techStack: ["Blockchain", "Real-time Analytics", "JavaScript"], repoLink: "", liveLink: "", startDate: new Date("2025-06-01"), endDate: new Date("2025-06-30"), visibility: "private", status: "stopped" },
  { title: "Star Wars Cinematic Scene", description: "Cinematic sequence featuring Stormtrooper spaceship and Darth Vader entry using UE5 lighting and materials.", techStack: ["Unreal Engine 5", "Lighting", "Material Shaders"], repoLink: "", liveLink: "", startDate: new Date("2025-01-01"), endDate: new Date("2025-06-30"), visibility: "private", status: "stopped" },
  { title: "Third-Person Shooter Game", description: "Immersive shooter game with AI enemies and dynamic maps. 4th semester team project.", techStack: ["Unreal Engine 5", "C++", "Blueprints"], repoLink: "", liveLink: "", startDate: new Date("2025-01-01"), endDate: new Date("2025-05-31"), visibility: "private", status: "stopped" },
  { title: "The Secret Level", description: "Open-world adventure game with realistic terrains, AI-driven NPCs, shooting, driving, and exploration.", techStack: ["Unreal Engine 5", "C++", "AI NPCs"], repoLink: "", liveLink: "", startDate: new Date("2025-06-01"), isOngoing: true, visibility: "private", status: "building" },
  { title: "Bigram Pipeline (NLP)", description: "Converting exploratory notebooks for n-gram language modeling into modular production-ready pipelines with CI.", techStack: ["PyTorch", "CI", "Python"], repoLink: "https://github.com/Jeevant010/Bigram", liveLink: "", startDate: new Date("2026-01-01"), isOngoing: true, visibility: "private", status: "building" },
  { title: "Mini GPT (Transformer from Scratch)", description: "From-scratch transformer blocks in PyTorch for competitive exam QA datasets with custom tokenization.", techStack: ["PyTorch", "Transformers", "Python"], repoLink: "https://github.com/Jeevant010/Mini_Generative_Pretrained_Transformer", liveLink: "", startDate: new Date("2026-01-01"), isOngoing: true, visibility: "private", status: "building" },
  { title: "BookModel (LangChain/GenAI)", description: "LangChain-based GenAI app for book-focused querying/workflows. Deployed on HuggingFace Spaces.", techStack: ["LangChain", "GenAI", "HuggingFace"], repoLink: "", liveLink: "", startDate: new Date("2026-01-01"), endDate: new Date("2026-03-31"), visibility: "private", status: "live" },
  { title: "Inventory Management System", description: "CRUD for items, categories, stock levels, and supplier management with admin routes and activity logs.", techStack: ["MERN Stack"], repoLink: "https://github.com/Jeevant010/Inventory_management", liveLink: "https://inventory-management-lovat-seven.vercel.app", startDate: new Date("2025-06-01"), endDate: new Date("2025-12-31"), visibility: "private", status: "live" },
];

const EXPERIENCES = [
  { company: "Astra3D — Reealtech Pvt Ltd", role: "Backend Developer", startDate: new Date("2026-06-01"), description: "Current internship — backend development for Astra3D platform.", skillsUsed: ["Node.js", "Express", "MongoDB", "REST APIs"], type: "internship" },
  { company: "AICTE — SmartBridge", role: "ServiceNow Intern (Cohort 3)", startDate: new Date("2025-09-01"), endDate: new Date("2025-11-30"), description: "Built workflow automation on ServiceNow: custom tables, forms, flows, business rules, ACLs. Practiced SDLC-style documentation/testing. Completed CSA Exam Prep, ATF Essentials, Agentic AI module.", skillsUsed: ["ServiceNow", "JavaScript", "Glide", "ACLs", "SDLC"], type: "internship" },
  { company: "1M1B + AICTE + IBM SkillsBuild", role: "AI for Sustainability Intern", startDate: new Date("2025-12-08"), endDate: new Date("2026-01-19"), description: "Trained in Responsible AI and sustainability concepts aligned with UN SDGs. Implemented agentic AI and RAG workflows for structured problem-solving.", skillsUsed: ["AI/ML", "RAG", "Agentic AI", "IBM Granite", "Python"], type: "internship" },
  { company: "Edunet Foundation + AICTE + IBM SkillsBuild", role: "Employability Skills & Digital Literacy with AI Intern", startDate: new Date("2025-11-14"), endDate: new Date("2025-12-26"), description: "6-week program focused on employability skills, digital literacy, and AI fundamentals through guided training and assessments.", skillsUsed: ["AI Fundamentals", "Digital Literacy", "IBM SkillsBuild"], type: "internship" },
  { company: "Google Developer Groups — IIIT Surat", role: "GDG AI/ML Lead & Tech Event Lead", startDate: new Date("2025-08-01"), description: "Led AI/ML learning tracks and mentorship. Conducted technical interviews for Junior Developer/Creator teams. Hosted/led PromptCraft, REIMAGINATION, WebXperience, Innov-AI-Thon, Dev Heat Hackathon. Won 1st place in CTF.", skillsUsed: ["AI/ML", "Leadership", "Event Management", "Technical Interviewing"], type: "full-time" },
  { company: "IIIT Surat", role: "Technical Coordinator — Spring Fiesta 2026", startDate: new Date("2026-02-01"), endDate: new Date("2026-02-14"), description: "Coordinated 5 technical events during Spring Fiesta 2026.", skillsUsed: ["Event Coordination", "Team Management"], type: "freelance" },
  { company: "IIIT Surat", role: "4th Convocation Coordinator", startDate: new Date("2025-10-15"), endDate: new Date("2025-10-15"), description: "Logistics and guest coordination for 300+ attendees. Single-day event.", skillsUsed: ["Logistics", "Event Coordination"], type: "freelance" },
  { company: "GDG — IIIT Surat", role: "Node.js & Express Instructor (ICT-II)", startDate: new Date("2026-05-01"), endDate: new Date("2026-05-31"), description: "Teaching workshop on Node.js and Express.js fundamentals.", skillsUsed: ["Node.js", "Express", "Teaching"], type: "freelance" },
];

const ACHIEVEMENTS = [
  { title: "UDBHAV Inter-IIIT Hackathon — Finalist (Land Trust)", platform: "Hackathon", date: new Date("2026-01-15"), description: "Represented IIIT Surat with Decentralized Land Registry project.", visibility: "public" },
  { title: "HackOdisha 4.0 — Finalist, Top 5% Nationally", platform: "Hackathon", date: new Date("2024-10-15"), description: "Built fintech dApp for crowd statistics and secure transactions at NIT Rourkela.", visibility: "public" },
  { title: "Surreal Hackathon — CrowdStats dApp, 100+ Users", platform: "Hackathon", date: new Date("2025-06-15"), description: "Built CrowdStats dApp with blockchain integration and real-time analytics.", visibility: "public" },
  { title: "Smart India Hackathon (SIH) — College Round Cleared", platform: "Hackathon", date: new Date("2024-09-15"), description: "Cleared college-level selection for Smart India Hackathon.", visibility: "public" },
  { title: "Flipkart Grid 6.0 — Level 1 Quiz (Software Dev Track)", platform: "Competition", date: new Date("2024-08-15"), description: "Participated in Level 1 E-Commerce & Tech Quiz.", visibility: "public" },
  { title: "Flipkart Grid 7.0 — Invited Participant", platform: "Competition", date: new Date("2025-07-15"), description: "Invitation considered as certificate.", visibility: "public" },
  { title: "Naukri.com Rounds of Honor — 2nd Final Round (×2 attempts)", platform: "Competition", date: new Date("2024-06-15"), description: "Participated twice. First time internet issues. Second time reached 2nd final round.", visibility: "public" },
  { title: "Cognizant Hackathon — Participant", platform: "Hackathon", date: new Date("2026-05-15"), description: "Participated in Cognizant hackathon.", visibility: "public" },
  { title: "CTF (Capture the Flag) — 1st Rank, 50pt Clutch Victory", platform: "Competition", date: new Date("2026-02-14"), description: "Won 1st place in CTF competition with a clutch 50-point victory.", visibility: "public" },
  { title: "Innovision'25 NSUT — Pixel Pursuit 3rd Place", platform: "Competition", date: new Date("2025-11-17"), description: "3rd place in Pixel Pursuit at Innovision'25, NSUT.", visibility: "public" },
  { title: "Adobe India Hackathon — Round 1 Cleared (MCQ + Coding)", platform: "Competition", date: new Date("2025-06-15"), description: "Team SecretFlame cleared Round 1 Online MCQ + Coding assessment.", visibility: "public" },
  { title: "L'Oréal Sustainability Challenge — Aptitude Assessment", platform: "Competition", date: new Date("2025-06-15"), description: "Team Secret Flame participated in online aptitude assessment.", visibility: "public" },
  { title: "Tata Crucible Campus Quiz 2025", platform: "Competition", date: new Date("2025-06-15"), description: "Participated in Tata Crucible Campus Quiz organized by Tata Group.", visibility: "public" },
  { title: "Tata Imagination Challenge 2025", platform: "Competition", date: new Date("2025-06-15"), description: "Participated in Tata Quiz of Tata Imagination Challenge.", visibility: "public" },
  { title: "Build with India (Hack with India) — Team Hack Burner", platform: "Hackathon", date: new Date("2025-06-15"), description: "Participated in Build with India hackathon.", visibility: "public" },
  { title: "IIM Lucknow Inflection Point 5.0 — Innovate + Insightify", platform: "Case Competition", date: new Date("2025-06-15"), description: "Participated in Innovate (Product Management) and Insightify (Analytics) case competitions.", visibility: "public" },
  { title: "Embedathon 2024-25 — IEEE NITK + CAS Society", platform: "Competition", date: new Date("2025-01-15"), description: "Participated in embedded systems challenge organized by IEEE NITK.", visibility: "public" },
  { title: "NationBuilding Case Study Competition 2025", platform: "Competition", date: new Date("2025-01-05"), description: "Participated in online quiz of NationBuilding Case Study Competition.", visibility: "public" },
  { title: "AlgoUniversity Tech Fellowship — Stage 2 Qualified (Top 4k/20k+)", platform: "Fellowship", date: new Date("2024-06-15"), description: "Qualified Stage 2 of AlgoUniversity Tech Fellowship. Top 4,000 out of 20,000+ applicants.", visibility: "public" },
  { title: "SSIP 2.0 Grant — AdaptiveGrade (Govt of Gujarat)", platform: "Academic Grant", date: new Date("2026-03-25"), description: "SSIP 2.0 financial grant accepted for AdaptiveGrade startup. Team: Harsh Zadafiya, Jeevant, Deepesh Dangi. Mentor: Dr. Sudeep Sharma.", visibility: "public" },
  { title: "AdaptiveGrade Beta — 50+ Users, 100% Server Uptime", platform: "Product Launch", date: new Date("2026-04-15"), description: "Successfully launched beta with 50+ active users and maintained 100% uptime.", visibility: "public" },
  { title: "Open Source Society (DSO) — Founder", platform: "Community Building", date: new Date("2026-05-01"), description: "Founded the Developer Student Organization for open source at IIIT Surat.", visibility: "public" },
  { title: "LeetCode 200 Days Badge 2025", platform: "LeetCode", date: new Date("2025-09-01"), description: "200-day consistency streak on LeetCode.", visibility: "public" },
  { title: "LeetCode 50 Days Badge 2025", platform: "LeetCode", date: new Date("2025-04-01"), description: "50-day consistency streak on LeetCode.", visibility: "public" },
  { title: "Kaggle Badges — 3+ in Data Analysis & ML", platform: "Kaggle", date: new Date("2025-06-01"), description: "Earned 3+ badges in Data Analysis and ML challenges on Kaggle.", visibility: "public" },
  { title: "Unstop Quiz Series — 48 Certificates, Best Rank 218th", platform: "Competitive Quiz", date: new Date("2025-03-01"), description: "Participated in 48 daily quizzes across Management & Engineering Feb-Mar series. Best rank: 218th.", visibility: "private" },
  { title: "AWS India Summit 2026 (Virtual)", platform: "Event Attended", date: new Date("2026-05-01"), description: "Attended AWS India Summit 2026 virtually.", visibility: "public" },
  { title: "Vibrant Gujarat Surat (Offline)", platform: "Event Attended", date: new Date("2026-03-01"), description: "Attended Vibrant Gujarat event in Surat, offline.", visibility: "public" },
  // GDG Events Hosted
  { title: "PromptCraft — Event Hosted", platform: "Event Hosted", date: new Date("2025-10-01"), description: "Hosted PromptCraft event at GDG IIIT Surat.", visibility: "public" },
  { title: "REIMAGINATION — Event Hosted", platform: "Event Hosted", date: new Date("2025-11-01"), description: "Hosted REIMAGINATION event at GDG IIIT Surat.", visibility: "public" },
  { title: "WebXperience — Event Hosted", platform: "Event Hosted", date: new Date("2025-12-01"), description: "Hosted WebXperience web dev event at GDG IIIT Surat.", visibility: "public" },
  { title: "Innov-AI-Thon — Event Hosted", platform: "Event Hosted", date: new Date("2026-01-15"), description: "Hosted Innov-AI-Thon AI hackathon at GDG IIIT Surat.", visibility: "public" },
  { title: "Dev Heat Hackathon — Event Hosted", platform: "Event Hosted", date: new Date("2026-02-10"), description: "Hosted Dev Heat Hackathon during Spring Fiesta at IIIT Surat.", visibility: "public" },
];

const CERTIFICATES = [
  { name: "1M1B AI for Sustainability Internship Completion", issuer: "1M1B / AICTE / IBM SkillsBuild", issueDate: new Date("2026-02-10") },
  { name: "Edunet Employability Skills & Digital Literacy Completion", issuer: "Edunet Foundation / AICTE / IBM SkillsBuild", issueDate: new Date("2025-12-26") },
  { name: "SmartBridge ServiceNow Virtual Internship Completion", issuer: "SmartBridge / AICTE / ServiceNow", issueDate: new Date("2025-11-30") },
  { name: "IBM SkillsBuild: Edunet-Artificial Intelligence", issuer: "IBM SkillsBuild", issueDate: new Date("2025-12-28") },
  { name: "IBM SkillsBuild: Career Essentials A20", issuer: "IBM SkillsBuild", issueDate: new Date("2025-12-28") },
  { name: "IBM AI Fundamentals (Credly Badge)", issuer: "IBM SkillsBuild", issueDate: new Date("2025-12-28"), url: "https://www.credly.com/badges/739f5d83-d8f6-45d9-b7f6-79ff98cf0480" },
  { name: "IBM Career Management Essentials (Credly Badge)", issuer: "IBM SkillsBuild", issueDate: new Date("2025-12-28"), url: "https://www.credly.com/badges/6801c69e-ae87-4244-861a-6a74f58a4303" },
  { name: "Flipkart Grid 6.0 — Level 1 Quiz", issuer: "Flipkart", issueDate: new Date("2024-08-15") },
  { name: "Innovision'25 Pixel Pursuit 3rd Place", issuer: "NSUT", issueDate: new Date("2025-11-17"), credentialId: "17e1d8b0-4ac9-4ff5-a87a-2c8eb323dec2" },
  { name: "Dev Heat Hackathon Participation", issuer: "IIIT Surat / Spring Fiesta", issueDate: new Date("2026-02-10") },
  { name: "Tata Crucible Campus Quiz 2025", issuer: "Tata Group", issueDate: new Date("2025-06-15") },
  { name: "Tata Imagination Challenge 2025", issuer: "Tata Group", issueDate: new Date("2025-06-15") },
  { name: "Adobe India Hackathon — Round 1", issuer: "Adobe", issueDate: new Date("2025-06-15") },
  { name: "L'Oréal Sustainability Challenge", issuer: "L'Oréal", issueDate: new Date("2025-06-15") },
  { name: "Build with India", issuer: "Hack with India", issueDate: new Date("2025-06-15") },
  { name: "Embedathon 2024-25", issuer: "IEEE NITK + CAS Society", issueDate: new Date("2025-01-15") },
  { name: "SSIP 2.0 Acceptance Letter — AdaptiveGrade", issuer: "IIIT Surat / Govt of Gujarat", issueDate: new Date("2026-03-25") },
  { name: "NationBuilding Case Study Competition 2025", issuer: "NationBuilding", issueDate: new Date("2025-01-05") },
  { name: "IIM Lucknow — Innovate (Product Management)", issuer: "IIM Lucknow", issueDate: new Date("2025-06-15") },
  { name: "IIM Lucknow — Insightify (Analytics)", issuer: "IIM Lucknow", issueDate: new Date("2025-06-15") },
  { name: "Unstop Quiz Series (48 certificates consolidated)", issuer: "Unstop", issueDate: new Date("2025-03-01") },
  { name: "Unstop Talent Park 2025", issuer: "Unstop", issueDate: new Date("2025-06-15") },
  { name: "Cognizant Certificate", issuer: "Cognizant", issueDate: new Date("2026-05-15") },
];

const LEARNING = [
  { title: "Computer Networking: A Top-Down Approach — Jim Kurose", platform: "Book", status: "completed", type: "book", totalModules: 1, completedModules: 1, visibility: "public" },
  { title: "Hands-On Machine Learning — O'Reilly (Aurélien Géron)", platform: "Book", status: "completed", type: "book", totalModules: 1, completedModules: 1, visibility: "public" },
  { title: "Build a Large Language Model (From Scratch) — Sebastian Raschka", platform: "Book", status: "in-progress", type: "book", totalModules: 5, completedModules: 3, visibility: "public" },
  { title: "Attention Is All You Need (Vaswani et al., 2017)", platform: "Research Paper", status: "completed", type: "paper", totalModules: 1, completedModules: 1, visibility: "public" },
  { title: "A Survey of Large Language Models", platform: "Research Paper", status: "completed", type: "paper", totalModules: 1, completedModules: 1, visibility: "public" },
  { title: "Voronoi Approach for Sensor Node Coverage", platform: "Research Paper", status: "completed", type: "paper", totalModules: 1, completedModules: 1, visibility: "public" },
  { title: "Everyday Ethics for AI — IBM", platform: "IBM", status: "completed", type: "guide", totalModules: 1, completedModules: 1, visibility: "public" },
];

const NOTES = [
  { title: "Transformer Architecture — Key Takeaways", content: "The transformer architecture replaces recurrence with self-attention, enabling parallelization. Key concepts: multi-head attention, positional encoding, layer normalization. The 'Attention Is All You Need' paper introduced this in 2017, and it's now the backbone of GPT, BERT, T5, and every modern LLM.", tags: ["transformers", "attention", "NLP"], visibility: "public", isPinned: true },
  { title: "ERC-721 vs ERC-1155 — When to Use Which", content: "ERC-721: Each token is unique (1:1 NFTs, land deeds, identity). ERC-1155: Multi-token standard — can represent both fungible and non-fungible tokens in a single contract. Used ERC-1155 in Land Trust for batch transfers and gas efficiency. ERC-721 for unique property deeds.", tags: ["web3", "ethereum", "NFT", "solidity"], visibility: "public", isPinned: false },
  { title: "Local AI Deployment: Ollama vs API Costs", content: "Running models locally with Ollama + DeepSeek eliminates per-token API costs. Trade-off: need decent hardware (16GB+ RAM for 7B models). Groq provides fast inference via cloud but with rate limits. Best hybrid: local for development/experimentation, Groq for demo/production with caching.", tags: ["AI", "deployment", "local-inference", "ollama"], visibility: "public", isPinned: false },
];

const today = new Date();
const ymd = (d: Date) => d.toISOString().split("T")[0]; // YYYY-MM-DD

const yesterdayStr = ymd(new Date(today.getTime() - 86400000));
const todayStr = ymd(today);
const tomorrowStr = ymd(new Date(today.getTime() + 86400000));

const MOCK_SCHEDULE = [
  // --- YESTERDAY ---
  { title: "Client Discovery Call", start: new Date(`${yesterdayStr}T10:00:00Z`), end: new Date(`${yesterdayStr}T11:00:00Z`), notes: "Discussed AI integration for their new SaaS product.", visibility: "public", colorCode: "sky" as const },
  { title: "System Architecture Design", start: new Date(`${yesterdayStr}T13:00:00Z`), end: new Date(`${yesterdayStr}T15:30:00Z`), notes: "Drafted database schema and microservices layout.", visibility: "private", colorCode: "emerald" as const },
  { title: "Code Review & PR Merges", start: new Date(`${yesterdayStr}T16:00:00Z`), end: new Date(`${yesterdayStr}T17:30:00Z`), notes: "Merged 3 features into the main branch.", visibility: "public", colorCode: "violet" as const },

  // --- TODAY ---
  { title: "Daily Standup", start: new Date(`${todayStr}T09:00:00Z`), end: new Date(`${todayStr}T09:30:00Z`), notes: "Sync with the Astra3D team.", visibility: "public", colorCode: "amber" as const },
  { title: "Deep Work: Backend Optimization", start: new Date(`${todayStr}T10:00:00Z`), end: new Date(`${todayStr}T13:00:00Z`), notes: "Refactoring the RAG pipeline for 40% faster latency.", visibility: "public", colorCode: "emerald" as const },
  { title: "Lunch & Read", start: new Date(`${todayStr}T13:00:00Z`), end: new Date(`${todayStr}T14:00:00Z`), notes: "Reading 'Hands-On Machine Learning'.", visibility: "private", colorCode: "slate" as const },
  { title: "Open Source Contributions", start: new Date(`${todayStr}T14:30:00Z`), end: new Date(`${todayStr}T16:30:00Z`), notes: "Working on issues in the LangChain repo.", visibility: "public", colorCode: "sky" as const },
  { title: "Client Demo Prep", start: new Date(`${todayStr}T17:00:00Z`), end: new Date(`${todayStr}T18:00:00Z`), notes: "Preparing slides and environment for tomorrow's demo.", visibility: "private", colorCode: "rose" as const },
  { title: "Algorithm Practice", start: new Date(`${todayStr}T19:00:00Z`), end: new Date(`${todayStr}T20:30:00Z`), notes: "Solving LeetCode hard problems (Dynamic Programming).", visibility: "public", colorCode: "violet" as const },
  { title: "GDG Core Team Sync", start: new Date(`${todayStr}T21:00:00Z`), end: new Date(`${todayStr}T22:00:00Z`), notes: "Planning the upcoming Dev Heat Hackathon logistics.", visibility: "public", colorCode: "sky" as const },

  // --- TOMORROW ---
  { title: "Client Product Demo", start: new Date(`${tomorrowStr}T10:30:00Z`), end: new Date(`${tomorrowStr}T11:30:00Z`), notes: "Presenting the V1 beta to stakeholders.", visibility: "public", colorCode: "rose" as const },
  { title: "Bug Fixing Sprint", start: new Date(`${tomorrowStr}T12:00:00Z`), end: new Date(`${tomorrowStr}T14:30:00Z`), notes: "Squashing issues reported by beta testers.", visibility: "private", colorCode: "emerald" as const },
  { title: "Technical Writing", start: new Date(`${tomorrowStr}T15:30:00Z`), end: new Date(`${tomorrowStr}T17:00:00Z`), notes: "Writing a blog post about 'Optimizing Next.js 15 for Edge Computing'.", visibility: "public", colorCode: "amber" as const },
  { title: "Community Mentorship", start: new Date(`${tomorrowStr}T18:00:00Z`), end: new Date(`${tomorrowStr}T19:30:00Z`), notes: "1-on-1 sessions with junior developers from GDG.", visibility: "public", colorCode: "sky" as const },
  { title: "Personal Project Time", start: new Date(`${tomorrowStr}T20:00:00Z`), end: new Date(`${tomorrowStr}T22:00:00Z`), notes: "Working on the AI engine for Unreal Engine 5.", visibility: "public", colorCode: "violet" as const },
];

// ═══════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════

async function seed() {
  const fresh = process.argv.includes("--fresh");

  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected!\n");

  if (fresh) {
    console.log("🧹 --fresh flag detected: clearing existing data...");
    await Promise.all([
      Project.deleteMany({}),
      Experience.deleteMany({}),
      Achievement.deleteMany({}),
      Certificate.deleteMany({}),
      Learning.deleteMany({}),
      Note.deleteMany({}),
      Profile.deleteMany({}),
      Schedule.deleteMany({}),
    ]);
    console.log("   Cleared all collections.\n");
  }

  // ─── Projects ───
  console.log(`📁 Seeding ${PROJECTS.length} projects...`);
  for (const p of PROJECTS) {
    const exists = await Project.findOne({ slug: slug(p.title) });
    if (exists) {
      console.log(`   ⏭  "${p.title}" already exists, skipping.`);
      continue;
    }
    await Project.create({ ...p, slug: slug(p.title) });
    console.log(`   ✅ ${p.title}`);
  }

  // ─── Experiences ───
  console.log(`\n🗡️  Seeding ${EXPERIENCES.length} experiences...`);
  for (const e of EXPERIENCES) {
    const exists = await Experience.findOne({ company: e.company, role: e.role });
    if (exists) {
      console.log(`   ⏭  "${e.role} @ ${e.company}" already exists, skipping.`);
      continue;
    }
    await Experience.create(e);
    console.log(`   ✅ ${e.role} @ ${e.company}`);
  }

  // ─── Achievements ───
  console.log(`\n🏆 Seeding ${ACHIEVEMENTS.length} achievements...`);
  for (const a of ACHIEVEMENTS) {
    const exists = await Achievement.findOne({ title: a.title });
    if (exists) {
      console.log(`   ⏭  "${a.title}" already exists, skipping.`);
      continue;
    }
    await Achievement.create(a);
    console.log(`   ✅ ${a.title}`);
  }

  // ─── Certificates ───
  console.log(`\n📜 Seeding ${CERTIFICATES.length} certificates...`);
  for (const c of CERTIFICATES) {
    const exists = await Certificate.findOne({ name: c.name });
    if (exists) {
      console.log(`   ⏭  "${c.name}" already exists, skipping.`);
      continue;
    }
    await Certificate.create(c);
    console.log(`   ✅ ${c.name}`);
  }

  // ─── Learning ───
  console.log(`\n📚 Seeding ${LEARNING.length} learning entries...`);
  for (const l of LEARNING) {
    const exists = await Learning.findOne({ title: l.title });
    if (exists) {
      console.log(`   ⏭  "${l.title}" already exists, skipping.`);
      continue;
    }
    await Learning.create(l);
    console.log(`   ✅ ${l.title}`);
  }

  // ─── Notes ───
  console.log(`\n📝 Seeding ${NOTES.length} research notes...`);
  for (const n of NOTES) {
    const exists = await Note.findOne({ title: n.title });
    if (exists) {
      console.log(`   ⏭  "${n.title}" already exists, skipping.`);
      continue;
    }
    await Note.create(n);
    console.log(`   ✅ ${n.title}`);
  }

  // ─── Profile ───
  console.log("\n👤 Updating profile...");
  await Profile.findOneAndUpdate(
    {},
    {
      name: "Jeevant Mudgil",
      title: "Founder of Adaptive Grade | Software Engineer | Open to Opportunities",
      stats: [
        { label: "CGPA", value: "8.89/10" },
        { label: "LeetCode", value: "400+ Solved (1525 Max)" },
        { label: "Codeforces", value: "450+ Solved (1350 Max)" },
        { label: "GeeksForGeeks", value: "200+ Solved" },
        { label: "Kaggle", value: "3+ Badges" },
        { label: "Hackathons", value: "Top 5% HackOdisha" },
        { label: "Open Source", value: "DSO Founder" }
      ],
      githubUsername: "Jeevant010",
      avatarUrl: "https://github.com/Jeevant010.png",
      status: "Available for Hire",
      updatedAt: new Date(),
    },
    { upsert: true }
  );
  console.log("   ✅ Profile updated.");

  // ─── Mock Schedule ───
  console.log(`\n📅 Seeding ${MOCK_SCHEDULE.length} mock schedule entries...`);
  for (const s of MOCK_SCHEDULE) {
    const exists = await Schedule.findOne({ title: s.title });
    if (exists) {
      console.log(`   ⏭  "${s.title}" already exists, skipping.`);
      continue;
    }
    await Schedule.create(s);
    console.log(`   ✅ ${s.title}`);
  }

  // ─── Summary ───
  const counts = await Promise.all([
    Project.countDocuments(),
    Experience.countDocuments(),
    Achievement.countDocuments(),
    Certificate.countDocuments(),
    Learning.countDocuments(),
    Note.countDocuments(),
    Schedule.countDocuments(),
  ]);

  console.log("\n═══════════════════════════════════════");
  console.log("  SEED COMPLETE — DATABASE SUMMARY");
  console.log("═══════════════════════════════════════");
  console.log(`  Projects:     ${counts[0]}`);
  console.log(`  Experiences:  ${counts[1]}`);
  console.log(`  Achievements: ${counts[2]}`);
  console.log(`  Certificates: ${counts[3]}`);
  console.log(`  Learning:     ${counts[4]}`);
  console.log(`  Notes:        ${counts[5]}`);
  console.log(`  Schedule:     ${counts[6]}`);
  console.log("═══════════════════════════════════════\n");

  await mongoose.disconnect();
  console.log("🔌 Disconnected. Done!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
