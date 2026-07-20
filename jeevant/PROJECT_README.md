<div align="center">
  <img src="https://img.shields.io/badge/STATUS-CLASSIFIED-red?style=for-the-badge&logoColor=white" alt="Status" />
  <img src="https://img.shields.io/badge/ACCESS-LEVEL_5_CLEARANCE-green?style=for-the-badge&logoColor=white" alt="Clearance" />
  
  <br />
  <br />

  <h1 align="center">
    <span style="color: #4ade80">HEROCOMING</span> // Tactical OS
  </h1>

  <p align="center">
    <strong>A next-generation, database-driven personal operating system and portfolio.</strong>
    <br />
    Built with the bleeding edge of the web: Next.js 15, Server Actions, and MongoDB.
  </p>

  <p align="center">
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#system-architecture">Architecture</a> •
    <a href="#deployment--setup">Setup</a>
  </p>
</div>

---

## ⚡ Overview

**HEROCOMING** (formerly Operator OS) is not just a portfolio website—it's a comprehensive digital operating system. Designed with a distinct Cyberpunk / Tactical Military OS aesthetic, it serves as both a public-facing showcase of engineering excellence and a highly secure, private management console for career and learning progression.

The system is fully dynamic, powered by MongoDB and Next.js Server Actions, ensuring that every project, timeline event, and code snippet is dynamically rendered and easily updatable via the integrated CMS.

## 🚀 Key Features

### 🛡️ The Public Interface (Sector 01)
- **Dynamic Dossiers (Projects)**: In-depth project showcases featuring image galleries, tech stacks, and live links, completely manageable via the database.
- **The Journey (Timeline)**: A chronologically ordered, military-styled timeline of experiences and milestones.
- **Targeted Resumes**: Automatically generated, ATS-friendly resumes tailored for specific roles (Full Stack, AI/ML, Data Science, Blockchain, etc.) pulling from the single source of truth (MongoDB).
- **Public Schedule**: A transparency portal showing public calendar events and availability.

### 🔒 The Command Center (Sector 02 - Admin)
Secured behind an environment-driven authentication protocol, the admin panel unlocks powerful internal tools:
- **Arsenal (Snippet Vault)**: A specialized manager for saving, categorizing, and retrieving reusable code components (hooks, configs). Features inline code editing.
- **Corp Infiltration (Career Kanban)**: A built-in Kanban board to track job applications across states (Initiated -> Engagement -> Captured).
- **Knowledge Upload (Learning Matrix)**: A progress tracker for online courses and learning paths with one-click progress incrementing.
- **Daily Planner**: A high-priority dashboard for immediate task tracking and agenda management.

### ⚙️ Content Management System (CMS)
No hardcoded data. Everything is controlled via the internal CMS:
- `Project Editor`: Add/Remove projects and set metadata.
- `RPG / Quests System`: Gamified progress tracking.
- `Expertise & Journey Editor`: Update timelines and skills on the fly.
- `Identity Core`: Manage global branding, titles, and public profile links.

---

## 🛠️ Tech Stack

<div align="center">
  <img src="https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
</div>

- **Framework**: Next.js 15 (App Router, Server Components, Turbopack)
- **Data Mutation**: Next.js Server Actions (No API routes required for internal mutations)
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS (with highly customized animations, matrix rain, and glassmorphism)
- **Icons**: Lucide React
- **Typography**: Optimized Inter & Geist fonts

---

## 🧠 System Architecture

The repository is structured around the Next.js App Router paradigm, strictly separating public viewing areas from the secured command center.

```bash
jeevant/
├── app/
│   ├── (public)/          # Public-facing portfolio pages
│   │   ├── projects/      # Dynamic project routing ([slug])
│   │   ├── journey/       # Timeline integration
│   │   └── about/         # Identity core
│   │
│   ├── (private)/         # Secured Command Center (Admin Only)
│   │   ├── cms/           # Content Management Editors
│   │   ├── arsenal/       # Code Snippet Vault
│   │   ├── career/        # Job Application Kanban
│   │   └── learning/      # Course Progress Matrix
│   │
│   └── api/               # External facing endpoints
├── components/            # Reusable UI architecture
├── lib/
│   ├── actions/           # Server Actions (CRUD operations)
│   ├── database/          # MongoDB connection and Mongoose Models
│   └── auth.ts            # JWT / Session management
├── public/
│   └── resumes/           # Generated role-specific HTML resumes
└── scripts/               # Database seeding and utility scripts
```

---

## 💻 Deployment & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB connection string (Atlas or Local)

### Initialization

1. **Clone the repo**
   ```bash
   git clone https://github.com/Jeevant010/jeevant.git
   cd jeevant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   ADMIN_SECRET=your_secure_admin_password
   JWT_SECRET=your_secure_jwt_signing_key
   ```

4. **Seed the Database (Optional)**
   Populate the system with initial classified data:
   ```bash
   npx tsx scripts/seed.ts
   ```

5. **Boot the System**
   Launch the Turbopack development server:
   ```bash
   npm run dev
   ```
   *System online at [http://localhost:3000](http://localhost:3000)*

---

<div align="center">
  <p><i>"The difference between a good engineer and a great one is their arsenal."</i></p>
  <p>Built with precision by <strong>Jeevant Mudgil</strong></p>
</div>
