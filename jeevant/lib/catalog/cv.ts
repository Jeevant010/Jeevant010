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
  role: "Software engineer",
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
    "Computer science student at IIIT Surat building backend systems, language-model experiments, and game tools. The public record is the repositories. The roles below are the ones written on the resumes.",
  education: {
    school: "Indian Institute of Information Technology, Surat",
    degree: "B.Tech, Computer Science and Engineering",
    when: "2023 — expected May 2027",
    detail: "CGPA 8.89 / 10. Coursework includes data structures, operating systems, networks, databases, and machine learning.",
  },
  roles: [
    {
      org: "Astra3D — Reealtech Pvt Ltd",
      title: "Backend developer intern",
      when: "Jun 2026 — present",
      place: "Remote",
      points: [
        "Backend for the Astra3D platform in Node.js, Express, and MongoDB.",
        "REST APIs and schema work aimed at 3D asset retrieval.",
      ],
    },
    {
      org: "Google Developer Groups, IIIT Surat",
      title: "AI/ML lead",
      when: "Aug 2025 — present",
      place: "Surat",
      points: [
        "AI/ML tracks and mentorship on campus.",
        "Technical lead for Innov-AI-Thon, Dev Heat, WebXperience, and PromptCraft.",
        "Node.js and Express workshops, and technical interviews for student teams.",
      ],
    },
    {
      org: "1M1B, AICTE, and IBM SkillsBuild",
      title: "AI for sustainability intern",
      when: "Dec 2025 — Jan 2026",
      place: "Remote",
      points: [
        "Agentic workflows and retrieval over unstructured data with IBM Granite.",
      ],
    },
    {
      org: "AICTE SmartBridge",
      title: "ServiceNow intern, cohort 3",
      when: "Sep 2025 — Nov 2025",
      place: "Remote",
      points: [
        "Workflow automation: custom tables, business rules, ACLs, and automated tests.",
      ],
    },
    {
      org: "Edunet Foundation, AICTE, and IBM SkillsBuild",
      title: "Employability and AI literacy intern",
      when: "Nov 2025 — Dec 2025",
      place: "Remote",
      points: [
        "Guided program in employability skills, digital literacy, and AI fundamentals. Completion certificate is on file.",
      ],
    },
  ] as CvRole[],
  marks: [
    { name: "SSIP 2.0 grant", detail: "Government of Gujarat grant for AdaptiveGrade / Scholar Dive.", when: "2026" },
    { name: "UDBHAV", detail: "Inter-IIIT hackathon finalist, decentralized land registry.", when: "2026" },
    { name: "Spring Fiesta CTF", detail: "1st place in the campus capture-the-flag.", when: "2026" },
    { name: "HackOdisha 4.0", detail: "Finalist, named in the resumes as top 5% nationally.", when: "2024" },
    { name: "Adobe India Hackathon", detail: "Round 1 cleared, MCQ and coding.", when: "2025" },
    { name: "AlgoUniversity fellowship", detail: "Stage 2, top 4,000 of 20,000+.", when: "2024" },
    { name: "Innovision '25", detail: "3rd, Pixel Pursuit, NSUT.", when: "2025" },
    { name: "IBM AI Fundamentals", detail: "Credly badge from IBM SkillsBuild.", when: "2025" },
    { name: "LeetCode", detail: "400+ solved, 200-day streak, max rating 1525.", when: "Ongoing" },
    { name: "Codeforces", detail: "450+ solved, max rating 1350.", when: "Ongoing" },
  ] as CvMark[],
  focus: [
    { name: "Scholar Dive", detail: "Adaptive grading platform. Backend, RAG, and the SSIP 2.0 grant. Live at scholardive.com." },
    { name: "Unreal MCP", detail: "A TypeScript surface that drives Unreal Engine through the Model Context Protocol." },
    { name: "Mini GPT", detail: "Decoder-only model in PyTorch: grouped-query attention, RoPE, RMSNorm, SwiGLU." },
    { name: "Land registry", detail: "Solidity contracts for recording land. UDBHAV finalist work, public as newChain." },
    { name: "Book Model", detail: "RAG question-answering API packaged as a Hugging Face Docker space." },
  ],
  reading: [
    "Attention Is All You Need — Vaswani et al., 2017",
    "Build a Large Language Model (From Scratch) — Sebastian Raschka",
    "Hands-On Machine Learning — Aurélien Géron",
    "Computer Networking: A Top-Down Approach — Kurose and Ross",
  ],
  skills: [
    { group: "Languages", items: "C, C++, Python, TypeScript, JavaScript, SQL" },
    { group: "Backend", items: "Node.js, Express, FastAPI, REST, MongoDB, MySQL" },
    { group: "AI", items: "PyTorch, transformers, LangChain, RAG, local models" },
    { group: "Also", items: "React, Next.js, Solidity, Hardhat, Docker, Git" },
  ],
};
