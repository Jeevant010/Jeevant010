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
  }
];

export default function SpacePlans() {
  return (
    <main className='max-w-2xl mx-auto py-12'>
      <h2 className='text-3xl font-bold mb-4'>Space Plans</h2>
      <p className='mb-8'>Here you can track your ambitions, strategic goals, and future milestones. All data is private and editable via the UI.</p>
      <section>
        {mockPlans.map((plan, idx) => (
          <div key={idx} className="mb-6 p-4 rounded bg-gray-50 border">
            <h3 className="text-xl font-semibold">{plan.title}</h3>
            <p className="mb-2">{plan.description}</p>
            <div className="flex gap-4 text-sm">
              <span>Status: <strong>{plan.status}</strong></span>
              <span>Repo: <strong>{plan.repo}</strong></span>
              <span>Milestone: <strong>{plan.milestone}</strong></span>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}