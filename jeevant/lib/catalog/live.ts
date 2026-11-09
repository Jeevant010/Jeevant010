import { cache } from "react";
import connectDB from "@/lib/db";
import { Achievement, Experience, Profile, Project } from "@/lib/database/models";
import { CV } from "@/lib/catalog/cv";
import { PUBLIC_WORK, type PublicWork, type WorkLane } from "@/lib/catalog/public-work";

export type LiveLink = { label: string; href: string };

export type LiveProfile = {
  name: string;
  firstName: string;
  title: string;
  status: string;
  bio: string;
  location: string;
  email: string;
  phone: string;
  avatar: string;
  currentFocus: string;
  availability: string;
  links: LiveLink[];
  company: typeof CV.company;
  education: typeof CV.education;
  skills: typeof CV.skills;
  reading: string[];
};

export type LiveExperience = {
  company: string;
  role: string;
  start: string;
  end: string | null;
  current: boolean;
  description: string;
  skills: string[];
  location: string;
  type: string;
};

export type LiveAchievement = {
  title: string;
  platform: string;
  date: string;
  description: string;
  slug: string;
};

export type LiveProject = {
  slug: string;
  title: string;
  description: string;
  detail: string;
  stack: string[];
  lane: WorkLane;
  language: string;
  featured: boolean;
  repo: string;
  live: string;
  status: "building" | "live" | "stopped" | "planned";
  start: string | null;
  ongoing: boolean;
};

export type LifeChapter = {
  year: string;
  kicker: string;
  title: string;
  place: string;
  body: string;
  proof: string[];
  tone: "origin" | "first" | "build" | "operator" | "now";
};

export type LifeData = {
  profile: LiveProfile;
  experiences: LiveExperience[];
  achievements: LiveAchievement[];
  projects: LiveProject[];
  chapters: LifeChapter[];
  stats: { label: string; value: string; detail: string }[];
  live: boolean;
};

