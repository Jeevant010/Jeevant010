export type WorkLane = "AI" | "Games" | "Products" | "Campus" | "Lab";

export type PublicWork = {
  slug: string;
  title: string;
  description: string;
  detail: string;
  stack: string[];
  lane: WorkLane;
  language: string;
  featured: boolean;
  repo: string;
};

const repo = (name: string) => `https://github.com/Jeevant010/${name}`;

function work(
  slug: string,
  title: string,
  description: string,
  detail: string,
  stack: string[],
  lane: WorkLane,
  language: string,
  featured = false
): PublicWork {
  return {
    slug,
    title,
    description,
    detail,
    stack,
    lane,
    language,
    featured,
    repo: repo(slug),
  };
}

/**
 * Original public repositories on github.com/Jeevant010.
 * Forks are omitted. Copy follows each repo's README, not invented metrics.
 */
export const PUBLIC_WORK: PublicWork[] = [
  work(
    "UnrealMCP_UI",
    "Unreal MCP",
    "A control surface that sends prompts and clicks into Unreal Engine through the Model Context Protocol.",
    "The repo documents a three-layer system: a TypeScript UI, a networking bridge, and Unreal itself. A prompt or a click travels over standard networking into the editor, so the engine can be driven from outside the viewport. This is the public record of the Unreal MCP work.",
    ["TypeScript", "MCP", "Unreal Engine"],
    "Games",
    "TypeScript",
    true
  ),
  work(
    "Mini_Generative_Pretrained_Transformer",
    "Mini GPT",
    "A decoder-only language model trained in PyTorch, with the modern blocks written out in the open.",
    "The training stack uses grouped-query attention, RoPE, RMSNorm, SwiGLU, and a tied embedding / LM head. It tokenizes local parquet shards into binaries and trains from those files. The README frames it as a tutor model built to be read, not just run.",
    ["PyTorch", "Transformers", "Python"],
    "AI",
    "Jupyter Notebook",
    true
  ),
  work(
    "GGStats",
    "GGStats",
    "A sports and esports stats desk: fixtures, live scores, and standings in one dark dashboard.",
    "Frontend is React 19 on Vite. The API is Node, Express, and MongoDB. The README covers football, basketball, hockey, baseball, and Formula 1 in a single responsive UI.",
    ["React", "Vite", "Node.js", "MongoDB"],
    "Products",
    "JavaScript",
    true
  ),
  work(
    "newChain",
    "Land Registry",
    "Smart contracts for recording land on a chain, with a local Hardhat-style compile path in the README.",
    "The repository is the public Land Registry blockchain project. The README starts from installing dependencies and compiling the contracts, which is the on-chain half of the land-trust work.",
    ["Solidity", "Hardhat", "TypeScript"],
    "Products",
    "TypeScript",
    true
  ),
  work(
    "Shoot_Catcher",
    "Shoot Catcher",
    "Gunshot detection with 1D and 2D convolutional networks, aimed at an Arduino Nano 33 BLE Sense.",
    "The repo splits a raw-waveform 1D CNN baseline from a 2D path, and includes a manual that walks the network theory. It is an edge audio model, not a web demo.",
    ["PyTorch", "CNN", "Arduino"],
    "AI",
    "Jupyter Notebook",
    true
  ),
  work(
    "Web-Srapper",
    "Web Scraper Pipeline",
    "A LangChain and BeautifulSoup scraper that can pull a page apart and ask Gemini or Groq about it.",
    "The pipeline extracts text, links, images, tables, and metadata, then optionally summarizes or answers questions with Gemini or Groq. The README targets Python 3.13 and treats the scraper as a reusable module.",
    ["Python", "LangChain", "BeautifulSoup"],
    "AI",
    "Python",
    true
  ),
  work(
    "Smart_Classroom",
    "Smart Classroom",
    "Attendance and assignments, with a Django REST API behind a React dashboard.",
    "The backend is Django REST on Python. The frontend is Vite, React, and Tailwind. The README points attendance and assignment endpoints at the API and keeps setup notes in the backend folder.",
    ["Django", "React", "Tailwind"],
    "Products",
    "JavaScript",
    true
  ),
  work(
    "Text_Writter",
    "Text Writer",
    "An agent that learns a handwriting sample and redraws new prose and math in that hand.",
    "The README describes a terminal-first prototype: a Colab notebook synthesizes handwriting from a small sample without a full training run, and a later website is called out as future work.",
    ["Python", "Colab", "Handwriting"],
    "AI",
    "Python",
    true
  ),
  work(
    "AI_Summarizer",
    "AI Summarizer",
    "A Hugging Face Docker space for abstractive text summarization.",
    "The repo ships as a Hugging Face Space: Docker SDK, app.py at the root, pinned metadata in the README header. It is the public home of the summarizer, separate from the notebook experiments around it.",
    ["Python", "Hugging Face", "Docker"],
    "AI",
    "Jupyter Notebook"
  ),
  work(
    "Resume_Parser",
    "Resume Parser",
    "Notebook work on pulling structured fields out of resumes.",
    "The public repo is a Jupyter project titled Resume Parser. Treat it as the extraction experiments, and read the notebooks for the actual pipeline rather than a marketing claim.",
    ["Python", "Jupyter", "NLP"],
    "AI",
    "Jupyter Notebook"
  ),
  work(
    "Book_Model",
    "Book Model",
    "A RAG question-answering API packaged as a Hugging Face Docker space.",
    "The Space metadata names it Book Model - RAG QA API, with a Docker SDK and an MIT license. It is the public deployment shell for book-focused retrieval.",
    ["Python", "RAG", "Docker"],
    "AI",
    "Python"
  ),
  work(
    "Langchain-Model",
    "LangChain Model",
    "A public LangChain experiment sitting next to the book and scraper work.",
    "The README is only the title, so this entry stays modest: it is the public LangChain model repo, meant to be opened and read rather than sold as a finished product.",
    ["Python", "LangChain"],
    "AI",
    "Jupyter Notebook"
  ),
  work(
    "IndoMLthon_LLM",
    "IndoMLthon LLM",
    "Evaluation harness for tutor-response classification across Gemini, Groq, and Hugging Face.",
    "The README is an automated baseline: clone, move into the repo, and score LLM tutor responses. It is a measurement project, with the Colab path written into the instructions.",
    ["Python", "Gemini", "Groq"],
    "AI",
    "Python"
  ),
  work(
    "Micrograd",
    "Micrograd",
    "A small autograd engine and neural-net library with an API server in front of it.",
    "The tree includes setup.py, model templates, and main.py as the API entry. It is a from-scratch gradient engine with a service wrapper, in the spirit of Karpathy's micrograd and extended with an HTTP surface.",
    ["Python", "Autograd"],
    "AI",
    "Python"
  ),
  work(
    "Data-Cleaner",
    "Data Cleaner",
    "A notebook bench for tracking data-cleaning experiments in one place.",
    "The README asks for a robust cleaner and a record of every experiment. The repo is that bench: Jupyter notebooks where the cleaning trials live.",
    ["Python", "Jupyter"],
    "AI",
    "Jupyter Notebook"
  ),
  work(
    "NLP_7th",
    "NLP Notebooks",
    "Course notebooks for NLP, kept public so the work can be checked.",
    "The README is the course title. These are the 7th-semester NLP notebooks, published as study work rather than a product.",
    ["Python", "NLP"],
    "Lab",
    "Jupyter Notebook"
  ),
  work(
    "Music_Gen",
    "Music Gen",
    "A public music-generation repo, still thin on documentation.",
    "There is no description beyond the title. It stays in the archive as public code, not as a finished instrument.",
    ["Python"],
    "AI",
    "Python"
  ),
  work(
    "Dialysis-Data-Mining-Model",
    "Dialysis Data Mining",
    "A data-mining model repo beside the dialysis EDA coursework.",
    "The public model repository stands apart from the forked class assignment. The README does not describe a clinical deployment, so it is listed as the modeling code only.",
    ["Python", "Data Mining"],
    "AI",
    "Python"
  ),
  work(
    "Agent_to_Agent",
    "Agent to Agent",
    "A public agent-to-agent experiment with the README still at the title.",
    "Listed because the repository is public and original. The write-up is not there yet, so the page does not invent a protocol or a demo.",
    ["Agents"],
    "AI",
    "Python"
  ),
  work(
    "WasteSort-AI",
    "WasteSort AI",
    "A waste-sorting product in progress. The README says the deploy is still being retried.",
    "The author note in the repo is honest: update later, after the project is complete, and switch frameworks if the deploy fails. It is on the site as active work, not as a launched classifier.",
    ["TypeScript", "Computer Vision"],
    "AI",
    "TypeScript"
  ),
  work(
    "MoviesMania",
    "Movies Mania",
    "A local, Netflix-style player for video files that never leave the machine.",
    "start.bat installs dependencies, builds the web app, and opens localhost:4000. Movies are added on disk. Nothing in the README sends the library to a remote host.",
    ["JavaScript", "Node.js"],
    "Products",
    "JavaScript"
  ),
  work(
    "E-Cart",
    "E-Cart",
    "A JavaScript storefront, public as a build rather than a store with customers attached.",
    "The README is the project name. The repository is the public e-commerce code, and this page does not add sales or user numbers the repo does not claim.",
    ["JavaScript"],
    "Products",
    "JavaScript"
  ),
  work(
    "Wedding_Web",
    "Wedding Web",
    "A wedding site repository, public on GitHub.",
    "The README is the title. The repo is the source for the wedding web build. Live behavior belongs to whatever deploy is wired from this code, not to a claim pasted here.",
    ["JavaScript", "MERN"],
    "Products",
    "JavaScript"
  ),
  work(
    "Inventory_management",
    "Inventory",
    "An inventory manager in JavaScript, published with the source as the proof.",
    "The README does not expand past the title. The repository is the public inventory system, listed so the code can be opened directly.",
    ["JavaScript", "MERN"],
    "Products",
    "JavaScript"
  ),
  work(
    "spotify_clone",
    "Spotify Clone",
    "A JavaScript music-player clone.",
    "No README is published on the repo. It is included as the public Spotify-style player, without a feature list the code has not documented.",
    ["JavaScript"],
    "Products",
    "JavaScript"
  ),
  work(
    "tour_travels",
    "Tours & Travels",
    "A travel-site build, written up by its author as a response to a problem he actually hit.",
    "The README is a short note: a similar product, made because of a problem faced. Styling-heavy public source, not a booking company.",
    ["CSS", "JavaScript"],
    "Products",
    "CSS"
  ),
  work(
    "zomato",
    "Zomato Clone",
    "A Zomato-style interface the README says is ready to open in the browser.",
    "The only claim in the repo is that the clone is ready to view on the web. It is a UI study of the product, kept public.",
    ["HTML", "CSS"],
    "Products",
    "HTML"
  ),
  work(
    "NURSE_CALLING_SYSTEM",
    "Nurse Calling",
    "A nurse-calling system in JavaScript.",
    "The README is the project title. The repo is public so the calling-system code can be reviewed on its own terms.",
    ["JavaScript"],
    "Products",
    "JavaScript"
  ),
  work(
    "Learning2",
    "BlackBookEDU",
    "A fresh backend scaffold for paid learning content: Express, MongoDB, and JWT.",
    "The README specifies Node, Express, Mongoose, passport-jwt for users and admins, and records for paid content and purchases. It presents itself as a scaffold to copy into a new repo.",
    ["Node.js", "MongoDB", "JWT"],
    "Products",
    "JavaScript"
  ),
  work(
    "CrowdStats",
    "CrowdStats",
    "The public CrowdStats repository from the hackathon work.",
    "GitHub has no README on this repo. It stays in the archive under its name so the TypeScript source is part of the public record.",
    ["TypeScript"],
    "Products",
    "TypeScript"
  ),
  work(
    "hackodisha2024",
    "HackOdisha 2024",
    "The HackOdisha 2024 repository.",
    "No README is attached. The repo is the public code from that hackathon entry.",
    ["JavaScript"],
    "Campus",
    "JavaScript"
  ),
  work(
    "CryptoCurrency",
    "Crypto Dashboard",
    "A cryptocurrency interface repo with the README still at the title.",
    "Public source only. No market data, exchange, or user count is claimed here.",
    ["JavaScript"],
    "Products",
    "JavaScript"
  ),
  work(
    "sports",
    "Sports",
    "An earlier sports JavaScript repo, sibling to GGStats.",
    "No README. Kept in the archive so the earlier sports code is not invisible next to the later dashboard.",
    ["JavaScript"],
    "Products",
    "JavaScript"
  ),
  work(
    "MernStack",
    "MERN Stack",
    "A public MERN practice repository.",
    "The README is the folder name. It is study-and-build source, grouped with the other full-stack repos.",
    ["MongoDB", "Express", "React", "Node.js"],
    "Lab",
    "JavaScript"
  ),
  work(
    "Worker",
    "Worker",
    "A Next.js app created from the default starter.",
    "The README is the create-next-app text. It is not presented as a shipped product.",
    ["Next.js"],
    "Lab",
    "TypeScript"
  ),
  work(
    "project",
    "Project",
    "A JavaScript repository with no README.",
    "Included so the public list is complete. Open the tree to see what the folder actually contains.",
    ["JavaScript"],
    "Lab",
    "JavaScript"
  ),
  work(
    "odisha",
    "Odisha",
    "A JavaScript repository with no README.",
    "Public and original. No description is invented beyond the repo name.",
    ["JavaScript"],
    "Lab",
    "JavaScript"
  ),
  work(
    "Demo",
    "Demo",
    "A small public HTML demo.",
    "No README. Listed as a demo file, not a product.",
    ["HTML"],
    "Lab",
    "HTML"
  ),
  work(
    "IIITSurat_SF",
    "Spring Fiesta",
    "The IIIT Surat Spring Fiesta site, in TypeScript.",
    "The README is the repo name. This is the public event-site source for Spring Fiesta.",
    ["TypeScript", "Next.js"],
    "Campus",
    "TypeScript"
  ),
  work(
    "IIITSurat_COC",
    "Clash of Clans Cup",
    "A tournament board: teams, fixtures, a points table, and a bracket.",
    "The README lists a public teams page, a schedule of matches, a leaderboard scored win 3 / draw 1 / loss 0, and a round-grouped bracket. Admin actions use a simple password header.",
    ["JavaScript", "Next.js"],
    "Campus",
    "JavaScript"
  ),
  work(
    "StarWars",
    "Star Wars Scene",
    "A public Star Wars scene repository.",
    "The README is the title. It is the public home of the cinematic scene work, without a shot list attached.",
    ["Unreal Engine"],
    "Games",
    "Unreal"
  ),
  work(
    "Secret_Level",
    "Secret Level",
    "The Secret Level game repository.",
    "No README is published. The repo is listed under games so the project name stays on the public record.",
    ["Unreal Engine"],
    "Games",
    "Unreal"
  ),
  work(
    "fun",
    "Fun",
    "A C++ folder the author describes as fun coding.",
    "Small public C++ experiments. Not a product, and not dressed up as one.",
    ["C++"],
    "Lab",
    "C++"
  ),
  work(
    "LayeredVoronoi",
    "Layered Voronoi",
    "A public Voronoi experiment.",
    "The README is the title. Related to the sensor-coverage reading, and kept as the code repo rather than the paper.",
    ["Geometry"],
    "Lab",
    "Python"
  ),
  work(
    "Jeevant010",
    "Profile README",
    "The GitHub profile repository: the old badge wall and pinned cards.",
    "This repo is the profile README, not an application. The portfolio site replaces that page as the place where the work is explained.",
    ["Markdown"],
    "Lab",
    "TypeScript"
  ),
  work(
    "Notes",
    "Notes",
    "A public notes repository.",
    "The README is the title. Study notes, published as-is.",
    ["Markdown"],
    "Lab",
    "Markdown"
  ),
  work(
    "os",
    "Operating Systems",
    "Notes for the operating-systems course at IIIT Surat, third semester.",
    "The README says the repo holds the OS subject content from the second year at IIIT Surat. It is coursework, labeled as coursework.",
    ["OS"],
    "Lab",
    "Markdown"
  ),
  work(
    "College",
    "College",
    "A TypeScript folder for college work.",
    "README is the title. Campus code, not a company product.",
    ["TypeScript"],
    "Campus",
    "TypeScript"
  ),
  work(
    "CS",
    "CS",
    "A Python coursework repository with no README.",
    "Public course code. Open the tree for the assignments.",
    ["Python"],
    "Lab",
    "Python"
  ),
  work(
    "Code",
    "Code",
    "A public C++ scratch repository.",
    "The README is the title. Practice code.",
    ["C++"],
    "Lab",
    "C++"
  ),
  work(
    "Leet",
    "Leet",
    "C++ solutions and practice.",
    "No long README. The repo is the public LeetCode-style practice set.",
    ["C++"],
    "Lab",
    "C++"
  ),
  work(
    "Datasets",
    "Datasets",
    "A public datasets folder.",
    "The README is the title. Data, not an application.",
    ["Data"],
    "Lab",
    "Data"
  ),
  work(
    "Bigram",
    "Bigram",
    "Notebooks for a bigram language model.",
    "The README is the title. This is the public n-gram modeling work, sitting next to the mini GPT as the earlier language-model step.",
    ["PyTorch", "NLP"],
    "AI",
    "Jupyter Notebook"
  ),
];

export const WORK_LANES: WorkLane[] = ["AI", "Games", "Products", "Campus", "Lab"];

export function getPublicWork(slug: string) {
  const key = slug.toLowerCase();
  return PUBLIC_WORK.find((item) => item.slug.toLowerCase() === key) ?? null;
}

export function laneCounts(works: PublicWork[] = PUBLIC_WORK) {
  return WORK_LANES.map((lane) => ({
    lane,
    count: works.filter((item) => item.lane === lane).length,
  }));
}
