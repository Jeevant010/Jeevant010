import React, { useState } from 'react';

const mockTasks = [
  { task: "Review PRs on GGStats", scheduled: "09:30 AM", repo: "Jeevant010/GGStats", completed: false },
  { task: "Update README for Water_Management", scheduled: "11:00 AM", repo: "Jeevant010/Water_Management", completed: true },
  { task: "Plan new features for fun repo", scheduled: "02:00 PM", repo: "Jeevant010/fun", completed: false },
  { task: "Sync with M_Mart contributors", scheduled: "03:30 PM", repo: "RakeshParkash/M_Mart", completed: false },
  { task: "Publish new blog post", scheduled: "05:00 PM", repo: "Jeevant010/Jeevant010", completed: false },
  { task: "Test water sensors", scheduled: "06:30 PM", repo: "Jeevant010/Water_Management", completed: false }
];

export default function TaskSchedules() {
  const [tasks] = useState(mockTasks);

  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h2 className="text-4xl font-bold mb-6 text-pink-700">📅 Tasks & Schedules</h2>
      <p className="mb-8 text-gray-700">Plan, organize, and track your daily tasks and schedules. All data is private and editable via UI.</p>
      <ul className="grid gap-5">
        {tasks.map((t, idx) => (
          <li key={idx} className={`p-5 rounded-lg border shadow flex flex-col gap-2 ${
            t.completed ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          }`}> 
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">{t.task}</span>
              <span className="text-sm px-2 py-1 bg-gray-100 rounded">{t.scheduled}</span>
            </div>
            <div className="text-xs text-gray-600">Repo: {t.repo}</div>
            <div>
              <span className={t.completed ? "text-green-700 font-bold" : "text-yellow-700 font-bold"}>
                {t.completed ? "Completed" : "Pending"}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-10 text-center text-gray-500">[Editing UI coming soon]</div>
    </main>
  );
}