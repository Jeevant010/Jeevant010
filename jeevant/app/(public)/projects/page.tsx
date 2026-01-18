import Link from "next/link";
import { Github, ExternalLink, Layers, Cpu } from "lucide-react";

export default function ProjectsPage() {
  const projects = [
    {
      title: "EcoSort AI",
      desc: "Sustainability tool utilizing AI to identify recyclable materials and suggest upcycling ideas.",
      tags: ["Python", "TensorFlow", "React", "Node.js"],
      type: "AI Agent",
      links: { repo: "#", live: "#" }
    },
    {
      title: "M-Mart E-Commerce",
      desc: "Multi-vendor marketplace with role-based access control, Stripe payments, and admin inventory panels.",
      tags: ["MERN Stack", "Stripe", "Redux"],
      type: "Full Stack",
      links: { repo: "https://github.com/RakeshParkash/M_Mart", live: "https://m-mart-eight.vercel.app" }
    },
    {
      title: "AI Resume Parser",
      desc: "NLP pipeline using spaCy to extract skills and education from PDFs, exposed via REST API.",
      tags: ["Python", "spaCy", "FastAPI"],
      type: "ML Pipeline",
      links: { repo: "https://github.com/Jeevant010/Resume_Parser", live: "#" }
    },
    {
      title: "GGSports Analytics",
      desc: "Sports analytics hub with prediction models and automated retraining via CI/CD pipelines.",
      tags: ["React", "Python", "Docker"],
      type: "Full Stack + ML",
      links: { repo: "https://github.com/Jeevant010/GGStats", live: "#" }
    }
  ];

  return (
    <div className="py-10">
      <h1 className="text-4xl font-bold text-white mb-8">
        <span className="text-blue-500">/</span>projects
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project, idx) => (
          <div key={idx} className="glass-card rounded-xl p-6 hover:border-blue-500/30 transition group flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-800 rounded-lg text-blue-400 group-hover:text-white group-hover:bg-blue-600 transition">
                {project.type.includes("AI") || project.type.includes("ML") ? <Cpu size={20} /> : <Layers size={20} />}
              </div>
              <div className="flex gap-3">
                <Link href={project.links.repo} className="text-slate-400 hover:text-white transition"><Github size={20} /></Link>
                {project.links.live !== "#" && (
                  <Link href={project.links.live} className="text-slate-400 hover:text-white transition"><ExternalLink size={20} /></Link>
                )}
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
              {project.desc}
            </p>

            <div className="flex flex-wrap gap-2 mt-auto">
              {project.tags.map((tag, tIdx) => (
                <span key={tIdx} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}