const iso = (value: unknown): string | null => {
  if (!value) return null;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const slugOf = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const text = (value: unknown, fallback = "") => {
  const out = typeof value === "string" ? value.trim() : "";
  return out || fallback;
};

const cleanTitle = (value: unknown, fallback: string) =>
  text(value, fallback)
    .replace(/\bv\|/gi, "|")
    .replace(/\s*\|\s*/g, " · ")
    .replace(/\s{2,}/g, " ");

const mergeLinks = (github: string): LiveLink[] => {
  const links: LiveLink[] = [];
  const seen = new Set<string>();
  for (const link of CV.links) {
    if (!seen.has(link.href)) {
      seen.add(link.href);
      links.push(link);
    }
  }
  const gh = `https://github.com/${github}`;
  if (github && !seen.has(gh)) links.unshift({ label: "GitHub", href: gh });
  return links;
};

export const LIFE_CHAPTERS: LifeChapter[] = [
  {
    year: "2023",
    kicker: "Chapter 01 · Arrival",
    title: "Leaves home for IIIT Surat.",
    place: "Surat, Gujarat",
    body:
      "Starts a B.Tech in computer science with no portfolio, no repos worth showing, and a habit that outlasts everything else: finish the scene you are in. Learns C, data structures, and how much of engineering is simply refusing to leave a bug alone.",
    proof: ["B.Tech CSE · IIIT Surat", "CGPA 8.89 / 10", "First lines of C"],
    tone: "origin",
  },
  {
    year: "2024",
    kicker: "Chapter 02 · First blood",
    title: "The first public code and the first final.",
    place: "NIT Rourkela · national",
    body:
      "Ships early experiments in public and takes them into rooms with better-funded teams. Reaches the HackOdisha 4.0 final, top five percent nationally, and clears Stage 2 of the AlgoUniversity fellowship against twenty thousand applicants. The lesson is not the certificate. It is that the work can survive contact with the outside.",
    proof: ["HackOdisha 4.0 finalist · top 5%", "AlgoUniversity Stage 2 · top 4k/20k", "First hackathon dApp"],
    tone: "first",
  },
  {
    year: "2025",
    kicker: "Chapter 03 · Build in public",
    title: "Leads a room, then starts a company.",
    place: "GDG IIIT Surat · Scholar Dive",
    body:
      "Becomes AI/ML lead at GDG IIIT Surat, runs PromptCraft, WebXperience, Innov-AI-Thon, and Dev Heat, and mentors juniors through their first models. Founds AdaptiveGrade, an adaptive grading platform, and takes it through the SSIP 2.0 grant process. Also ships CrowdStats at Surreal Hackathon, used by more than a hundred people during the event.",
    proof: ["GDG AI/ML lead", "SSIP 2.0 grant · Government of Gujarat", "CrowdStats · 100+ users", "Innovision '25 · 3rd place"],
    tone: "build",
  },
  {
    year: "2026",
    kicker: "Chapter 04 · Operator",
    title: "Runs the machine and writes the papers.",
    place: "Remote · Surat",
    body:
      "Backend intern at Astra3D. Runs the Scholar Dive beta to fifty users at one hundred percent uptime. Reaches the UDBHAV final with a decentralized land registry. Takes first place in the campus CTF. Coordinates the technical side of Spring Fiesta. Starts two papers: driving Unreal Engine through MCP, and privacy-preserving gunshot detection on edge hardware.",
    proof: ["Astra3D backend intern", "50 beta users · 100% uptime", "CTF 1st place", "2 papers in progress"],
    tone: "operator",
  },
  {
    year: "Now",
    kicker: "Chapter 05 · The next scene",
    title: "Building the operating system around the work.",
    place: "Live",
    body:
      "The public repositories are the proof, but this site is the ledger: every project, role, mark, and mistake in one place. The current build is a personal operator that turns voice into drafts, plans into tasks, and intent into shipped work. The rule stays the same.",
    proof: ["Personal OS · live", "RAG + agentic systems", "Unreal MCP", "Open to hard problems"],
    tone: "now",
  },
];

function catalogProjects(): LiveProject[] {
  return PUBLIC_WORK.map((item: PublicWork) => ({
    slug: item.slug,
    title: item.title,
    description: item.description,
    detail: item.detail,
    stack: item.stack,
    lane: item.lane,
    language: item.language,
    featured: item.featured,
    repo: item.repo,
    live: "",
    status: "live" as const,
    start: null,
    ongoing: false,
  }));
}

function catalogExperiences(): LiveExperience[] {
  return CV.roles.map((role) => ({
    company: role.org,
    role: role.title,
    start: role.when,
    end: null,
    current: /present/i.test(role.when),
    description: role.points.join(" "),
    skills: [],
    location: role.place,
    type: "role",
  }));
}

function catalogAchievements(): LiveAchievement[] {
  return CV.marks.map((mark) => ({
    title: mark.name,
    platform: "",
    date: mark.when,
    description: mark.detail,
    slug: slugOf(mark.name),
  }));
}

async function loadLive(): Promise<LifeData> {
  type Row = Record<string, unknown>;
  let profileDoc: Row | null = null;
  let experienceDocs: Row[] = [];
  let achievementDocs: Row[] = [];
  let projectDocs: Row[] = [];
  let live = false;

  try {
    await connectDB();
    const [profile, experiences, achievements, projects] = await Promise.all([
      Profile.findOne({}).lean(),
      Experience.find({}).sort({ startDate: -1 }).lean(),
      Achievement.find({ visibility: "public" }).sort({ date: -1 }).lean(),
      Project.find({ visibility: "public" }).sort({ featured: -1, order: 1, startDate: -1 }).lean(),
    ]);
    profileDoc = (profile as unknown as Row) || null;
    experienceDocs = (experiences as unknown as Row[]) || [];
    achievementDocs = (achievements as unknown as Row[]) || [];
    projectDocs = (projects as unknown as Row[]) || [];
    live = true;
  } catch {
    live = false;
  }

  const profile: LiveProfile = {
    name: text(profileDoc?.name, CV.name),
    firstName: text(profileDoc?.name, CV.name).split(" ")[0],
    title: cleanTitle(profileDoc?.title, CV.role),
    status: text(profileDoc?.status, CV.company.status),
    bio: text(profileDoc?.bio, CV.summary),
    location: text(profileDoc?.location, CV.location),
    email: text(profileDoc?.email, CV.email),
    phone: text(profileDoc?.phone, CV.phone),
    avatar: text(profileDoc?.avatarUrl, CV.portrait),
    currentFocus: text(profileDoc?.currentFocus, CV.company.blurb),
    availability: text(profileDoc?.availability, "Open to full-time roles, freelance work, and hard problems."),
    links: mergeLinks(text(profileDoc?.githubUsername, "Jeevant010")),
    company: CV.company,
    education: CV.education,
    skills: CV.skills,
    reading: CV.reading,
  };

  const experiences: LiveExperience[] = experienceDocs.length
    ? experienceDocs.map((doc) => ({
        company: text(doc.company),
        role: text(doc.role),
        start: iso(doc.startDate) || "",
        end: iso(doc.endDate),
        current: !doc.endDate,
        description: text(doc.description),
        skills: Array.isArray(doc.skillsUsed) ? doc.skillsUsed.map(String) : [],
        location: text(doc.location, "Surat, India"),
        type: text(doc.type, "role"),
      }))
    : catalogExperiences();

  // The database holds the core roles; the CV holds a few more. Merge the
  // missing ones so the public record is complete rather than DB-only.
  const normOrg = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const seenOrgs = new Set(experiences.map((item) => normOrg(item.company)));
  for (const role of catalogExperiences()) {
    const key = normOrg(role.company);
    if (!seenOrgs.has(key)) {
      seenOrgs.add(key);
      experiences.push(role);
    }
  }

  const whenScore = (value: string) => {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.getTime();
    const year = Number(value.match(/(19|20)\d{2}/)?.[0] || 0);
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const index = months.findIndex((month) => value.toLowerCase().includes(month));
    return Date.UTC(year, index < 0 ? 0 : index, 1);
  };
  experiences.sort((a, b) => whenScore(b.start) - whenScore(a.start));

  const dbAchievements: LiveAchievement[] = achievementDocs.map((doc) => ({
    title: text(doc.title),
    platform: text(doc.platform),
    date: iso(doc.date) || "",
    description: text(doc.description),
    slug: text(doc.slug, slugOf(text(doc.title))),
  }));

  const seen = new Set(dbAchievements.map((item) => item.title.toLowerCase().replace(/[^a-z0-9]/g, "")));
  const mergedAchievements = [...dbAchievements];
  for (const item of catalogAchievements()) {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!seen.has(key)) {
      seen.add(key);
      mergedAchievements.push(item);
    }
  }

  const fromDb: LiveProject[] = projectDocs.map((doc) => {
    const catalog = PUBLIC_WORK.find((item) => item.slug.toLowerCase() === String(doc.slug).toLowerCase());
    const tags: string[] = Array.isArray(doc.techStack) ? doc.techStack.map(String) : [];
    const lane = (catalog?.lane || "Products") as WorkLane;
    const status = String(doc.status || "planned");
    return {
      slug: text(doc.slug, slugOf(text(doc.title))),
      title: text(doc.title),
      description: text(doc.description),
      detail: text(doc.content, catalog?.detail || text(doc.description)),
      stack: tags.length ? tags : catalog?.stack || [],
      lane,
      language: catalog?.language || tags[0] || "Code",
      featured: Boolean(doc.featured),
      repo: text(doc.repoLink, catalog?.repo || ""),
      live: text(doc.liveLink),
      status: ["building", "live", "stopped", "planned"].includes(status)
        ? (status as LiveProject["status"])
        : "planned",
      start: iso(doc.startDate),
      ongoing: Boolean(doc.isOngoing),
    };
  });

  const seenProjects = new Set(fromDb.map((item) => item.slug.toLowerCase()));
  const projects = [...fromDb];
  for (const item of catalogProjects()) {
    if (!seenProjects.has(item.slug.toLowerCase())) {
      seenProjects.add(item.slug.toLowerCase());
      projects.push(item);
    }
  }

  // Featured work first, then live/building before planned, then title.
  const statusRank: Record<LiveProject["status"], number> = { live: 0, building: 1, planned: 2, stopped: 3 };
  projects.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (statusRank[a.status] !== statusRank[b.status]) return statusRank[a.status] - statusRank[b.status];
    return a.title.localeCompare(b.title);
  });

  const uniqueRoles = new Set(experiences.map((item) => item.company.toLowerCase()));
  for (const role of CV.roles) uniqueRoles.add(role.org.toLowerCase());

  const stats = [
    { label: "public repos", value: String(projects.length), detail: "original code on GitHub" },
    { label: "roles", value: String(uniqueRoles.size), detail: "internships and leads" },
    { label: "marks", value: String(mergedAchievements.length), detail: "awards and records" },
    { label: "CGPA", value: "8.89", detail: "of 10 at IIIT Surat" },
  ];

  return {
    profile,
    experiences,
    achievements: mergedAchievements,
    projects,
    chapters: LIFE_CHAPTERS,
    stats,
    live,
  };
}

export const getLife = cache(loadLive);

export const laneCounts = (works: LiveProject[]) =>
  (["AI", "Games", "Products", "Campus", "Lab"] as WorkLane[]).map((lane) => ({
    lane,
    count: works.filter((item) => item.lane === lane).length,
  }));

export function getProject(life: LifeData, slug: string) {
  const key = decodeURIComponent(slug).toLowerCase();
  return life.projects.find((item) => item.slug.toLowerCase() === key) ?? null;
}

export function formatWhen(value: string | null) {
  if (!value) return "now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
