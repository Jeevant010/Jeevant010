const sampleProjects = [
  {
    name: "GGStats",
    description: "Game stats dashboard built with React and Node.js.",
    link: "https://github.com/Jeevant010/GGStats",
  },
  {
    name: "Water Management",
    description: "Water resource optimization platform.",
    link: "https://github.com/Jeevant010/Water_Management",
  },
];

export default function Projects() {
  return (
    <section className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-2">Featured Projects</h2>
      <div className="space-y-3">
        {sampleProjects.map((p, i) => (
          <a
            key={i}
            href={p.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block border rounded p-3 hover:bg-gray-50"
          >
            <div className="font-semibold">{p.name}</div>
            <div className="text-gray-600 text-sm">{p.description}</div>
          </a>
        ))}
      </div>
    </section>
  );
}
