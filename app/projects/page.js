import { projects } from "../../lib/projects";

export default function Projects() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">Projects</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div key={project.slug} className="block bg-white border border-blue-100 rounded-lg shadow p-4">
            <h3 className="font-bold text-blue-700">{project.name}</h3>
            <p className="text-gray-600">{project.description}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {project.tags.map((tag) => (
                <span key={tag} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{tag}</span>
              ))}
            </div>
            <div className="flex gap-4 mt-3">
              <a className="text-blue-600 hover:underline" href={`/projects/${project.slug}`}>Details →</a>
              <a className="text-gray-600 hover:underline" href={project.url} target="_blank" rel="noopener noreferrer">
                Repository ↗
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}