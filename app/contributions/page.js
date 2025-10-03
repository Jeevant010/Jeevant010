import { contributions } from "../../lib/contributions";

export default function Contributions() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">Contributions</h2>
      <div className="space-y-6">
        {contributions.map((c) => (
          <a
            key={c.name}
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white border border-green-100 rounded-lg shadow hover:scale-105 transition p-4"
          >
            <h3 className="font-bold text-green-700">{c.name}</h3>
            <p className="text-gray-600">{c.description}</p>
            <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs mt-2 inline-block">
              PRs: {c.pr_count}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}