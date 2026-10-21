export type CvRole = {
  org: string;
  title: string;
  when: string;
  place: string;
  points: string[];
};

export type CvMark = {
  name: string;
  detail: string;
  when: string;
};

export const CV = {
  name: "Jeevant Mudgil",
  role: "Backend, AI/ML, and full-stack engineer",
  location: "Surat, India",
  phone: "9306130032",
  email: "jeevantmudgil@gmail.com",
  links: [
    { label: "GitHub", href: "https://github.com/Jeevant010" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/jeevant-mudgil-2897b82a5/" },
    { label: "Site", href: "https://jeevant.is-a.dev" },
    { label: "LeetCode", href: "https://leetcode.com/u/JEEVANT10/" },
  ],
  summary:
    "Computer science student at IIIT Surat building backend systems, retrieval and agentic AI, and game tooling. Founder of Scholar Dive (AdaptiveGrade), an SSIP 2.0 grantee. AI/ML Lead at GDG IIIT Surat and a backend intern at Astra3D. The public repositories carry the proof: RAG services, local model stacks, MCP for Unreal Engine, and full-stack products.",
  education: {
    school: "Indian Institute of Information Technology, Surat",
    degree: "B.Tech, Computer Science and Engineering",
    when: "Aug 2023 — expected May 2027",
    detail:
      "CGPA 8.89 / 10. Coursework: data structures, operating systems, computer networks, databases, machine learning, NLP, and distributed systems.",
  },
  roles: [
    {
      org: "Astra3D — Reealtech Pvt Ltd",
      title: "Backend developer intern",
      when: "Jun 2026 — present",
      place: "Remote",
      points: [
        "Backend for the Astra3D platform in Node.js, Express, and MongoDB.",
        "REST APIs and schema design aimed at low-latency 3D asset retrieval.",
      ],
    },
    {
      org: "Scholar Dive (AdaptiveGrade)",
      title: "Founder and lead engineer",
      when: "2025 — present",
      place: "Surat",
      points: [
        "AI-driven adaptive learning platform; awarded an SSIP 2.0 grant by the Government of Gujarat.",
        "RAG and custom LLM pipelines over course material, with an adaptive grading layer.",
        "Ran the beta to 50 active users at 100% server uptime; owns deployment and scaling on the VPS.",
      ],
    },
    {
      org: "Google Developer Groups, IIIT Surat",
      title: "AI/ML lead",
      when: "Aug 2025 — present",
      place: "Surat",
      points: [
        "Leads the AI/ML tracks and mentors juniors on ML fundamentals.",
        "Technical lead for Innov-AI-Thon, Dev Heat, WebXperience, and PromptCraft.",
        "Runs mock interviews and technical screening for student developer teams.",
      ],
    },
    {
      org: "1M1B × AICTE × IBM SkillsBuild",
      title: "AI for sustainability intern",
      when: "Dec 2025 — Jan 2026",
      place: "Remote",
      points: [
        "Responsible AI and UN SDG-aligned problem framing.",
        "Built agentic AI and RAG workflows over unstructured data with IBM Granite models.",
      ],
    },
    {
      org: "AICTE SmartBridge",
      title: "ServiceNow virtual intern, cohort 3",
      when: "Sep 2025 — Nov 2025",
      place: "Remote",
      points: [
        "ServiceNow workflow automation: custom tables, forms, flows, and business rules.",
        "Role-based security with ACLs, plus SDLC-style testing and documentation.",
      ],
    },
    {
      org: "Edunet Foundation × AICTE × IBM SkillsBuild",
      title: "Employability and AI literacy intern",
      when: "Nov 2025 — Dec 2025",
      place: "Remote",
      points: [
        "Six-week program in employability skills, digital literacy, and AI fundamentals.",
        "Guided project work with mentor review; completion certificate on file.",
      ],
    },
    {
      org: "Open Source Society, IIIT Surat",
      title: "Founder",
      when: "2026 — present",
      place: "Surat",
      points: [
        "Drafted the manifesto and groundwork for a low-level engineering community (kernel, virtualization).",
        "Formerly the Deep Systems and Open-Source Lab.",
      ],
    },
    {
      org: "Spring Fiesta 2026, IIIT Surat",
      title: "Technical coordinator",
      when: "Feb 2026",
      place: "Surat",
      points: [
        "Ran technical operations for Dev-Heat, Innov-AI-Thon, and the Capture the Flag event.",
        "Owned scheduling, infrastructure, and on-ground troubleshooting across the festival.",
      ],
    },
    {
      org: "IIIT Surat",
      title: "4th Convocation coordinator",
      when: "2025",
      place: "Surat",
      points: [
        "Coordinated logistics and guest support for the institute convocation and 200+ attendees.",
      ],
    },
  ] as CvRole[],
  marks: [
    { name: "SSIP 2.0 grant", detail: "Government of Gujarat funding for AdaptiveGrade / Scholar Dive.", when: "2026" },
    { name: "UDBHAV", detail: "Inter-IIIT hackathon finalist; owned the Web3 transaction and smart-contract logic for the land registry.", when: "2026" },
    { name: "Spring Fiesta CTF", detail: "1st place in the campus capture-the-flag.", when: "2026" },
    { name: "HackOdisha 4.0", detail: "Finalist, top 5% nationally, NIT Rourkela.", when: "2024" },
    { name: "Surreal Hackathon", detail: "Built CrowdStats, a blockchain analytics dApp used by 100+ people during the event.", when: "2025" },
    { name: "Adobe India Hackathon", detail: "Cleared Round 1, online MCQ and coding.", when: "2025" },
    { name: "AlgoUniversity fellowship", detail: "Qualified Stage 2, top 4,000 of 20,000+ applicants.", when: "2024" },
    { name: "Innovision '25", detail: "3rd place, Pixel Pursuit, NSUT.", when: "2025" },
    { name: "Smart India Hackathon", detail: "Participant across the 2nd/3rd-year transition.", when: "2025" },
    { name: "IBM AI Fundamentals", detail: "Credly badge from IBM SkillsBuild.", when: "2025" },
    { name: "1M1B internship", detail: "AICTE + IBM SkillsBuild AI for Sustainability, completed with certificate.", when: "2026" },
    { name: "LeetCode", detail: "400+ solved, 200-day streak, max rating 1525.", when: "Ongoing" },
    { name: "Codeforces", detail: "450+ solved, max rating 1350.", when: "Ongoing" },
    { name: "GeeksforGeeks", detail: "200+ solved.", when: "Ongoing" },
  ] as CvMark[],
  focus: [
    {
      name: "Scholar Dive (AdaptiveGrade)",
      detail:
        "Adaptive learning platform: RAG over course material, custom LLM grading, SSIP 2.0 grant, 50-user beta at 100% uptime. Live at scholardive.com.",
    },
    {
      name: "Unreal MCP engine",
      detail:
        "A local Model Context Protocol server that drives Unreal Engine 5 from outside the viewport — prompts and clicks over standard networking.",
    },
    {
      name: "RAG + agentic service",
      detail:
        "FastAPI service with modular ingest/index/query stages, LangChain + FAISS retrieval, and tool-style agent modules for multi-step reasoning.",
    },
    {
      name: "Local AI stack",
      detail:
        "Ollama, DeepSeek, and Groq wired into a local-first stack to cut API latency and cost; includes evaluation harnesses for tutor responses.",
    },
    {
      name: "Mini GPT",
      detail:
        "Decoder-only transformer in PyTorch: grouped-query attention, RoPE, RMSNorm, SwiGLU, and a tied embedding/LM head.",
    },
    {
      name: "Decentralized land registry",
      detail:
        "Solidity + Hardhat contracts for recording land ownership. UDBHAV finalist work; public as newChain.",
    },
    {
      name: "Resume parser and AI summarizer",
      detail:
        "NLP extraction pipeline (spaCy + scikit-learn) and a transformer summarizer deployed as a Hugging Face Space.",
    },
    {
      name: "Book Model",
      detail: "RAG question-answering API packaged as a Hugging Face Docker space.",
    },
    {
      name: "GGStats",
      detail:
        "Sports analytics hub with live scores, standings, ML-based predictions, and automated CI/CD.",
    },
  ],
  reading: [
    "Attention Is All You Need — Vaswani et al., 2017",
    "Build a Large Language Model (From Scratch) — Sebastian Raschka",
    "Hands-On Machine Learning — Aurélien Géron",
    "Computer Networking: A Top-Down Approach — Kurose and Ross",
    "Designing Machine Learning Systems — Chip Huyen",
    "Retrieval-Augmented Generation for Knowledge-Intensive NLP — Lewis et al.",
  ],
  skills: [
    {
      group: "Languages",
      items: "C, C++, Python, TypeScript, JavaScript, SQL, Solidity",
    },
    {
      group: "Backend",
      items: "Node.js, Express, FastAPI, REST, MongoDB, MySQL, JWT, OAuth",
    },
    {
      group: "AI / GenAI",
      items:
        "PyTorch, transformers, LangChain, LangGraph, FAISS, RAG, agentic workflows, IBM Granite, local models (Ollama, DeepSeek), scikit-learn, spaCy",
    },
    {
      group: "Agents & tooling",
      items:
        "Model Context Protocol (MCP), tool-calling, structured outputs, evaluation harnesses, prompt design",
    },
    {
      group: "Frontend",
      items: "React, Next.js, Tailwind, Vite, Streamlit",
    },
    {
      group: "Cloud / DevOps",
      items: "AWS (EC2, S3), Docker, GitHub Actions, GitLab CI, Vercel, Render, Hostinger",
    },
    {
      group: "Also",
      items: "Unreal Engine 5, Hardhat, Wireshark, Git, Postman, Swagger",
    },
  ],
  portrait: "https://github.com/Jeevant010.png",
  avatar: "https://github.com/Jeevant010.png",
  company: {
    name: "Scholar Dive (AdaptiveGrade)",
    role: "Founder and lead engineer",
    status: "SSIP 2.0 grantee · live beta",
    site: "https://scholardive.com",
    blurb:
      "An adaptive learning platform that grades and tutors with retrieval-grounded LLMs. I founded it, took it through the SSIP 2.0 grant process, and run the backend, deployment, and uptime.",
    metrics: [
      { label: "beta users", value: "50" },
      { label: "uptime", value: "100%" },
      { label: "grant", value: "SSIP 2.0" },
    ],
  },
  research: [
    {
      title: "Driving Unreal Engine 5 through the Model Context Protocol",
      status: "writing" as const,
      detail:
        "First paper, in progress. Protocol design for safe tool calls into the engine, latency measurements, and how an agent can act inside a running editor without breaking state.",
      when: "2026",
    },
    {
      title: "Retrieval-grounded grading for adaptive learning",
      status: "in-progress" as const,
      detail:
        "RAG over course material with calibrated grading and feedback loops. This is the research behind Scholar Dive, not a reading exercise.",
      when: "2025 — 2026",
    },
    {
      title: "Local-first agent stacks: latency and cost",
      status: "experiment" as const,
      detail:
        "Benchmarking Ollama, DeepSeek, and Groq for tool-calling latency and cost against hosted APIs, with an evaluation harness for tutor responses.",
      when: "2026",
    },
  ],
  availability: [
    { label: "Deep work", days: "Mon — Fri", hours: "09:00 — 13:00", state: "busy" as const },
    { label: "Calls and collaboration", days: "Mon — Fri", hours: "15:00 — 18:00", state: "open" as const },
    { label: "Scholar Dive (founder)", days: "Tue and Thu", hours: "18:00 — 21:00", state: "busy" as const },
    { label: "Open source and community", days: "Sat", hours: "10:00 — 16:00", state: "open" as const },
    { label: "Offline", days: "Sun", hours: "all day", state: "closed" as const },
  ],
  events: [
    { name: "Spring Fiesta 2026", role: "Technical coordinator", when: "Feb 2026", detail: "Ran Dev-Heat, Innov-AI-Thon, and the campus CTF." },
    { name: "UDBHAV Inter-IIIT", role: "Finalist · Web3 developer", when: "Jan 2026", detail: "Smart contracts and transaction logic for a decentralized land registry." },
    { name: "Surreal Hackathon", role: "Builder", when: "Jun 2025", detail: "CrowdStats blockchain analytics, used by 100+ people during the event." },
    { name: "HackOdisha 4.0", role: "Finalist", when: "Oct 2024", detail: "Top 5% nationally, NIT Rourkela." },
    { name: "Smart India Hackathon", role: "Participant", when: "2025", detail: "Competed across the second/third-year transition." },
    { name: "4th Convocation, IIIT Surat", role: "Coordinator", when: "2025", detail: "Logistics and guest support for 200+ attendees." },
  ],
};
