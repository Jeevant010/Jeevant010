import React from 'react';

const mockPlans = [
  {
    title: "GGStats Improvements",
    description: "Add new analytics for match history in GGStats project.",
    status: "In Progress",
    repo: "Jeevant010/GGStats",
    milestone: "v2.0 Launch"
  },
  {
    title: "Personal Website Revamp",
    description: "Update portfolio and blog sections for Jeevant010.",
    status: "Planned",
    repo: "Jeevant010/Jeevant010",
    milestone: "Q4 2025"
  },
  {
    title: "fun Repo Gamification",
    description: "Implement leaderboard and badges system.",
    status: "Idea",
    repo: "Jeevant010/fun",
    milestone: "2025-10"
  },
  {
    title: "Water Management Dashboard",
    description: "Build a dashboard for water usage analytics.",
    status: "Blocked",
    repo: "Jeevant010/Water_Management",
    milestone: "-"
  },
];

export default function SpacePlans() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h2 className="text-4xl font-bold mb-6 text-blue-700">🚀 Space Plans</h2>
      <p className="mb-8 text-gray-700">Track your ambitions, strategic goals, and future milestones. All data is private and editable via the UI.</p>
      <section className="grid gap-6">
        {mockPlans.map((plan, idx) => (
          <div key={idx} className="bg-white border shadow rounded-lg p-6 hover:scale-[1.01] transition">
            <h3 className="text-2xl font-semibold mb-2 text-blue-600">{plan.title}</h3>
            <p className="mb-3 text-gray-800">{plan.description}</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="px-2 py-1 rounded bg-blue-50 text-blue-700">Status: <strong>{plan.status}</strong></span>
              <span className="px-2 py-1 rounded bg-gray-50 text-gray-600">Repo: <strong>{plan.repo}</strong></span>
              <span className="px-2 py-1 rounded bg-green-50 text-green-600">Milestone: <strong>{plan.milestone}</strong></span>
            </div>
          </div>
        ))}
      </section>
      <div className="mt-10 text-center text-gray-500">[Editing UI coming soon]</div>
    </main>
  );
}