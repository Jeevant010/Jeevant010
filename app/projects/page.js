const projects = [
  {
    name: "GGStats",
    url: "https://github.com/Jeevant010/GGStats",
    description: "Game stats dashboard with React/Node.js.",
    tags: ["React", "Node.js", "MongoDB"],
  },
  {
    name: "fun",
    url: "https://github.com/Jeevant010/fun",
    description: "Fun experiments in web and backend.",
    tags: ["Python", "Web"],
  },
  {
    name: "Jeevant010",
    url: "https://github.com/Jeevant010/Jeevant010",
    description: "Portfolio and dashboard site.",
    tags: ["Next.js", "TailwindCSS"],
  },
  {
    name: "M_Mart",
    url: "https://github.com/RakeshParkash/M_Mart",
    description: "E-commerce platform (contributor).",
    tags: ["React", "Node.js", "MongoDB"],
  },
  {
    name: "Water_Management",
    url: "https://github.com/Jeevant010/Water_Management",
    description: "Water resource management app.",
    tags: ["React", "Express"],
  },
];

export default function Projects() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">Projects</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {projects.map((project, idx) => (
          <a
            key={idx}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white border border-blue-100 rounded-lg shadow hover:scale-105 transition p-4"
          >
            <h3 className="font-bold text-blue-700">{project.name}</h3>
            <p className="text-gray-600">{project.description}</p>
            <div className="flex gap-2 mt-2">
              {project.tags.map(tag => (
                <span key={tag} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{tag}</span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}